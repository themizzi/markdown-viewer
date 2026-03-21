import path from "node:path";
import { promises as fs } from "node:fs";
import { pathToFileURL } from "node:url";
import { app, BrowserWindow, ipcMain, Menu } from "electron";
import chokidar from "chokidar";
import { marked } from "marked";
import { FileReaderService } from "./fileReader";
import { FileWatcherService } from "./fileWatcher";
import { MarkedMarkdownService } from "./markdownService";
import { ViewerController } from "./viewerController";
import { createApplicationMenu } from "./applicationMenu";
import { COMMANDS } from "./commands";
import { showOpenFileDialog } from "./openFileDialog";
import { openFileFlow } from "./openFileFlow";
import { resolveStartupFile } from "./startupOpenBehavior";
import { initializeSidebarIntegration, setMainWindow } from "./sidebarIntegration";
import type { SidebarVisibility } from "./sidebarVisibility";

const IPC_GET_HTML = "viewer:get-html";
const IPC_HTML_UPDATED = "viewer:html-updated";
const IPC_OPEN_FILE = "viewer:open-file";  // For e2e testing

let mainWindow: BrowserWindow | null = null;
let automationWindow: BrowserWindow | null = null;
let controller: ViewerController | null = null;
let sidebarVisibility: SidebarVisibility | undefined = undefined;

function executeCommand(command: string): void {
  switch (command) {
    case "toggle-toc":
      sidebarVisibility?.toggle();
      break;
    case "open-file":
      void handleOpenRequest().catch((error) => {
        console.error("Failed to open file:", error);
      });
      break;
  }
}

function installBeforeInputEventHandler(window: BrowserWindow): void {
  interface Input {
    type: string;
    key: string;
    code: string;
  }
  window.webContents.on("before-input-event", (_event, input: Input) => {
    if (input.key === COMMANDS.toggleToc.shortcut && input.type === "keyDown") {
      executeCommand("toggle-toc");
    }
  });
}

function configureViewerWindow(window: BrowserWindow): void {
  window.setSize(1000, 760);
  window.setSkipTaskbar(false);
  window.setFocusable(true);

  const rendererUrl = process.env.ELECTRON_RENDERER_URL;
  if (!app.isPackaged && rendererUrl) {
    try {
      const parsedRendererUrl = new URL(rendererUrl);
      if (parsedRendererUrl.protocol === "http:" || parsedRendererUrl.protocol === "https:") {
        void window.loadURL(rendererUrl);
        return;
      }
    } catch {
      // Ignore invalid ELECTRON_RENDERER_URL and fall back to local renderer file.
    }
  }

  void window.loadFile(path.join(__dirname, "../renderer/index.html"));
}

async function openOrStartFile(filePath: string): Promise<void> {
  const window = ensureViewerWindow();

  if (!controller) {
    const fileReader = new FileReaderService(fs);
    const fileWatcher = new FileWatcherService(chokidar);

    marked.setOptions({ gfm: true });
    const markdownService = new MarkedMarkdownService(marked);

    controller = new ViewerController(
      fileReader,
      fileWatcher,
      markdownService,
      (document) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send(IPC_HTML_UPDATED, document);
        }
      }
    );
  }

  if (controller.getFocusedFilePath()) {
    await controller.openFile(filePath);
  } else {
    await controller.start(filePath);
  }

  if (!window.isVisible()) {
    window.show();
  }
}

async function handleOpenRequest(): Promise<void> {
  await openFileFlow(
    () => controller?.getFocusedFilePath() ?? "",
    showOpenFileDialog,
    async (filePath) => {
      await openOrStartFile(filePath);
    }
  );
}

function installApplicationMenu(): void {
  const menu = createApplicationMenu(
    () => executeCommand("open-file"),
    () => executeCommand("toggle-toc")
  );

  Menu.setApplicationMenu(menu);
}

function createWindow(): BrowserWindow {
  const isDev = !app.isPackaged && Boolean(process.env.ELECTRON_RENDERER_URL);
  const window = new BrowserWindow({
    width: 1000,
    height: 760,
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: !isDev
    }
  });

  configureViewerWindow(window);
  installBeforeInputEventHandler(window);

  return window;
}

function shouldCreateAutomationWindow(argv: string[]): boolean {
  return Boolean(process.env.WDIO_WORKER_ID) || argv.some((value) =>
    value === '--enable-automation' ||
    value.startsWith('--remote-debugging-port=') ||
    value.startsWith('--inspect=')
  );
}

function createAutomationWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 1,
    height: 1,
    show: false,
    titleBarStyle: "hiddenInset",
    focusable: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  void window.loadURL('data:text/html,<html><body>automation</body></html>');
  return window;
}

function ensureViewerWindow(): BrowserWindow {
  if (mainWindow && !mainWindow.isDestroyed()) {
    return mainWindow;
  }

  if (automationWindow && !automationWindow.isDestroyed()) {
    mainWindow = automationWindow;
    automationWindow = null;
    configureViewerWindow(mainWindow);
    setMainWindow(mainWindow);
    return mainWindow;
  }

  mainWindow = createWindow();
  setMainWindow(mainWindow);
  return mainWindow;
}

function registerIpcHandlers(): void {
  ipcMain.handle(IPC_GET_HTML, async () => controller?.getHtml() ?? {
    html: "<p>Loading...</p>",
    baseHref: pathToFileURL(`${process.cwd()}${path.sep}`).href,
  });

  if (!app.isPackaged) {
    ipcMain.handle(IPC_OPEN_FILE, async (_event: unknown, filePath: string) => {
      try {
        await openOrStartFile(filePath);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    });
  }
}

function registerActivateHandler(): void {
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length > 0) {
      return;
    }

    if (controller?.getFocusedFilePath()) {
      ensureViewerWindow().show();
      return;
    }

    void handleOpenRequest().catch((error) => {
      console.error("Failed to open file on activate:", error);
    });
  });
}

app.whenReady().then(async () => {
  const args = process.argv.slice(2);

  // Initialize sidebar integration (will create IPC handlers and menu sync)
  sidebarVisibility = await initializeSidebarIntegration();

  installApplicationMenu();
  registerIpcHandlers();
  registerActivateHandler();

  if (shouldCreateAutomationWindow(args)) {
    automationWindow = createAutomationWindow();
  }
  
  const startupResolution = await resolveStartupFile(process.argv.slice(2));

  if (startupResolution.kind === "no-startup-file-selected") {
    return;
  }

  await openOrStartFile(startupResolution.filePath!);
});

app.on("before-quit", async () => {
  if (controller) {
    await controller.stop();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

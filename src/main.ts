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
import { showOpenFileDialog } from "./openFileDialog";
import { openFileFlow } from "./openFileFlow";
import { resolveStartupFile } from "./startupOpenBehavior";

const IPC_GET_HTML = "viewer:get-html";
const IPC_HTML_UPDATED = "viewer:html-updated";
const IPC_OPEN_FILE = "viewer:open-file";  // For e2e testing

let mainWindow: BrowserWindow | null = null;
let automationWindow: BrowserWindow | null = null;
let controller: ViewerController | null = null;

function configureViewerWindow(window: BrowserWindow): void {
  window.setSize(1000, 760);
  window.setSkipTaskbar(false);
  window.setFocusable(true);

  void window.loadFile(path.join(__dirname, "../src/index.html"));

  const menu = createApplicationMenu(() => {
    void openFileFlow(
      () => controller?.getFocusedFilePath() ?? "",
      showOpenFileDialog,
      async (filePath) => {
        if (controller) {
          await controller.openFile(filePath);
        }
      }
    ).catch((error) => {
      console.error("Failed to open file:", error);
    });
  });
  Menu.setApplicationMenu(menu);
}

function createWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 1000,
    height: 760,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  configureViewerWindow(window);

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
    focusable: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  void window.loadURL('data:text/html,<html><body>automation</body></html>');
  return window;
}

app.whenReady().then(async () => {
  const args = process.argv.slice(2);

  if (shouldCreateAutomationWindow(args)) {
    automationWindow = createAutomationWindow();
  }
  
  const startupResolution = await resolveStartupFile(process.argv.slice(2));

  if (startupResolution.kind === "no-startup-file-selected") {
    return;
  }

  // startupResolution.kind === "file-path-resolved"
  if (automationWindow && !automationWindow.isDestroyed()) {
    mainWindow = automationWindow;
    automationWindow = null;
    configureViewerWindow(mainWindow);
    mainWindow.show();
  } else {
    mainWindow = createWindow();
  }

  const filePath = startupResolution.filePath!;
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

  ipcMain.handle(IPC_GET_HTML, async () => controller?.getHtml() ?? {
    html: "<p>Loading...</p>",
    baseHref: pathToFileURL(`${process.cwd()}${path.sep}`).href,
  });

  // IPC handler for e2e testing - only register in dev/test builds
  if (!app.isPackaged) {
    ipcMain.handle(IPC_OPEN_FILE, async (_event: unknown, filePath: string) => {
      if (controller) {
        await controller.openFile(filePath);
        return { success: true };
      }
      return { success: false, error: 'Controller not initialized' };
    });
  }

  await controller.start(filePath);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
      const document = controller?.getHtml() ?? {
        html: "<p>Loading...</p>",
        baseHref: pathToFileURL(`${process.cwd()}${path.sep}`).href,
      };
      mainWindow.webContents.send(IPC_HTML_UPDATED, document);
    }
  });
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

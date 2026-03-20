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

const IPC_GET_HTML = "viewer:get-html";
const IPC_HTML_UPDATED = "viewer:html-updated";
const IPC_OPEN_FILE = "viewer:open-file";  // For e2e testing

let mainWindow: BrowserWindow | null = null;
let controller: ViewerController | null = null;

function resolveMarkdownPath(argv: string[]): string {
  const flaggedCandidate = argv
    .find((value) => value.startsWith("--test-file="))
    ?.slice("--test-file=".length);

  if (flaggedCandidate) {
    return path.resolve(process.cwd(), flaggedCandidate);
  }

  const candidates = argv.filter((value) => !value.startsWith("-"));
  const preferredCandidate = [...candidates].reverse().find((value) => value.endsWith(".md"));
  const candidate = preferredCandidate ?? candidates.at(-1);
  return path.resolve(process.cwd(), candidate ?? "README.md");
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

  return window;
}

app.whenReady().then(async () => {
  mainWindow = createWindow();

  const filePath = resolveMarkdownPath(process.argv.slice(2));
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
    ipcMain.handle(IPC_OPEN_FILE, async (_event, filePath: string) => {
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

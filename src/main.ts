import path from "node:path";
import { app, BrowserWindow, ipcMain } from "electron";
import { FileService } from "./fileService";
import { MarkedMarkdownService } from "./markdownService";
import { ViewerController } from "./viewerController";

const IPC_GET_HTML = "viewer:get-html";
const IPC_HTML_UPDATED = "viewer:html-updated";

let mainWindow: BrowserWindow | null = null;
let controller: ViewerController | null = null;

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
  return window;
}

app.whenReady().then(async () => {
  mainWindow = createWindow();

  const filePath = path.resolve(process.cwd(), process.argv[2] ?? "README.md");
  const fileService = new FileService();
  const markdownService = new MarkedMarkdownService();

  controller = new ViewerController(
    fileService,
    fileService,
    markdownService,
    (html) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send(IPC_HTML_UPDATED, html);
      }
    }
  );

  ipcMain.handle(IPC_GET_HTML, async () => controller?.getHtml() ?? "<p>Loading...</p>");

  await controller.start(filePath);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
      const html = controller?.getHtml() ?? "<p>Loading...</p>";
      mainWindow.webContents.send(IPC_HTML_UPDATED, html);
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
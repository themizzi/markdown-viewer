import { contextBridge, ipcRenderer } from "electron";
import type { RenderedDocument } from "./contracts";

const IPC_GET_HTML = "viewer:get-html";
const IPC_HTML_UPDATED = "viewer:html-updated";
const IPC_OPEN_FILE = "viewer:open-file";

const api = {
  getHtml: (): Promise<RenderedDocument> => ipcRenderer.invoke(IPC_GET_HTML),
  onHtmlUpdated: (handler: (document: RenderedDocument) => void): (() => void) => {
    const listener = (_event: unknown, document: RenderedDocument): void => handler(document);
    ipcRenderer.on(IPC_HTML_UPDATED, listener);
    return () => {
      ipcRenderer.removeListener(IPC_HTML_UPDATED, listener);
    };
  },
};

// Only expose file open in dev/test builds
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  (api as { openFile?: (filePath: string) => Promise<{ success: boolean; error?: string }> }).openFile = 
    (filePath: string) => ipcRenderer.invoke(IPC_OPEN_FILE, filePath);
}

contextBridge.exposeInMainWorld("viewerApi", api);

import { contextBridge, ipcRenderer } from "electron";
import type { RenderedDocument } from "./contracts";

const IPC_GET_HTML = "viewer:get-html";
const IPC_HTML_UPDATED = "viewer:html-updated";
const IPC_OPEN_FILE = "viewer:open-file";

contextBridge.exposeInMainWorld("viewerApi", {
  getHtml: (): Promise<RenderedDocument> => ipcRenderer.invoke(IPC_GET_HTML),
  onHtmlUpdated: (handler: (document: RenderedDocument) => void): (() => void) => {
    const listener = (_event: unknown, document: RenderedDocument): void => handler(document);
    ipcRenderer.on(IPC_HTML_UPDATED, listener);
    return () => {
      ipcRenderer.removeListener(IPC_HTML_UPDATED, listener);
    };
  },
  // For e2e testing: directly open a file
  openFile: (filePath: string): Promise<{ success: boolean; error?: string }> => 
    ipcRenderer.invoke(IPC_OPEN_FILE, filePath)
});

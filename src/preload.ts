import { contextBridge, ipcRenderer } from "electron";

const IPC_GET_HTML = "viewer:get-html";
const IPC_HTML_UPDATED = "viewer:html-updated";

contextBridge.exposeInMainWorld("viewerApi", {
  getHtml: (): Promise<string> => ipcRenderer.invoke(IPC_GET_HTML),
  onHtmlUpdated: (handler: (html: string) => void): (() => void) => {
    const listener = (_event: unknown, html: string): void => handler(html);
    ipcRenderer.on(IPC_HTML_UPDATED, listener);
    return () => {
      ipcRenderer.removeListener(IPC_HTML_UPDATED, listener);
    };
  }
});
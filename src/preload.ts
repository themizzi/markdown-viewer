import { contextBridge, ipcRenderer } from "electron";
import type { CommandShortcuts, RenderedDocument, FullscreenApi, SidebarApi } from "./contracts";
import { COMMANDS } from "./commands";

const IPC_GET_HTML = "viewer:get-html";
const IPC_HTML_UPDATED = "viewer:html-updated";
const IPC_OPEN_FILE = "viewer:open-file";
const IPC_TOGGLE_TOC = "viewer:toggle-toc";
const IPC_SIDEBAR_GET_INITIAL_VISIBILITY = "sidebar:get-initial-visibility";
const IPC_SIDEBAR_REQUEST_TOGGLE = "sidebar:request-toggle";
const IPC_SIDEBAR_VISIBILITY_CHANGED = "sidebar:visibility-changed";
const IPC_FULLSCREEN_GET_INITIAL_STATE = "viewer:fullscreen-get-initial-state";
const IPC_FULLSCREEN_CHANGED = "viewer:fullscreen-changed";

const commands: CommandShortcuts = {
  toggleTocShortcut: COMMANDS.toggleToc.shortcut,
  toggleTocDescription: COMMANDS.toggleToc.description
};

const api: {
  getHtml: () => Promise<RenderedDocument>;
  onHtmlUpdated: (handler: (document: RenderedDocument) => void) => () => void;
  sidebar: SidebarApi;
  commands: CommandShortcuts;
  toggleToc: () => Promise<void>;
  openFile?: (filePath: string) => Promise<{ success: boolean; error?: string }>;
} = {
  getHtml: (): Promise<RenderedDocument> => ipcRenderer.invoke(IPC_GET_HTML),
  toggleToc: (): Promise<void> => ipcRenderer.invoke(IPC_TOGGLE_TOC),
  onHtmlUpdated: (handler: (document: RenderedDocument) => void): (() => void) => {
    const listener = (_event: unknown, document: RenderedDocument): void => handler(document);
    ipcRenderer.on(IPC_HTML_UPDATED, listener);
    return () => {
      ipcRenderer.removeListener(IPC_HTML_UPDATED, listener);
    };
  },
  sidebar: {
    getInitialVisibility: (): Promise<boolean> =>
      ipcRenderer.invoke(IPC_SIDEBAR_GET_INITIAL_VISIBILITY),
    requestToggleSidebar: (): Promise<void> =>
      ipcRenderer.invoke(IPC_SIDEBAR_REQUEST_TOGGLE),
    onVisibilityChanged: (callback: (visible: boolean) => void): (() => void) => {
      const listener = (_event: unknown, visible: boolean): void => callback(visible);
      ipcRenderer.on(IPC_SIDEBAR_VISIBILITY_CHANGED, listener);
      return () => {
        ipcRenderer.removeListener(IPC_SIDEBAR_VISIBILITY_CHANGED, listener);
      };
    }
  } as SidebarApi,
  fullscreen: {
    getInitialState: (): Promise<boolean> =>
      ipcRenderer.invoke(IPC_FULLSCREEN_GET_INITIAL_STATE),
    onStateChanged: (callback: (isFullscreen: boolean) => void): (() => void) => {
      const listener = (_event: unknown, isFullscreen: boolean): void => callback(isFullscreen);
      ipcRenderer.on(IPC_FULLSCREEN_CHANGED, listener);
      return () => {
        ipcRenderer.removeListener(IPC_FULLSCREEN_CHANGED, listener);
      };
    }
  } as FullscreenApi,
  commands
};

// Only expose file open in dev/test builds
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  (api as { openFile?: (filePath: string) => Promise<{ success: boolean; error?: string }> }).openFile = 
    (filePath: string) => ipcRenderer.invoke(IPC_OPEN_FILE, filePath);
}

contextBridge.exposeInMainWorld("viewerApi", api);

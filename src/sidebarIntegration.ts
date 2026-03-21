import { ipcMain, Menu, BrowserWindow } from "electron";
import { SidebarVisibilityImpl, SidebarVisibility } from "./sidebarVisibility";

const IPC_SIDEBAR_GET_INITIAL_VISIBILITY = "sidebar:get-initial-visibility";
const IPC_SIDEBAR_REQUEST_TOGGLE = "sidebar:request-toggle";
const IPC_SIDEBAR_VISIBILITY_CHANGED = "sidebar:visibility-changed";

let mainWindow: BrowserWindow | null = null;

export function setMainWindow(window: BrowserWindow | null): void {
  mainWindow = window;
}

function setTocMenuChecked(visible: boolean): void {
  const appMenu = Menu.getApplicationMenu();
  if (!appMenu) return;

  const viewMenu = appMenu.items.find((item) => item.label === "View");
  if (!viewMenu?.submenu) return;

  const tocItem = (viewMenu.submenu as Menu).items.find(
    (item) => item.id === "view-toggle-table-of-contents"
  );
  if (tocItem) {
    tocItem.checked = visible;
  }
}

function registerSidebarIpcHandlers(visibility: SidebarVisibilityImpl): void {
  ipcMain.handle(IPC_SIDEBAR_GET_INITIAL_VISIBILITY, async () => {
    return visibility.getCurrentVisibility();
  });

  ipcMain.handle(IPC_SIDEBAR_REQUEST_TOGGLE, async () => {
    visibility.toggle();
  });
}

function subscribeToVisibilityChanges(visibility: SidebarVisibilityImpl): void {
  visibility.onVisibilityChange((visible: boolean) => {
    setTocMenuChecked(visible);

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(IPC_SIDEBAR_VISIBILITY_CHANGED, visible);
    }
  });
}

export async function initializeSidebarIntegration(): Promise<SidebarVisibility> {
  const visibility = new SidebarVisibilityImpl();

  registerSidebarIpcHandlers(visibility);
  subscribeToVisibilityChanges(visibility);

  return visibility;
}

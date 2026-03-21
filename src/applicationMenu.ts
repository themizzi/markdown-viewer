import { Menu, MenuItemConstructorOptions, app, shell } from "electron";

function createViewSubmenu(onToggleToc: () => void): MenuItemConstructorOptions[] {
  return [
    { role: "reload" as const },
    { role: "forceReload" as const },
    { role: "toggleDevTools" as const },
    { type: "separator" as const },
    { role: "resetZoom" as const },
    { role: "zoomIn" as const },
    { role: "zoomOut" as const },
    { type: "separator" as const },
    { role: "togglefullscreen" as const },
    { type: "separator" as const },
    {
      label: "Show Table of Contents",
      id: "view-toggle-table-of-contents",
      type: "checkbox" as const,
      checked: false,
      click: onToggleToc
    }
  ];
}

export function createApplicationMenu(
  onOpen: () => void = () => {},
  onToggleToc: () => void = () => {}
): Menu {
  const isMac = process.platform === "darwin";

  const template: MenuItemConstructorOptions[] = isMac
    ? [
        {
          label: app.name,
          submenu: [
            { role: "about" as const },
            { type: "separator" as const },
            { role: "services" as const },
            { type: "separator" as const },
            { role: "hide" as const },
            { role: "hideOthers" as const },
            { role: "unhide" as const },
            { type: "separator" as const },
            { role: "quit" as const }
          ]
        },
        {
          label: "File",
          submenu: [
            {
              label: "Open",
              accelerator: "CmdOrCtrl+O",
              id: "file-open",
              click: onOpen
            }
          ]
        },
        {
          label: "Edit",
          submenu: [
            { role: "undo" as const },
            { role: "redo" as const },
            { type: "separator" as const },
            { role: "cut" as const },
            { role: "copy" as const },
            { role: "paste" as const },
            { role: "delete" as const },
            { role: "selectAll" as const }
          ]
        },
        {
          label: "View",
          submenu: createViewSubmenu(onToggleToc)
        },
        {
          label: "Window",
          submenu: [
            { role: "minimize" as const },
            { role: "zoom" as const },
            { role: "close" as const }
          ]
        },
        {
          label: "Help",
          submenu: [
            {
              label: "Learn More",
              click: async () => {
                await shell.openExternal("https://github.com");
              }
            }
          ]
        }
      ]
    : [
        {
          label: "File",
          submenu: [
            {
              label: "Open",
              accelerator: "CmdOrCtrl+O",
              id: "file-open",
              click: onOpen
            }
          ]
        },
        {
          label: "Edit",
          submenu: [
            { role: "undo" as const },
            { role: "redo" as const },
            { type: "separator" as const },
            { role: "cut" as const },
            { role: "copy" as const },
            { role: "paste" as const },
            { role: "delete" as const },
            { type: "separator" as const },
            { role: "selectAll" as const }
          ]
        },
        {
          label: "View",
          submenu: createViewSubmenu(onToggleToc)
        }
      ];

  return Menu.buildFromTemplate(template);
}

export interface Command {
  id: string;
  description: string;
  shortcut: string;
}

export const COMMANDS = {
  toggleToc: {
    id: "toggle-toc",
    description: "Toggle Table of Contents",
    shortcut: "F6",
  },
  openFile: {
    id: "open-file",
    description: "Open File",
    shortcut: "CmdOrCtrl+O",
  },
} as const;

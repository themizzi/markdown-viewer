import { dialog, BrowserWindow } from 'electron';

export async function showOpenFileDialog(
  defaultPath?: string,
  parentWindow?: BrowserWindow
): Promise<{ canceled: boolean; filePaths: string[] }> {
  const options = {
    properties: ['openFile' as const],
    filters: [
      { name: 'Markdown', extensions: ['md', 'markdown', 'mdown', 'mkd', 'mkdn'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    ...(defaultPath && { defaultPath })
  };

  if (parentWindow) {
    return dialog.showOpenDialog(parentWindow, options);
  } else {
    return dialog.showOpenDialog(options);
  }
}

import { dialog } from 'electron';

export async function showOpenFileDialog(
  defaultPath?: string
): Promise<{ canceled: boolean; filePaths: string[] }> {
  const options = {
    properties: ['openFile' as const],
    filters: [
      { name: 'Markdown', extensions: ['md', 'markdown', 'mdown', 'mkd', 'mkdn'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    ...(defaultPath && { defaultPath })
  };

  // Open as a standalone modal dialog (not attached to a window as a sheet)
  // This is easier to automate with AppleScript in e2e tests
  return dialog.showOpenDialog(options);
}

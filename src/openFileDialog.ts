import { dialog } from 'electron';

export async function showOpenFileDialog(): Promise<{ canceled: boolean; filePaths: string[] }> {
  return dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Markdown', extensions: ['md', 'markdown', 'mdown', 'mkd', 'mkdn'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
}

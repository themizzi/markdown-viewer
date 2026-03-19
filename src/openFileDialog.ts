import { dialog } from 'electron';

export async function showOpenFileDialog(defaultPath?: string): Promise<{ canceled: boolean; filePaths: string[] }> {
  const options: Record<string, unknown> = {
    properties: ['openFile'],
    filters: [
      { name: 'Markdown', extensions: ['md', 'markdown', 'mdown', 'mkd', 'mkdn'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  };

  if (defaultPath !== undefined) {
    options.defaultPath = defaultPath;
  }

  return dialog.showOpenDialog(options as Parameters<typeof dialog.showOpenDialog>[0]);
}

/**
 * Orchestrates the file open dialog flow.
 * 
 * This is a small orchestration helper that receives its dependencies as arguments:
 * - current-path getter
 * - dialog opener
 * - controller switch method
 */
export async function openFileFlow(
  getCurrentFilePath: () => string,
  showOpenFileDialog: (defaultPath?: string) => Promise<{ canceled: boolean; filePaths: string[] }>,
  switchFile: (filePath: string) => Promise<void>
): Promise<void> {
  const currentPath = getCurrentFilePath();
  
  const result = await showOpenFileDialog(currentPath);

  if (result.canceled || result.filePaths.length === 0) {
    // No-op: user cancelled the dialog
    return;
  }

  const selectedPath = result.filePaths[0];
  await switchFile(selectedPath);
}

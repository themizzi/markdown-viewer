import { BrowserWindow } from 'electron';

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
  showOpenFileDialog: (defaultPath?: string, parentWindow?: BrowserWindow) => Promise<{ canceled: boolean; filePaths: string[] }>,
  switchFile: (filePath: string) => Promise<void>,
  parentWindow?: BrowserWindow
): Promise<void> {
  const currentPath = getCurrentFilePath();
  console.log("openFileFlow: current path =", currentPath);
  
  const result = await showOpenFileDialog(currentPath, parentWindow);
  console.log("openFileFlow: dialog result =", result);

  if (result.canceled || result.filePaths.length === 0) {
    // No-op: user cancelled the dialog
    console.log("openFileFlow: dialog was cancelled or no file selected");
    return;
  }

  const selectedPath = result.filePaths[0];
  console.log("openFileFlow: switching to file =", selectedPath);
  await switchFile(selectedPath);
  console.log("openFileFlow: file switch complete");
}

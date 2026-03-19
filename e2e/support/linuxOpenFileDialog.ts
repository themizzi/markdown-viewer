import { execSync } from 'node:child_process';

const LINUX_OPEN_DIALOG = 'LINUX_OPEN_DIALOG:';

/**
 * Wait for the native open dialog to appear on Linux.
 * Uses xdotool to search for common file chooser window titles.
 * @param maxWaitMs Maximum time to wait in milliseconds (default 10000)
 */
export async function waitForLinuxOpenDialog(maxWaitMs = 10000): Promise<void> {
  const startTime = Date.now();
  const pollInterval = 200; // ms between checks
  
  while (Date.now() - startTime < maxWaitMs) {
    try {
      // Search for file chooser windows using xdotool
      // Common titles: "Open File", "Choose File", "Select a File"
      const result = execSync(
        `xdotool search --name '(Open File|Choose File|Select a File)' 2>/dev/null | head -1`,
        { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
      ).trim();
      
      if (result) {
        console.log(`${LINUX_OPEN_DIALOG} Found open dialog window ID: ${result}`);
        return;
      }
    } catch {
      // xdotool not found or search failed, continue polling
    }
    
    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }
  
  throw new Error(
    `${LINUX_OPEN_DIALOG} Timeout waiting for open dialog after ${maxWaitMs}ms. ` +
    `Make sure xdotool is installed: apt-get install xdotool`
  );
}

/**
 * Check if the native open dialog is currently present on Linux.
 * @returns true if dialog is present, false otherwise
 */
export function isLinuxOpenDialogPresent(): boolean {
  try {
    const result = execSync(
      `xdotool search --name '(Open File|Choose File|Select a File)' 2>/dev/null | head -1`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
    ).trim();
    
    return result.length > 0;
  } catch {
    return false;
  }
}

/**
 * Dismiss the native open dialog on Linux by sending Escape key.
 * Uses xdotool to send key input to the focused window.
 * @param maxWaitMs Maximum time to wait for dialog dismissal (default 5000)
 */
export async function dismissLinuxOpenDialog(maxWaitMs = 5000): Promise<void> {
  try {
    // Find the open dialog window
    const windowId = execSync(
      `xdotool search --name '(Open File|Choose File|Select a File)' 2>/dev/null | head -1`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
    ).trim();
    
    if (!windowId) {
      throw new Error(
        `${LINUX_OPEN_DIALOG} Open dialog window not found. ` +
        `Make sure xdotool is installed: apt-get install xdotool`
      );
    }
    
    console.log(`${LINUX_OPEN_DIALOG} Focusing window ${windowId} and sending Escape key`);
    
    // Focus the window and send Escape key
    execSync(`xdotool windowfocus ${windowId} key Escape 2>/dev/null`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    
    // Wait for dialog to close with polling
    const startTime = Date.now();
    while (Date.now() - startTime < maxWaitMs) {
      if (!isLinuxOpenDialogPresent()) {
        console.log(`${LINUX_OPEN_DIALOG} Dialog dismissed successfully`);
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error(
      `${LINUX_OPEN_DIALOG} Dialog did not close after sending Escape. ` +
      `Current state: ${isLinuxOpenDialogPresent() ? 'still present' : 'not found'}`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const err = new Error(
      `${LINUX_OPEN_DIALOG} Failed to dismiss dialog: ${message}`
    );
    (err as { cause?: unknown }).cause = error;
    throw err;
  }
}

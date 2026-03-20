import { execSync } from 'node:child_process';

const LINUX_OPEN_DIALOG = 'LINUX_OPEN_DIALOG:';

/**
 * List all windows currently available on the X display.
 * Useful for debugging to see what windows are accessible.
 */
export function listAllWindows(): string {
  try {
    const output = execSync(
      `xdotool search --onlyvisible --class '' 2>/dev/null || xdotool search --class ''`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
    ).trim();
    
    const windowIds = output.split('\n').filter(id => id);
    const windowInfo: string[] = [];
    
    for (const winId of windowIds) {
      try {
        const name = execSync(`xdotool getwindowname ${winId}`, { 
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'ignore']
        }).trim();
        const classInfo = execSync(`xdotool getwindowclassname ${winId}`, { 
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'ignore']
        }).trim();
        windowInfo.push(`ID: ${winId}, Name: "${name}", Class: "${classInfo}"`);
      } catch {
        windowInfo.push(`ID: ${winId}, Name: [error], Class: [error]`);
      }
    }
    
    return windowInfo.join('\n');
  } catch (error) {
    return `Unable to list windows: ${error instanceof Error ? error.message : String(error)}`;
  }
}

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
 * Distinguishes between "dialog not present" and "unable to check" (missing xdotool, display issues).
 * @returns true if dialog is present, false if not present or unable to check
 * @throws if unable to check due to missing dependencies or display server issues
 */
export function isLinuxOpenDialogPresent(): boolean {
  try {
    const result = execSync(
      `xdotool search --name '(Open File|Choose File|Select a File)' 2>/dev/null | head -1`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
    ).trim();
    
    return result.length > 0;
  } catch (error) {
    const err = error as { stderr?: string | Buffer; message?: string; code?: string };
    const stderr = typeof err?.stderr === 'string' || Buffer.isBuffer(err?.stderr)
      ? String(err.stderr)
      : '';
    const message = typeof err?.message === 'string' ? err.message : '';
    const combinedOutput = `${message}\n${stderr}`.trim();

    const isDependencyOrDisplayError =
      err?.code === 'ENOENT' ||
      /can't open display/i.test(combinedOutput) ||
      /no display name and no \$DISPLAY environment variable/i.test(combinedOutput);

    if (isDependencyOrDisplayError) {
      const diagnostic = new Error(
        `${LINUX_OPEN_DIALOG} Unable to check for open dialog. ` +
        `Ensure xdotool is installed and a valid X display is available. ` +
        (combinedOutput ? `Details: ${combinedOutput}` : '')
      );
      (diagnostic as { cause?: unknown }).cause = error;
      throw diagnostic;
    }

    // For other errors, assume dialog is not present
    return false;
  }
}

/**
 * Select a file in the open dialog by navigating to the folder and typing the filename.
 * Uses Ctrl+L to access the location bar, types the path, and then types the filename.
 * @param folderPath Absolute path to the folder containing the file
 * @param fileName Name of the file to select (e.g., "open-dialog-target.md")
 * @param maxWaitMs Maximum time to wait (default 10000)
 */
export async function selectFileInLinuxOpenDialog(
  folderPath: string,
  fileName: string,
  maxWaitMs = 10000
): Promise<void> {
  try {
    await waitForLinuxOpenDialog(Math.min(maxWaitMs, 10000));
    
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
    
    
    // Focus the dialog window
    execSync(`xdotool windowfocus ${windowId}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    
    // Give it a moment to focus
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Try Ctrl+L to access location bar (GTK file chooser)
    execSync(`xdotool key ctrl+l`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Clear any existing text and type the folder path
    execSync(`xdotool key ctrl+a`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    execSync(`xdotool type '${folderPath.replace(/'/g, "'\\''")}'`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Press Return to navigate to the folder
    execSync(`xdotool key Return`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    
    // Wait for folder to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Type the filename
    execSync(`xdotool type '${fileName.replace(/'/g, "'\\''")}'`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Press Return to select and open the file
    execSync(`xdotool key Return`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    
    // Wait for file to be loaded and dialog to close
    await new Promise(resolve => setTimeout(resolve, 1000));
    
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const err = new Error(
      `${LINUX_OPEN_DIALOG} Failed to select file in dialog: ${message}`
    );
    (err as { cause?: unknown }).cause = error;
    throw err;
  }
}

/**
 * Dismiss the native open dialog on Linux by sending Escape key.
 * Waits for the dialog to appear before attempting dismissal to reduce flakiness.
 * Uses xdotool to send key input to the focused window.
 * @param maxWaitMs Maximum time to wait for dialog dismissal (default 5000)
 */
export async function dismissLinuxOpenDialog(maxWaitMs = 5000): Promise<void> {
  try {
    // Wait for dialog to appear before attempting dismissal
    // This prevents flakiness due to slow dialog creation under Xvfb
    await waitForLinuxOpenDialog(Math.min(maxWaitMs, 10000));
    
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
    
    
    // Focus the window and send Escape key
    execSync(`xdotool windowfocus ${windowId} key Escape 2>/dev/null`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    
    // Wait for dialog to close with polling
    const startTime = Date.now();
    while (Date.now() - startTime < maxWaitMs) {
      if (!isLinuxOpenDialogPresent()) {
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

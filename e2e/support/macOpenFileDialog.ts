import { execSync } from 'node:child_process';
import * as path from 'node:path';

const MAC_OPEN_DIALOG = 'MAC_OPEN_DIALOG:';

const fixturesDir = path.resolve(process.cwd(), 'e2e/fixtures');

function runAppleScript(script: string): string {
  return execSync(`osascript -e '${script.replace(/'/g, "'\\''")}'`, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'ignore'],
  }).trim();
}

function isMacOpenDialogPresent(): boolean {
  const script = `
    tell application "System Events"
      tell process "markdown-viewer"
        repeat with w in windows
          try
            if (name of w) contains "Open" or (title of w) contains "Open" then
              return true
            end if
          on error
          end try
        end repeat
        return false
      end tell
    end tell
  `;

  return runAppleScript(script) === 'true';
}

function debugMacDialogState(): string {
  const script = `
    tell application "System Events"
      tell process "markdown-viewer"
        set debugInfo to ""
        set debugInfo to debugInfo & "window-count=" & (count of windows) & linefeed
        repeat with w in windows
          try
            set debugInfo to debugInfo & "window name=" & (name of w) & " title=" & (title of w) & linefeed
          on error errMsg
            set debugInfo to debugInfo & "window info error=" & errMsg & linefeed
          end try
          try
            set debugInfo to debugInfo & "sheet-count=" & (count of sheets of w) & linefeed
          on error errMsg
            set debugInfo to debugInfo & "sheet info error=" & errMsg & linefeed
          end try
        end repeat
        return debugInfo
      end tell
    end tell
  `;

  try {
    return runAppleScript(script);
  } catch (error) {
    return `debug-script-error=${error instanceof Error ? error.message : String(error)}`;
  }
}

/**
 * Verify the standalone Open File dialog is present on macOS via AppleScript.
 * Targets the markdown-viewer process.
 * @param maxWaitMs Maximum time to wait for dialog to appear (default 10000)
 * @throws if dialog does not appear within timeout or on AppleScript error
 */
export async function verifyMacOpenDialogPresent(maxWaitMs = 10000): Promise<void> {
  const startTime = Date.now();
  const pollInterval = 200; // ms between checks

  while (Date.now() - startTime < maxWaitMs) {
    try {
      if (isMacOpenDialogPresent()) {
        return;
      }
    } catch {
      // AppleScript error or markdown-viewer process not found, continue polling
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  throw new Error(
    `${MAC_OPEN_DIALOG} Timeout waiting for Open File dialog after ${maxWaitMs}ms. ` +
    `Verify the markdown-viewer process is running and AppleScript is available.`
  );
}

/**
 * Dismiss the native Open File dialog on macOS by pressing Escape.
 * Works on any window with focus - the Escape key will close the dialog.
 * @throws if dialog cannot be dismissed or AppleScript error occurs
 */
export async function dismissMacOpenDialog(): Promise<void> {
  try {
    await verifyMacOpenDialogPresent(10000);

    const script = `
      tell application "System Events"
        tell process "markdown-viewer"
          set frontmost to true
          tell window "Open"
            key code 53
          end tell
        end tell
      end tell
    `;

    runAppleScript(script);

    const startTime = Date.now();
    while (Date.now() - startTime < 5000) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      if (!isMacOpenDialogPresent()) {
        return;
      }
    }

    throw new Error(
      'Dialog still present after Escape. Visible state:\n' + debugMacDialogState()
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const wrapped = new Error(
      `${MAC_OPEN_DIALOG} Failed to dismiss Open File dialog: ${message}`
    ) as Error & { cause?: unknown };
    if (error instanceof Error) {
      wrapped.cause = error;
    }
    throw wrapped;
  }
}

export async function openFileViaDialog(fileName: string): Promise<void> {
  const script = `
    tell application "System Events"
      tell process "markdown-viewer"
        set frontmost to true
        delay 0.3
        
        -- Trigger Cmd+O to open File menu
        keystroke "o" using command down
        delay 1
        
        -- Wait for dialog to appear
        repeat 10 times
          try
            if (exists window "Open") then
              exit repeat
            end if
          end try
          delay 0.2
        end repeat
        
        -- Navigate to folder with Cmd+Shift+G
        keystroke "g" using {command down, shift down}
        delay 0.5
        
        -- Type the folder path
        keystroke "${fixturesDir.replace(/\//g, "/")}"
        delay 0.3
        key code 36 -- Return
        delay 1
        
        -- Type the filename
        keystroke "${fileName}"
        delay 0.3
        key code 36 -- Return
      end tell
    end tell
  `;
  
  try {
    runAppleScript(script);
    // Wait for file to load
    await new Promise((resolve) => setTimeout(resolve, 2000));
  } catch (error) {
    const err = new Error(
      `${MAC_OPEN_DIALOG} Failed to open file via dialog: ${error instanceof Error ? error.message : String(error)}`
    );
    (err as { cause?: unknown }).cause = error;
    throw err;
  }
}

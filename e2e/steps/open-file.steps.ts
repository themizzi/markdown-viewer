import { When, Then, Given } from "@cucumber/cucumber";
import { expect } from "expect-webdriverio";
import { execSync } from 'node:child_process';
import * as path from 'node:path';
import {
  dismissLinuxOpenDialog,
  isLinuxOpenDialogPresent,
  selectFileInLinuxOpenDialog,
} from "../support/linuxOpenFileDialog.ts";
import type { E2EWorld } from "../support/world.ts";

Given(/the app is showing the initial test markdown document/, async function (this: E2EWorld) {
  const browser = this.getBrowser();
  const appElement = await browser.$('#app');
  const text = await appElement.getText();
  expect(text).toContain('OPEN_FILE_INITIAL_FIXTURE');
});

When(/the user clicks File Open/, async function (this: E2EWorld) {
  const browser = this.getBrowser();
  // Trigger the file-open menu item from Electron app menu
  await browser.electron.execute((electron: unknown) => {
    const { Menu } = electron as { Menu: { getApplicationMenu: () => unknown } };
    const menu = Menu.getApplicationMenu();
    if (!menu) throw new Error('No application menu found');
    
    const fileMenu = (menu as { items: unknown[] }).items.find((item: unknown) => (item as { label?: string }).label === 'File');
    if (!fileMenu || !(fileMenu as { submenu?: unknown }).submenu) throw new Error('File menu not found');
    
    const openItem = ((fileMenu as { submenu: { items: unknown[] } }).submenu).items.find((item: unknown) => (item as { id?: string }).id === 'file-open');
    if (!openItem) throw new Error('File Open menu item not found');
    
    const click = (openItem as { click?: unknown }).click;
    if (typeof click !== 'function') {
      throw new Error('File Open menu item has no valid click handler');
    }
    (click as () => void)();
  });
  
  // Wait for dialog to appear - increased wait time
  await new Promise(resolve => setTimeout(resolve, 3000));
});

When(/the user selects the deterministic target file in the Open File dialog/, async function () {
  const fixturePath = path.resolve(process.cwd(), 'e2e/fixtures');
  const fileName = 'open-dialog-target.md';
  
  // Check if running on macOS or Linux and use appropriate automation
  if (process.platform === 'darwin') {
    // macOS: Use AppleScript
    await selectFileInMacOSOpenDialog(fixturePath, fileName);
  } else if (process.platform === 'linux') {
    // Linux: Use xdotool
    await selectFileInLinuxOpenDialog(fixturePath, fileName, 10000);
  } else {
    throw new Error(`Unsupported platform for e2e testing: ${process.platform}`);
  }
  
  // Wait for file to be loaded
  await new Promise(resolve => setTimeout(resolve, 1000));
});

async function selectFileInMacOSOpenDialog(fixturePath: string, fileName: string): Promise<void> {
  const escapedPath = fixturePath.replace(/"/g, '\\"');
  
  // Use a simpler direct approach with explicit window indexing
  const script = `
tell application "System Events"
  tell process "markdown-viewer"
    -- Wait for any window to appear (dialogs are windows)
    delay 2
    
    -- Get all window names
    set windowNames to name of every window
    log "Windows found: " & windowNames
    
    -- Try to find the Open dialog by checking each window
    set foundDialog to false
    repeat with w in (every window)
      if name of w contains "Open" then
        set foundDialog to true
        log "Found Open dialog"
        
        -- Press Cmd+Shift+G in that window
        tell w
          keystroke "g" using {command down, shift down}
        end tell
        exit repeat
      end if
    end repeat
    
    if not foundDialog then
      log "Did not find Open dialog, trying anyway..."
    end if
    
    delay 2
    
    -- Check for sheet
    set sheetExists to false
    try
      if exists sheet 1 of window 1 then
        set sheetExists to true
        log "Sheet exists"
      end if
    end try
    
    if sheetExists then
      -- Set path
      try
        set value of text field 1 of sheet 1 of window 1 to "${escapedPath}"
        log "Path set"
      on error e
        log "Error setting path: " & e
      end try
      
      delay 1
      keystroke return
      delay 2
      
      -- Wait for sheet to close
      repeat 20 times
        try
          if not (exists sheet 1 of window 1) then
            log "Sheet closed"
            exit repeat
          end if
        end try
        delay 0.2
      end repeat
      
      delay 1
      
      -- Type filename
      keystroke "${fileName}"
      delay 0.5
      keystroke return
    end if
    
    log "Done"
  end tell
end tell`;

  try {
    execSync(`osascript -e '${script.replace(/'/g, "'\\''")}' 2>&1`, { encoding: 'utf8' });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    
    if (message.includes('Not authorized') || message.includes('permission')) {
      const err = new Error(`AppleScript permissions blocked automation. Please enable System Events in Security & Privacy settings.`);
      if (error instanceof Error) {
        err.cause = error;
      }
      throw err;
    }
    
    throw error;
  }
}


When(/the user clicks Cancel on the Open File dialog/, async function () {
  if (process.platform === 'darwin') {
    // macOS: Use AppleScript to press Escape
    const script = `tell application "System Events"
  tell process "markdown-viewer"
    tell window "Open"
      key code 53
    end tell
  end tell
end tell`;

    try {
      execSync(`osascript -e '${script.replace(/'/g, "'\\''")}'`, { encoding: 'utf8' });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const err = new Error(`Failed to close Open File dialog: ${message}`);
      if (error instanceof Error) {
        err.stack = error.stack;
      }
      throw err;
    }
  } else if (process.platform === 'linux') {
    // Linux: Use xdotool to dismiss dialog
    await dismissLinuxOpenDialog(5000);
  }
  
  // Wait for dialog to close
  await new Promise(resolve => setTimeout(resolve, 1000));
});

Then(/^the Open File dialog is not present$/, async function () {
  if (process.platform === 'darwin') {
    // macOS: Use AppleScript to verify dialog is closed
    const script = `tell application "System Events"
  tell process "markdown-viewer"
    repeat with i from 1 to 100
      if not (exists window "Open") then exit repeat
      delay 0.2
    end repeat
    return not (exists window "Open")
  end tell
end tell`;

    try {
      const result = execSync(`osascript -e '${script.replace(/'/g, "'\\''")}'`, { encoding: 'utf8' });
      const dialogNotPresent = result.trim() === 'true';
      expect(dialogNotPresent).toBe(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const err = new Error(`Failed to verify dialog is not present: ${message}`);
       if (error instanceof Error) {
         err.stack = error.stack;
       }
       throw err;
     }
  } else if (process.platform === 'linux') {
    const dialogPresent = isLinuxOpenDialogPresent();
    expect(dialogPresent).toBe(false);
  }
});

Then(/the app shows the selected markdown document/, async function (this: E2EWorld) {
  const browser = this.getBrowser();
  const appElement = await browser.$('#app');
  const text = await appElement.getText();
  expect(text).toContain('OPEN_FILE_TARGET_FIXTURE');
});

When(/the user dismisses the Open File dialog on Linux/, async function () {
  if (process.platform === 'linux') {
    await dismissLinuxOpenDialog(5000);
  }
});

Then(/the Open File dialog is not present on Linux/, async function () {
  if (process.platform === 'linux') {
    expect(isLinuxOpenDialogPresent()).toBe(false);
  }
});

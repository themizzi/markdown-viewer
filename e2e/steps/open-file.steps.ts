import { When, Then, Given } from '@wdio/cucumber-framework';
import { browser, expect } from '@wdio/globals';
import { execSync } from 'node:child_process';

Given(/the app is showing the initial test markdown document/, async () => {
  const appElement = await browser.$('#app');
  const text = await appElement.getText();
  expect(text).toContain('OPEN_FILE_INITIAL_FIXTURE');
});

When(/the user clicks File Open/, async () => {
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
  
  // Wait for dialog to appear
  await browser.pause(500);
});

When(/the user selects the deterministic target file in the Open File dialog/, async () => {
  const fixturePath = '/Users/themizzi/GitHub/markdown-viewer/e2e/fixtures';
  
  // AppleScript to navigate to the fixtures directory and select open-dialog-target.md
  const script = `-- Navigate to fixtures directory and select the target file
tell application "System Events"
  tell process "markdown-viewer"
    -- Wait for Open dialog to appear (up to 10 seconds)
    set dialogFound to false
    repeat with i from 1 to 50
      try
        if (exists sheet 1 of window 1) then
          set dialogFound to true
          exit repeat
        end if
      end try
      delay 0.2
    end repeat
    
    if not dialogFound then
      error "Open File dialog did not appear within 10 seconds"
    end if
    
    -- Press Command+Shift+G to open "Go to Folder" dialog
    key code 5 using {command down, shift down}
    delay 0.5
    
    -- Type the fixtures directory path
    set the clipboard to "${fixturePath}"
    key code 9 using {command down}  -- Paste
    delay 0.3
    
    -- Press Enter to navigate
    key code 36  -- Return key
    delay 1.0
    
    -- Type the filename to select it
    set the clipboard to "open-dialog-target.md"
    key code 9 using {command down}  -- Paste
    delay 0.3
    
    -- Press Enter to select the file
    key code 36  -- Return key
    delay 0.5
  end tell
end tell`;

  try {
    execSync(`osascript -e '${script.replace(/'/g, "'\\''")}'`, { encoding: 'utf8' });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    let errorMessage = `Failed to select file in Open File dialog: ${message}`;
    
    // Check for AppleScript permissions error
    if (message.includes('Not authorized') || message.includes('permission')) {
      errorMessage = `AppleScript permissions blocked automation. Please enable System Events in Security & Privacy settings.`;
    }
    
    const err = new Error(errorMessage);
    if (error instanceof Error) {
      err.stack = error.stack;
    }
    throw err;
  }
  
  // Wait for file to be loaded
  await browser.pause(1000);
});


When(/the user clicks Cancel on the Open File dialog/, async () => {
  const script = `-- Press Escape to close the Open File dialog
tell application "System Events"
  tell process "markdown-viewer"
    -- Press Escape key to close the dialog
    key code 53
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
  
  // Wait for dialog to close
  await browser.pause(1000);
});

Then(/^the Open File dialog is not present$/, async () => {
  const script = `-- Verify dialog is closed by checking window count
tell application "System Events"
  tell process "markdown-viewer"
    -- Wait for dialog to close (max 20 seconds)
    repeat with i from 1 to 100
      if (count of windows) = 1 then exit repeat
      delay 0.2
    end repeat
    
    -- Return true if only the main window remains
    return ((count of windows) = 1)
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
});

Then(/the app shows the selected markdown document/, async () => {
  const appElement = await browser.$('#app');
  const text = await appElement.getText();
  expect(text).toContain('OPEN_FILE_TARGET_FIXTURE');
});

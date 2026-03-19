import { When, Then } from '@wdio/cucumber-framework';
import { browser, expect } from '@wdio/globals';
import { execSync } from 'node:child_process';

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

When(/the user clicks Cancel on the Open File dialog/, async () => {
  const script = `-- Click Cancel button on the Open File dialog
tell application "System Events"
  tell process "markdown-viewer"
    -- Wait for Open File dialog to appear (max 10 seconds)
    repeat with i from 1 to 50
      set dialogWindow to (first window whose name contains "Open")
      if dialogWindow exists then exit repeat
      delay 0.2
    end repeat
    
    -- Click the Cancel button
    click button "Cancel" of (first window whose name contains "Open")
  end tell
end tell`;

  try {
    execSync(`osascript -e '${script.replace(/'/g, "'\\''")}'`, { encoding: 'utf8' });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const err = new Error(`Failed to click Cancel on Open File dialog: ${message}`);
    if (error instanceof Error) {
      err.stack = error.stack;
    }
    throw err;
  }
  
  // Wait for dialog to close
  await browser.pause(1000);
});

Then(/the Open File dialog is not present/, async () => {
  const script = `-- Verify Open File dialog is closed by checking for its window
tell application "System Events"
  tell process "markdown-viewer"
    -- Wait for Open File dialog window to close (max 20 seconds)
    repeat with i from 1 to 100
      -- Exit once there are no windows whose name contains "Open"
      if (count of windows whose name contains "Open") = 0 then exit repeat
      delay 0.2
    end repeat
    
    -- Return true if no Open File dialog window remains
    return ((count of windows whose name contains "Open") = 0)
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

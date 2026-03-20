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
  const result = await browser.electron.execute((electron: unknown) => {
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
    return 'Menu click executed';
  });
  
  console.log('Menu click result:', result);
  
  // Wait for dialog to appear
  await new Promise(resolve => setTimeout(resolve, 1000));
});

When(/the user selects the deterministic target file in the Open File dialog/, async () => {
  const fixturePath = '/Users/themizzi/GitHub/markdown-viewer/e2e/fixtures';
  const fileName = 'open-dialog-target.md';
  
  // AppleScript to navigate to the fixtures directory and select the target file
  // The dialog opens as a standalone modal window (not a sheet)
  const script = `
tell application "System Events"
  tell process "markdown-viewer"
    -- Wait for the Open dialog window to appear
    set dialogWindowName to "Open"
    repeat until exists window dialogWindowName
      delay 0.2
    end repeat
    
    -- Interact with the Open dialog window
    tell window dialogWindowName
      -- Press Cmd+Shift+G to open "Go to Folder" dialog
      keystroke "g" using {command down, shift down}
      delay 1.0
      
      -- Wait for the "Go to Folder" sheet to appear within the dialog
      repeat with i from 1 to 20
        try
          if exists sheet 1 then
            exit repeat
          end if
        end try
        delay 0.1
      end repeat
      
      delay 0.5
      
      -- Set the path in the text field of the sheet
      try
        set value of text field 1 of sheet 1 to "${fixturePath}"
      end try
      delay 0.3
      
      -- Press Return to navigate to the folder
      keystroke return
      delay 1.5
      
      -- Wait for the sheet to close
      repeat with i from 1 to 20
        try
          if not (exists sheet 1) then
            exit repeat
          end if
        end try
        delay 0.1
      end repeat
      
      delay 0.5
      
      -- Type the filename to select it
      keystroke "${fileName}"
      delay 0.5
      
      -- Press Return to select and open the file
      keystroke return
      delay 1.0
    end tell
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
  await new Promise(resolve => setTimeout(resolve, 1000));
});


When(/the user clicks Cancel on the Open File dialog/, async () => {
  const script = `-- Press Escape to close the Open File dialog
tell application "System Events"
  tell process "markdown-viewer"
    -- Focus on the Open dialog window
    tell window "Open"
      -- Press Escape key to close the dialog
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
  
  // Wait for dialog to close
  await new Promise(resolve => setTimeout(resolve, 1000));
});

Then(/^the Open File dialog is not present$/, async () => {
  const script = `-- Verify dialog is closed by checking for "Open" window
tell application "System Events"
  tell process "markdown-viewer"
    -- Wait for dialog to close (max 20 seconds)
    repeat with i from 1 to 100
      if not (exists window "Open") then exit repeat
      delay 0.2
    end repeat
    
    -- Return true if the "Open" window no longer exists
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
});

Then(/the app shows the selected markdown document/, async () => {
  const appElement = await browser.$('#app');
  const text = await appElement.getText();
  expect(text).toContain('OPEN_FILE_TARGET_FIXTURE');
});

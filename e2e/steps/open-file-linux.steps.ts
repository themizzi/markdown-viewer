import { When, Then } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import {
  dismissLinuxOpenDialog,
  isLinuxOpenDialogPresent,
  selectFileInLinuxOpenDialog,
} from '../support/linuxOpenFileDialog';

When(/the user selects the deterministic target file in the Open File dialog on Linux/, async () => {
  const fixturePath = '/Users/themizzi/GitHub/markdown-viewer/e2e/fixtures';
  const fileName = 'open-dialog-target.md';
  
  // Select the file using Linux xdotool automation
  await selectFileInLinuxOpenDialog(fixturePath, fileName, 10000);
  
  // Wait for file to be loaded
  await new Promise(resolve => setTimeout(resolve, 1000));
});

When(/the user dismisses the Open File dialog on Linux/, async () => {
  // Dismiss the native file dialog using Linux-specific tools
  await dismissLinuxOpenDialog(5000);
  
  // Brief pause for cleanup
  await new Promise(resolve => setTimeout(resolve, 500));
});

Then(/^the Open File dialog is not present on Linux$/, async () => {
  // Verify the dialog is gone by checking for window presence
  const dialogPresent = isLinuxOpenDialogPresent();
  expect(dialogPresent).toBe(false);
});



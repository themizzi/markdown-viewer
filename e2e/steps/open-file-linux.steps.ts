import { When, Then } from '@wdio/cucumber-framework';
import { browser, expect } from '@wdio/globals';
import {
  dismissLinuxOpenDialog,
  isLinuxOpenDialogPresent,
} from '../support/linuxOpenFileDialog';

When(/the user dismisses the Open File dialog on Linux/, async () => {
  // Dismiss the native file dialog using Linux-specific tools
  await dismissLinuxOpenDialog(5000);
  
  // Brief pause for cleanup
  await browser.pause(500);
});

Then(/^the Open File dialog is not present on Linux$/, async () => {
  // Verify the dialog is gone by checking for window presence
  const dialogPresent = isLinuxOpenDialogPresent();
  expect(dialogPresent).toBe(false);
});

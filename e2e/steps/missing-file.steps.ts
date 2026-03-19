import { When, Then } from '@wdio/cucumber-framework';
import { $, browser, expect } from '@wdio/globals';
import * as fs from 'fs';
import * as path from 'path';

const testFile = path.resolve(process.cwd(), 'e2e/fixtures/test.md');

When(/the markdown file is deleted/, async () => {
  fs.unlinkSync(testFile);
});

Then(/the user should see an error message indicating the file was not found/, async () => {
  await browser.waitUntil(async () => {
    const appContent = await $('#app').getText();
    return appContent.includes('File not found');
  }, { timeout: 5000 });

  const appContent = await $('#app').getText();
  expect(appContent).toContain('File not found');
});

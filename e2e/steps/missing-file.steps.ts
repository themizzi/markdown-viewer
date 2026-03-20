import { When, Then } from "@cucumber/cucumber";
import { expect } from "expect-webdriverio";
import * as fs from 'fs';
import * as path from 'path';
import type { E2EWorld } from "../support/world.ts";

const testFile = path.resolve(process.cwd(), 'e2e/fixtures/test.md');

When(/the markdown file is deleted/, async () => {
  fs.unlinkSync(testFile);
});

Then(/the user should see an error message indicating the file was not found/, async function (this: E2EWorld) {
  const browser = this.getBrowser();
  await browser.waitUntil(async () => {
    const appContent = await browser.$('#app').getText();
    return appContent.includes('File not found');
  }, { timeout: 5000 });

  const appContent = await browser.$('#app').getText();
  expect(appContent).toContain('File not found');
});

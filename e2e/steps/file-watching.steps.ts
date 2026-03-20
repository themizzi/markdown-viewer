import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "expect-webdriverio";
import * as fs from 'fs';
import * as path from 'path';
import type { E2EWorld } from "../support/world.ts";

const fixturesDir = path.resolve(process.cwd(), 'e2e/fixtures');
const testFile = path.join(fixturesDir, 'test.md');

async function waitForHeading(browser: WebdriverIO.Browser, headingText: string, timeout: number): Promise<void> {
  await browser.waitUntil(async () => {
    const heading = await browser.$(`h1=${headingText}`);
    return heading.isExisting();
  }, { timeout });

  await expect(await browser.$(`h1=${headingText}`)).toBeDisplayed();
}

Given(/the user sees the heading "([^"]+)"/, async function (this: E2EWorld, headingText: string) {
  const heading = await this.getBrowser().$(`h1=${headingText}`);
  await expect(heading).toBeDisplayed();
});

When(/the markdown file is modified to contain "([^"]+)"/, async (newContent: string) => {
  const currentContent = fs.readFileSync(testFile, 'utf8');
  const newFileContent = currentContent.replace('# Test Markdown', `# ${newContent}`);
  fs.writeFileSync(testFile, newFileContent);
});

Then(/the user should see the heading "([^"]+)" within (\d+) seconds/, async function (this: E2EWorld, headingText: string, seconds: number) {
  await waitForHeading(this.getBrowser(), headingText, seconds * 1000);
});

When(/the markdown file is replaced with new content/, async () => {
  const newContent = `# Completely New

This is a new document with different content.

- New item A
- New item B
`;
  fs.writeFileSync(testFile, newContent);
});

Then(/the user should see the new content within (\d+) seconds/, async function (this: E2EWorld, seconds: number) {
  await waitForHeading(this.getBrowser(), 'Completely New', seconds * 1000);
});

import { Given, When, Then } from '@wdio/cucumber-framework';
import { $, browser, expect } from '@wdio/globals';
import * as fs from 'fs';
import * as path from 'path';

const fixturesDir = path.resolve(process.cwd(), 'e2e/fixtures');
const testFile = path.join(fixturesDir, 'test.md');

async function waitForHeading(headingText: string, timeout: number): Promise<void> {
  await browser.waitUntil(async () => {
    const heading = await $(`h1=${headingText}`);
    return heading.isExisting();
  }, { timeout });

  await expect(await $(`h1=${headingText}`)).toBeDisplayed();
}

Given(/the user sees the heading "([^"]+)"/, async (headingText: string) => {
  const heading = await $(`h1=${headingText}`);
  await expect(heading).toBeDisplayed();
});

When(/the markdown file is modified to contain "([^"]+)"/, async (newContent: string) => {
  const currentContent = fs.readFileSync(testFile, 'utf8');
  const newFileContent = currentContent.replace('# Test Markdown', `# ${newContent}`);
  fs.writeFileSync(testFile, newFileContent);
});

Then(/the user should see the heading "([^"]+)" within (\d+) seconds/, async (headingText: string, seconds: number) => {
  await waitForHeading(headingText, seconds * 1000);
});

When(/the markdown file is replaced with new content/, async () => {
  const newContent = `# Completely New

This is a new document with different content.

- New item A
- New item B
`;
  fs.writeFileSync(testFile, newContent);
});

Then(/the user should see the new content within (\d+) seconds/, async (seconds: number) => {
  await waitForHeading('Completely New', seconds * 1000);
});

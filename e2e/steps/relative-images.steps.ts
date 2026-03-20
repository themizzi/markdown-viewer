import { When, Then } from "@cucumber/cucumber";
import { expect } from "expect-webdriverio";
import * as fs from 'fs';
import * as path from 'path';
import type { E2EWorld } from "../support/world.ts";

const fixturesDir = path.resolve(process.cwd(), 'e2e/fixtures');
const testFile = path.join(fixturesDir, 'test.md');

When(/the markdown file contains a relative image reference/, async function (this: E2EWorld) {
  const browser = this.getBrowser();
  const content = `# Relative Image

![Fixture image](./sample.png)
`;

  fs.writeFileSync(testFile, content);

  await browser.waitUntil(async () => {
    const heading = await browser.$('h1=Relative Image');
    return heading.isExisting();
  }, { timeout: 5000 });
});

Then(/the relative image should be displayed/, async function (this: E2EWorld) {
  const image = await this.getBrowser().$('img[alt="Fixture image"]');
  await expect(image).toBeDisplayed();
});

Then(/the image source should resolve from the markdown file directory/, async function (this: E2EWorld) {
  const image = await this.getBrowser().$('img[alt="Fixture image"]');
  const src = await image.getProperty('src');

  expect(String(src)).toBe(`file://${fixturesDir}/sample.png`);
});

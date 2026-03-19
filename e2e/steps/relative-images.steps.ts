import { When, Then } from '@wdio/cucumber-framework';
import { $, browser, expect } from '@wdio/globals';
import * as fs from 'fs';
import * as path from 'path';

const fixturesDir = path.resolve(process.cwd(), 'e2e/fixtures');
const testFile = path.join(fixturesDir, 'test.md');

When(/the markdown file contains a relative image reference/, async () => {
  const content = `# Relative Image

![Fixture image](./sample.png)
`;

  fs.writeFileSync(testFile, content);

  await browser.waitUntil(async () => {
    const heading = await $('h1=Relative Image');
    return heading.isExisting();
  }, { timeout: 5000 });
});

Then(/the relative image should be displayed/, async () => {
  const image = await $('img[alt="Fixture image"]');
  await expect(image).toBeDisplayed();
});

Then(/the image source should resolve from the markdown file directory/, async () => {
  const image = await $('img[alt="Fixture image"]');
  const src = await image.getProperty('src');

  expect(String(src)).toBe(`file://${fixturesDir}/sample.png`);
});

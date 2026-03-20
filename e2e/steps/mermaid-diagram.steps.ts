import { When, Then } from "@cucumber/cucumber";
import { expect } from "expect-webdriverio";
import * as fs from 'fs';
import * as path from 'path';
import type { E2EWorld } from "../support/world.ts";

const fixturesDir = path.resolve(process.cwd(), 'e2e/fixtures');
const testFile = path.join(fixturesDir, 'test.md');

When(/the markdown file contains a mermaid code block/, async function (this: E2EWorld) {
  const browser = this.getBrowser();
  const mermaidContent = `# Test

\`\`\`mermaid
graph TD
  A[Start] --> B[End]
\`\`\`
`;
  fs.writeFileSync(testFile, mermaidContent);
  await browser.pause(2000);
});

Then(/the user should see a rendered mermaid diagram/, async function (this: E2EWorld) {
  const browser = this.getBrowser();
  await browser.waitUntil(async () => {
    const svg = await browser.$('.mermaid svg');
    return svg.isExisting();
  }, { timeout: 5000 });

  await expect(await browser.$('.mermaid')).toBeDisplayed();
  expect(await browser.$('.mermaid svg').isExisting()).toBe(true);
});

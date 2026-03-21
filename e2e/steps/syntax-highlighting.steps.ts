import { When, Then } from "@cucumber/cucumber";
import { expect } from "expect-webdriverio";
import * as fs from 'fs';
import * as path from 'path';
import type { E2EWorld } from "../support/world.ts";

const fixturesDir = path.resolve(process.cwd(), 'e2e/fixtures');
const testFile = path.join(fixturesDir, 'test.md');

When(/the markdown file contains a code block with a language/, async function (this: E2EWorld) {
  const browser = this.getBrowser();
  const tsContent = `# Test Code

\`\`\`typescript
const x: number = 1;
\`\`\`
`;
  fs.writeFileSync(testFile, tsContent);
  await browser.pause(2000);
});

Then(/the code block should have syntax highlighting classes/, async function (this: E2EWorld) {
  const browser = this.getBrowser();
  await browser.waitUntil(async () => {
    const codeElement = await browser.$('pre code');
    const html = await codeElement.getHTML();
    return html.includes('hljs-');
  }, { timeout: 5000 });

  const codeElement = await browser.$('pre code');
  const html = await codeElement.getHTML();
  expect(html).toContain('hljs-');
});

When(/the markdown file contains only a mermaid code block and no other code/, async function (this: E2EWorld) {
  const browser = this.getBrowser();
  const mermaidContent = `# Test

\`\`\`mermaid
graph TD
  A --> B
\`\`\`
`;
  fs.writeFileSync(testFile, mermaidContent);
  await browser.pause(1000);
});

Then(/the mermaid code block should not have syntax highlighting classes/, async function (this: E2EWorld) {
  const browser = this.getBrowser();
  await browser.waitUntil(async () => {
    const mermaidDiv = await browser.$('.mermaid');
    return mermaidDiv.isExisting();
  }, { timeout: 10000 });

  const appHtml = await browser.$('#app').getHTML();
  expect(appHtml).not.toContain('hljs-');
});
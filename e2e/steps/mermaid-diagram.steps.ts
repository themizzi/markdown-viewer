import { When, Then } from '@wdio/cucumber-framework';
import { $, browser, expect } from '@wdio/globals';
import * as fs from 'fs';
import * as path from 'path';

const fixturesDir = path.resolve(process.cwd(), 'e2e/fixtures');
const testFile = path.join(fixturesDir, 'test.md');

When(/the markdown file contains a mermaid code block/, async () => {
  const mermaidContent = `# Test

\`\`\`mermaid
graph TD
  A[Start] --> B[End]
\`\`\`
`;
  fs.writeFileSync(testFile, mermaidContent);
  await browser.pause(2000);
});

Then(/the user should see a rendered mermaid diagram/, async () => {
  await browser.waitUntil(async () => {
    const svg = await $('.mermaid svg');
    return svg.isExisting();
  }, { timeout: 5000 });

  await expect(await $('.mermaid')).toBeDisplayed();
  expect(await $('.mermaid svg').isExisting()).toBe(true);
});

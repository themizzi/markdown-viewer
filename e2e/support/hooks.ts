import { Before, After, BeforeAll, AfterAll } from '@wdio/cucumber-framework';
import { browser } from '@wdio/globals';
import * as fs from 'fs';
import * as path from 'path';

const fixturesDir = path.resolve(process.cwd(), 'e2e/fixtures');
const testFile = path.join(fixturesDir, 'test.md');

async function closeElectronApp(): Promise<void> {
  if (!browser.sessionId) {
    return;
  }

  try {
    await browser.electron.execute((electron) => {
      electron.app.exit(0);
    });
  } catch {
    return;
  }

  await browser.pause(100);
}

BeforeAll(async () => {
  if (!fs.existsSync(fixturesDir)) {
    fs.mkdirSync(fixturesDir, { recursive: true });
  }
});

Before(async () => {
  const defaultContent = `# Test Markdown

This is a **test** document.

- Item 1
- Item 2
  `;
  
  fs.writeFileSync(testFile, defaultContent);
});

After(async () => {
  await closeElectronApp();
});

AfterAll(async () => {
  // Cleanup after all tests
});

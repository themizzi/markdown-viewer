import { Before, After, BeforeAll, AfterAll } from '@wdio/cucumber-framework';
import { browser } from '@wdio/globals';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'node:child_process';

const fixturesDir = path.resolve(process.cwd(), 'e2e/fixtures');
const testFile = path.join(fixturesDir, 'test.md');
const openDialogTargetFile = path.join(fixturesDir, 'open-dialog-target.md');
const sampleImage = path.join(fixturesDir, 'sample.png');
const sampleImageBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9pF8nKQAAAAASUVORK5CYII=',
  'base64'
);

async function closeElectronApp(): Promise<void> {
  if (!browser.sessionId) {
    return;
  }

  try {
    await browser.electron.execute((electron) => {
      electron.app.quit();
    });
  } catch { /* empty */ }

  await browser.pause(100);

  try {
    await browser.electron.execute((electron) => {
      const windows = electron.BrowserWindow.getAllWindows();
      windows.forEach((win: Record<string, unknown>) => {
        if (!win.isDestroyed()) {
          win.destroy();
        }
      });
      if (!electron.app.isReady()) {
        electron.app.exit(0);
      }
    });
  } catch { /* empty */ }

  await browser.pause(100);
}

/**
 * Clean up any lingering Linux file dialog processes.
 * Canonical cleanup for Linux tests.
 */
function cleanupLinuxDialogs(): void {
  try {
    // Kill any remaining file chooser or dialog processes
    execSync(`pkill -f 'zenity|kdialog' 2>/dev/null || true`, {
      stdio: ['pipe', 'pipe', 'ignore'],
    });
  } catch {
    // Cleanup is best-effort
  }
}

BeforeAll(async () => {
  if (!fs.existsSync(fixturesDir)) {
    fs.mkdirSync(fixturesDir, { recursive: true });
  }
});

Before(async () => {
  const initialFixtureContent = `# Test Markdown

- Item 1
- Item 2

OPEN_FILE_INITIAL_FIXTURE
`;

  const targetFixtureContent = `# Target Test Document

OPEN_FILE_TARGET_FIXTURE

This is the target document selected from the Open File dialog.
`;

  fs.writeFileSync(testFile, initialFixtureContent);
  fs.writeFileSync(openDialogTargetFile, targetFixtureContent);
  fs.writeFileSync(sampleImage, sampleImageBuffer);
});

After(async () => {
  // Canonical cleanup: handle Linux dialog processes first, then close Electron
  cleanupLinuxDialogs();
  await closeElectronApp();
});

AfterAll(async () => {
  // Cleanup after all tests
});

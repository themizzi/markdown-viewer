import { Before, After, BeforeAll, AfterAll, setDefaultTimeout } from "@cucumber/cucumber";
import { execSync } from "node:child_process";
import type { E2EWorld } from "./world.ts";
import { buildRuntimeSessionConfig, createElectronSession } from "./runtime/session.ts";
import { ensureFixturesDir, writeDeterministicFixtures } from "./runtime/fixtures.ts";
import { assertPackagedBinaryExists, resolveAppBinaryPath } from "./runtime/appConfig.ts";
import { startXvfbIfNeeded, stopXvfbIfStarted } from "./runtime/xvfb.ts";

setDefaultTimeout(60_000);

async function closeElectronApp(browser: WebdriverIO.Browser | undefined): Promise<void> {
  if (!browser?.sessionId) {
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
      windows.forEach((win) => {
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
    execSync("pkill -f 'zenity|kdialog' 2>/dev/null || true", {
      stdio: ["pipe", "pipe", "ignore"],
    });
  } catch {
    // Cleanup is best-effort
  }
}

BeforeAll(() => {
  assertPackagedBinaryExists(resolveAppBinaryPath());
  startXvfbIfNeeded();
  ensureFixturesDir();
});

Before(async function (this: E2EWorld) {
  ensureFixturesDir();
  writeDeterministicFixtures();

  const { capabilities } = buildRuntimeSessionConfig();
  const browser = await createElectronSession(capabilities);
  this.setBrowser(browser);
});

After(async function (this: E2EWorld) {
  const browser = this.getBrowserOrUndefined();

  // Canonical cleanup: handle Linux dialog processes first, then close Electron
  cleanupLinuxDialogs();
  await closeElectronApp(browser);
  if (browser) {
    try {
      await browser.deleteSession();
    } catch {
      // best-effort cleanup
    }
  }
  this.clearBrowser();
});

AfterAll(async () => {
  stopXvfbIfStarted();
});

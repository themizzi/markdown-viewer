import { Given } from "@cucumber/cucumber";
import type { E2EWorld } from "../support/world.ts";
import { buildRuntimeSessionConfig, createElectronSession } from "../support/runtime/session.ts";

const fixturesDir = "e2e/fixtures";

Given('the app is started with the file "test.md"', async function (this: E2EWorld) {
  const appArgs = [`--test-file=./${fixturesDir}/test.md`];
  const { capabilities } = buildRuntimeSessionConfig(appArgs);
  const browser = await createElectronSession(capabilities);
  
  await browser.waitUntil(async () => {
    const text = await browser.$("#app").getText();
    return text.length > 0;
  }, { timeout: 10000 });
  
  this.setBrowser(browser);
});

Given('the app is started with the file "toc-test.md"', async function (this: E2EWorld) {
  const appArgs = [`--test-file=./${fixturesDir}/toc-test.md`];
  const { capabilities } = buildRuntimeSessionConfig(appArgs);
  const browser = await createElectronSession(capabilities);
  this.setBrowser(browser);
});

Given('the app is started with no file', async function (this: E2EWorld) {
  const appArgs: string[] = [];
  const { capabilities } = buildRuntimeSessionConfig(appArgs);
  const browser = await createElectronSession(capabilities);
  this.setBrowser(browser);
});

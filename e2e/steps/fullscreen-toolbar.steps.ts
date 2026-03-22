import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "expect-webdriverio";
import type { E2EWorld } from "../support/world.ts";

async function getFullscreenState(browser: WebdriverIO.Browser): Promise<boolean> {
  return browser.electron.execute((electron) => {
    const windows = electron.BrowserWindow.getAllWindows();
    const viewerWindow = windows.find((window) => !window.isDestroyed() && window.isVisible() && window.getBounds().width > 100);
    if (viewerWindow) {
      return viewerWindow.isFullScreen();
    }

    if (windows.length > 0 && !windows[0].isDestroyed()) {
      return windows[0].isFullScreen();
    }

    return false;
  });
}

async function setFullscreenState(browser: WebdriverIO.Browser, isFullscreen: boolean): Promise<void> {
  const currentState = await getFullscreenState(browser);
  if (currentState === isFullscreen) {
    return;
  }

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    await browser.electron.execute((electron, state) => {
      const windows = electron.BrowserWindow.getAllWindows();
      const viewerWindow = windows.find((window) => !window.isDestroyed() && window.isVisible() && window.getBounds().width > 100);
      if (viewerWindow) {
        viewerWindow.focus();
        viewerWindow.setFullScreen(state);
        return;
      }

      if (windows.length > 0 && !windows[0].isDestroyed()) {
        windows[0].setFullScreen(state);
      }
    }, isFullscreen);

    try {
      await browser.waitUntil(async () => {
        const state = await getFullscreenState(browser);
        return state === isFullscreen;
      }, {
        timeout: 5000,
        interval: 100,
        timeoutMsg: `Timed out waiting for fullscreen=${isFullscreen} (attempt ${attempt})`
      });
    } catch {
      if (attempt < 3) {
        continue;
      }
      throw new Error(`Unable to reach fullscreen=${isFullscreen} after retries`);
    }

    await browser.pause(400);
    const stableState = await getFullscreenState(browser);
    if (stableState === isFullscreen) {
      return;
    }
  }

  throw new Error(`Unable to keep fullscreen=${isFullscreen} stable after retries`);
}

async function getToolbarPaddingLeft(browser: WebdriverIO.Browser): Promise<number> {
  const toolbar = await browser.$(".toolbar");
  return toolbar.getCSSProperty("padding-left").then(prop => {
    const value = prop.value;
    if (typeof value === "string") {
      return parseFloat(value);
    }
    return value as number;
  });
}

Given("the app is running on macOS", async function (this: E2EWorld) {
  if (process.platform !== "darwin") {
    return this.skip("Fullscreen toolbar positioning is macOS-only");
  }

  const browser = this.getBrowser();
  await setFullscreenState(browser, false);
});

Given("the app is in fullscreen mode on macOS", async function (this: E2EWorld) {
  if (process.platform !== "darwin") {
    return this.skip("Fullscreen toolbar positioning is macOS-only");
  }

  const browser = this.getBrowser();
  await setFullscreenState(browser, true);
  expect(await getFullscreenState(browser)).toBe(true);
});

When("I enter fullscreen mode", async function (this: E2EWorld) {
  if (process.platform !== "darwin") {
    return this.skip("Fullscreen toolbar positioning is macOS-only");
  }

  const browser = this.getBrowser();
  await setFullscreenState(browser, true);
});

When("I exit fullscreen mode", async function (this: E2EWorld) {
  if (process.platform !== "darwin") {
    return this.skip("Fullscreen toolbar positioning is macOS-only");
  }

  const browser = this.getBrowser();
  await setFullscreenState(browser, false);
  expect(await getFullscreenState(browser)).toBe(false);
});

Then("the toolbar button should move to the left edge of the window", async function (this: E2EWorld) {
  if (process.platform !== "darwin") {
    return this.skip("Fullscreen toolbar positioning is macOS-only");
  }

  const browser = this.getBrowser();
  await browser.pause(500);
  const paddingLeft = await getToolbarPaddingLeft(browser);

  expect(paddingLessThan(paddingLeft, 10)).toBe(true);
});

Then("there should be no visible gap between the button and the window edge", async function (this: E2EWorld) {
  if (process.platform !== "darwin") {
    return this.skip("Fullscreen toolbar positioning is macOS-only");
  }

  const browser = this.getBrowser();
  const paddingLeft = await getToolbarPaddingLeft(browser);

  expect(paddingLessThan(paddingLeft, 10)).toBe(true);
});

Then("the toolbar button should return to its original position", async function (this: E2EWorld) {
  if (process.platform !== "darwin") {
    return this.skip("Fullscreen toolbar positioning is macOS-only");
  }

  const browser = this.getBrowser();
  
  await browser.pause(500);
  
  const paddingLeft = await getToolbarPaddingLeft(browser);

  expect(paddingGreaterThan(paddingLeft, 60)).toBe(true);
});

Then("there should be a gap accounting for the stoplight buttons", async function (this: E2EWorld) {
  if (process.platform !== "darwin") {
    return this.skip("Fullscreen toolbar positioning is macOS-only");
  }

  const browser = this.getBrowser();
  const paddingLeft = await getToolbarPaddingLeft(browser);

  expect(paddingGreaterThan(paddingLeft, 60)).toBe(true);
});

function paddingLessThan(actual: number, threshold: number): boolean {
  return actual < threshold;
}

function paddingGreaterThan(actual: number, threshold: number): boolean {
  return actual > threshold;
}

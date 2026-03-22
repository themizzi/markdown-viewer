import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "expect-webdriverio";
import type { E2EWorld } from "../support/world.ts";

async function setFullscreenState(browser: WebdriverIO.Browser, isFullscreen: boolean): Promise<void> {
  await browser.electron.execute((electron, state) => {
    const windows = electron.BrowserWindow.getAllWindows();
    if (windows.length > 0 && !windows[0].isDestroyed()) {
      windows[0].setFullScreen(state);
    }
  }, isFullscreen);

  await browser.pause(1500);
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
});

Given("the app is in fullscreen mode on macOS", async function (this: E2EWorld) {
  if (process.platform !== "darwin") {
    return this.skip("Fullscreen toolbar positioning is macOS-only");
  }

  const browser = this.getBrowser();
  await setFullscreenState(browser, true);
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
});

Then("the toolbar button should move to the left edge of the window", async function (this: E2EWorld) {
  if (process.platform !== "darwin") {
    return this.skip("Fullscreen toolbar positioning is macOS-only");
  }

  const browser = this.getBrowser();
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

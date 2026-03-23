import { When, Then } from "@cucumber/cucumber";
import { expect } from "expect-webdriverio";
import {
  verifyMacOpenDialogPresent,
  dismissMacOpenDialog,
} from "../support/macOpenFileDialog.ts";
import type { E2EWorld } from "../support/world.ts";

When(/^the app launches with the startup file argument$/, async function (this: E2EWorld) {
  // App is already launched at this point via the Given step
  const browser = this.getBrowser();
  const handles = await browser.getWindowHandles();
  if (handles.length > 1) {
    await browser.switchToWindow(handles.at(-1)!);
  }

  // Wait for the content to load
  await browser.waitUntil(async () => {
    const text = await browser.$("#app").getText();
    return text.length > 0;
  }, { timeout: 5000 });
});

Then(/the user should see the markdown rendered as HTML/, async function (this: E2EWorld) {
  const appContent = await this.getBrowser().$("#app").getHTML();
  expect(appContent).toContain('<h1');
});

Then(/the heading "([^"]+)" should be visible/, async function (this: E2EWorld, headingText: string) {
  const heading = await this.getBrowser().$(`h1=${headingText}`);
  await expect(heading).toBeDisplayed();
});

Then(/the bold text "([^"]+)" should be visible/, async function (this: E2EWorld, text: string) {
  const bold = await this.getBrowser().$(`strong=${text}`);
  await expect(bold).toBeDisplayed();
});

Then(/the list items "([^"]+)" and "([^"]+)" should be visible/, async function (this: E2EWorld, item1: string, item2: string) {
  const browser = this.getBrowser();
  const li1 = await browser.$(`li=${item1}`);
  const li2 = await browser.$(`li=${item2}`);
  await expect(li1).toBeDisplayed();
  await expect(li2).toBeDisplayed();
});

When(/the app launches without a startup file argument/, async function () {
  // App is already launched at this point via the Given step in app-startup.steps.ts
});

Then(/the standalone Open File dialog is present/, async function () {
  // Verify the native dialog is visible via AppleScript
  await verifyMacOpenDialogPresent(10000);
});

Then(/the user dismisses the startup Open File dialog/, async function () {
  // Dismiss the dialog with AppleScript cleanup
  await dismissMacOpenDialog();
});

Then(/the app remains open with no browser window/, async function (this: E2EWorld) {
  const browser = this.getBrowser();
  try {
    const state = await browser.electron.execute((electron) => {
      const windows = electron.BrowserWindow.getAllWindows();
      const visibleWindowCount = windows.filter((win) => !win.isDestroyed() && win.isVisible()).length;
      const hiddenWindowCount = windows.filter((win) => !win.isDestroyed() && !win.isVisible()).length;

      return {
        appIsRunning: electron.app.isReady(),
        visibleWindowCount,
        hiddenWindowCount,
      };
    });

    expect(state.appIsRunning).toBe(true);
    expect(state.visibleWindowCount).toBe(0);
    expect(state.hiddenWindowCount).toBeGreaterThanOrEqual(1);

    console.log(
      `Evidence: appIsRunning=${state.appIsRunning} visibleWindowCount=${state.visibleWindowCount} hiddenWindowCount=${state.hiddenWindowCount}`
    );
  } catch (error) {
    const wrapped = new Error(
      `Unable to verify app is still running: ${error instanceof Error ? error.message : String(error)}`
    ) as Error & { cause?: unknown };
    if (error instanceof Error) {
      wrapped.cause = error;
    }
    throw wrapped;
  }
});

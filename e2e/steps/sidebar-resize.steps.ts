import { When, Given, Then } from "@cucumber/cucumber";
import { expect } from "expect-webdriverio";
import type { E2EWorld } from "../support/world.ts";
import { ensureSidebarVisible } from "./toc-sidebar.steps.ts";
import "./open-file.steps.ts";

Given(/the initial test markdown document is loaded for resize testing/, async function (this: E2EWorld) {
  const browser = this.getBrowser();
  const appElement = await browser.$("#app");
  const text = await appElement.getText();
  expect(text).toContain("OPEN_FILE_INITIAL_FIXTURE");
});

Given("the TOC sidebar is visible for resizing", async function (this: E2EWorld) {
  const browser = this.getBrowser();
  await ensureSidebarVisible(browser);

  await browser.pause(1000);

  const sidebar = await browser.$('[data-testid="toc-sidebar"]');
  await sidebar.waitForDisplayed({ timeout: 5000 });

  const resizeHandle = await browser.$('[data-testid="resize-handle"]');
  const exists = await resizeHandle.isExisting();
  expect(exists).toBe(true);
});

When("the user drags the resize handle to {int}px", async function (this: E2EWorld, targetWidth: number) {
  const browser = this.getBrowser();
  const resizeHandle = await browser.$('[data-testid="resize-handle"]');
  const sidebar = await browser.$('[data-testid="toc-sidebar"]');

  const sidebarLocation = await sidebar.getLocation();
  const sidebarSize = await sidebar.getSize();
  const targetX = sidebarLocation.x + targetWidth;
  const deltaX = Math.round(targetX - (sidebarLocation.x + sidebarSize.width));

  await browser.action("pointer")
    .move({ origin: resizeHandle })
    .down({ button: 0 })
    .move({ origin: "pointer", x: deltaX, y: 0, duration: 300 })
    .up({ button: 0 })
    .perform();

  await browser.pause(300);
});

When("the user drags the resize handle to the maximum width", async function (this: E2EWorld) {
  const browser = this.getBrowser();
  const resizeHandle = await browser.$('[data-testid="resize-handle"]');
  const sidebar = await browser.$('[data-testid="toc-sidebar"]');

  const viewportWidth = await browser.execute(() => window.innerWidth);
  const maxWidth = viewportWidth / 3;
  const sidebarSize = await sidebar.getSize();
  const deltaX = Math.round(maxWidth - sidebarSize.width + 200);

  await browser.action("pointer")
    .move({ origin: resizeHandle })
    .down({ button: 0 })
    .move({ origin: "pointer", x: deltaX, y: 0, duration: 300 })
    .up({ button: 0 })
    .perform();

  await browser.pause(500);
});

Then("the table of contents sidebar width should be at most one third of the window width", async function (this: E2EWorld) {
  const browser = this.getBrowser();
  const sidebar = await browser.$('[data-testid="toc-sidebar"]');
  const viewportWidth = await browser.execute(() => window.innerWidth);
  const maxAllowedWidth = viewportWidth / 3;

  const sidebarSize = await sidebar.getSize();
  expect(sidebarSize.width).toBeLessThanOrEqual(maxAllowedWidth);
});

When("the user hovers over the resize handle", async function (this: E2EWorld) {
  const browser = this.getBrowser();
  const resizeHandle = await browser.$('[data-testid="resize-handle"]');
  await resizeHandle.moveTo();
});

Then("the resize handle should show a col-resize cursor", async function (this: E2EWorld) {
  const browser = this.getBrowser();
  const cursor = await browser.execute(() => {
    const handle = document.querySelector('[data-testid="resize-handle"]');
    return getComputedStyle(handle!).cursor;
  });
  expect(cursor).toBe("col-resize");
});

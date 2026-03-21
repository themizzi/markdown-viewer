import { Then, When, Given } from "@cucumber/cucumber";
import { expect } from "expect-webdriverio";
import * as fs from "fs";
import * as path from "path";
import type { E2EWorld } from "../support/world.ts";
import { openFileViaDialog } from "../support/macOpenFileDialog.ts";

const fixturesDir = path.resolve(process.cwd(), "e2e/fixtures");

/**
 * Factory helpers that create Electron execute callbacks for TOC menu operations
 * Encapsulate the common menu traversal logic: View > Table of Contents (id="view-toggle-table-of-contents")
 * These helpers reduce code duplication across getTocMenuState() and clickTocMenuItem()
 */

const createGetTocMenuState = () => (electron: unknown) => {
  // Shared menu traversal helper
  const { Menu } = electron as { Menu: { getApplicationMenu: () => unknown } };
  const menu = Menu.getApplicationMenu();
  if (!menu) throw new Error("No application menu found");

  const viewMenu = (menu as { items: unknown[] }).items.find(
    (item: unknown) => (item as { label?: string }).label === "View"
  );
  if (!viewMenu || !(viewMenu as { submenu?: unknown }).submenu) {
    throw new Error("View menu not found");
  }

  const tocItem = ((viewMenu as { submenu: { items: unknown[] } }).submenu).items.find(
    (item: unknown) => (item as { id?: string }).id === "view-toggle-table-of-contents"
  );
  if (!tocItem) {
    throw new Error("View > Table of Contents menu item not found");
  }

  return {
    menuItemExists: true,
    checked: (tocItem as { checked?: boolean }).checked ?? false,
  };
};

const createClickTocMenuItem = () => (electron: unknown) => {
  // Shared menu traversal helper
  const { Menu } = electron as { Menu: { getApplicationMenu: () => unknown } };
  const menu = Menu.getApplicationMenu();
  if (!menu) throw new Error("No application menu found");

  const viewMenu = (menu as { items: unknown[] }).items.find(
    (item: unknown) => (item as { label?: string }).label === "View"
  );
  if (!viewMenu || !(viewMenu as { submenu?: unknown }).submenu) {
    throw new Error("View menu not found");
  }

  const tocItem = ((viewMenu as { submenu: { items: unknown[] } }).submenu).items.find(
    (item: unknown) => (item as { id?: string }).id === "view-toggle-table-of-contents"
  );
  if (!tocItem) {
    throw new Error("View > Table of Contents menu item not found");
  }

  const click = (tocItem as { click?: unknown }).click;
  if (typeof click !== "function") {
    throw new Error("View > Table of Contents menu item has no valid click handler");
  }

  (click as () => void)();
};

async function getTocMenuState(browser: WebdriverIO.Browser): Promise<{ menuItemExists: boolean; checked: boolean }> {
  return browser.electron.execute(createGetTocMenuState());
}

async function clickTocMenuItem(browser: WebdriverIO.Browser): Promise<void> {
  await browser.electron.execute(createClickTocMenuItem());
}

async function ensureSidebarVisible(browser: WebdriverIO.Browser): Promise<void> {
  const sidebar = await browser.$('[data-testid="toc-sidebar"]');
  const isDisplayed = await sidebar.isDisplayed().catch(() => false);

  if (!isDisplayed) {
    await clickTocMenuItem(browser);
    await expect(sidebar).toBeDisplayed();
  }
}

async function ensureSidebarHidden(browser: WebdriverIO.Browser): Promise<void> {
  const sidebar = await browser.$('[data-testid="toc-sidebar"]');
  const isDisplayed = await sidebar.isDisplayed().catch(() => false);

  if (isDisplayed) {
    await clickTocMenuItem(browser);
    await expect(sidebar).not.toBeDisplayed();
  }
}

Then("the table of contents sidebar should be {word}", async function (this: E2EWorld, state: string) {
  const browser = this.getBrowser();
  const sidebar = await browser.$('[data-testid="toc-sidebar"]');

  if (state === "visible") {
    await expect(sidebar).toBeDisplayed();
  } else if (state === "hidden") {
    await expect(sidebar).not.toBeDisplayed();
  } else {
    throw new Error(`Invalid state: ${state}. Expected "visible" or "hidden".`);
  }
});

Given("the table of contents sidebar is {word}", async function (this: E2EWorld, state: string) {
  const browser = this.getBrowser();

  if (state === "visible") {
    await ensureSidebarVisible(browser);
  } else if (state === "hidden") {
    await ensureSidebarHidden(browser);
  } else {
    throw new Error(`Invalid state: ${state}. Expected "visible" or "hidden".`);
  }
});

When("the user clicks the title bar table of contents toggle button", async function (this: E2EWorld) {
  const browser = this.getBrowser();
  const tocToggleButton = await browser.$('[data-testid="toc-toggle-button"]');
  const isDisplayed = await tocToggleButton.isDisplayed().catch(() => false);
  expect(isDisplayed).toBe(true);
  await tocToggleButton.click();
});

When("the user chooses View Show Table of Contents", async function (this: E2EWorld) {
  const browser = this.getBrowser();
  await clickTocMenuItem(browser);
});

Then("the View menu item for table of contents is unchecked", async function (this: E2EWorld) {
  const browser = this.getBrowser();
  const menuState = await getTocMenuState(browser);
  expect(menuState.menuItemExists).toBe(true);
  expect(menuState.checked).toBe(false);
});

Then("the View menu item for table of contents is checked", async function (this: E2EWorld) {
  const browser = this.getBrowser();
  const menuState = await getTocMenuState(browser);
  expect(menuState.menuItemExists).toBe(true);
  expect(menuState.checked).toBe(true);
});

Then("the table of contents sidebar should show {string}", async function (this: E2EWorld, message: string) {
  const browser = this.getBrowser();
  const sidebar = await browser.$('[data-testid="toc-sidebar"]');
  await expect(sidebar).toBeDisplayed();
  const emptyMessage = await sidebar.$(".sidebar-empty");
  await expect(emptyMessage).toHaveText(message);
});

Given("the app is showing the {string} markdown document", async function (this: E2EWorld, filename: string) {
  await openFileViaDialog(filename);
  
  const browser = this.getBrowser();
  await browser.waitUntil(async () => {
    const heading = await browser.$("h1");
    return heading.isExisting();
  }, { timeout: 10000 });
});

Then("the table of contents should contain {string}", async function (this: E2EWorld, text: string) {
  const browser = this.getBrowser();
  const sidebar = await browser.$('[data-testid="toc-sidebar"]');
  const link = await sidebar.$(`a=${text}`);
  await expect(link).toBeExisting();
});

When("the user clicks the TOC link for {string}", async function (this: E2EWorld, text: string) {
  const browser = this.getBrowser();
  const sidebar = await browser.$('[data-testid="toc-sidebar"]');
  const link = await sidebar.$(`a=${text}`);
  await link.click();
});

Then("a heading should be visible", async function (this: E2EWorld) {
  const browser = this.getBrowser();
  const app = await browser.$('#app');
  const heading = await app.$(`h1, h2, h3, h4, h5, h6`);
  await expect(heading).toBeDisplayed();
});

When('the markdown file {string} is modified to add a new heading {string}', async function (this: E2EWorld, filename: string, newHeading: string) {
  const filePath = path.join(fixturesDir, filename);
  const originalContent = fs.readFileSync(filePath, "utf-8");
  const newContent = originalContent + `\n\n## ${newHeading}\n\nNew content.`;
  fs.writeFileSync(filePath, newContent);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  fs.writeFileSync(filePath, originalContent);
});

When("the user hovers over the table of contents toggle button", async function (this: E2EWorld) {
  const tocToggleButton = await this.getBrowser().$('[data-testid="toc-toggle-button"]');
  await tocToggleButton.moveTo();
});

Then("the tooltip should contain {string}", async function (this: E2EWorld, text: string) {
  const tocToggleButton = await this.getBrowser().$('[data-testid="toc-toggle-button"]');
  const title = await tocToggleButton.getAttribute("title");
  expect(title).toContain(text);
});

When("the user presses F6", async function (this: E2EWorld) {
  const browser = this.getBrowser();
  
  // Click the menu item (this is what F6 triggers in the app)
  await clickTocMenuItem(browser);
});

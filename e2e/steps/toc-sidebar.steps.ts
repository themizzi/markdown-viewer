import { Then, When, Given } from "@cucumber/cucumber";
import { expect } from "expect-webdriverio";
import type { E2EWorld } from "../support/world.ts";

async function getTocMenuState(browser: WebdriverIO.Browser): Promise<{ menuItemExists: boolean; checked: boolean }> {
  return browser.electron.execute((electron: unknown) => {
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
  });
}

async function clickTocMenuItem(browser: WebdriverIO.Browser): Promise<void> {
  await browser.electron.execute((electron: unknown) => {
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
  });
}

async function ensureSidebarVisible(browser: WebdriverIO.Browser): Promise<void> {
  const sidebar = await browser.$('[data-testid="toc-sidebar"]');
  const isDisplayed = await sidebar.isDisplayed().catch(() => false);

  if (!isDisplayed) {
    await clickTocMenuItem(browser);
  }
}

async function ensureSidebarHidden(browser: WebdriverIO.Browser): Promise<void> {
  const sidebar = await browser.$('[data-testid="toc-sidebar"]');
  const isDisplayed = await sidebar.isDisplayed().catch(() => false);

  if (isDisplayed) {
    await clickTocMenuItem(browser);
  }
}

Then("the table of contents sidebar should be {word}", async function (this: E2EWorld, state: string) {
  const browser = this.getBrowser();
  const sidebar = await browser.$('[data-testid="toc-sidebar"]');
  const isDisplayed = await sidebar.isDisplayed().catch(() => false);
  
  if (state === "visible") {
    expect(isDisplayed).toBe(true);
  } else if (state === "hidden") {
    expect(isDisplayed).toBe(false);
  }
});

Given("the table of contents sidebar is {word}", async function (this: E2EWorld, state: string) {
  const browser = this.getBrowser();
  
  if (state === "visible") {
    await ensureSidebarVisible(browser);
  } else if (state === "hidden") {
    await ensureSidebarHidden(browser);
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

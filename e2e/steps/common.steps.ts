import { Given } from "@cucumber/cucumber";
import { expect } from "expect-webdriverio";
import type { E2EWorld } from "../support/world.ts";

Given(/^the markdown viewer application is running$/, async function (this: E2EWorld) {
  const title = await this.getBrowser().getTitle();
  expect(title).toBe('Markdown Viewer');
});

import { Given } from '@wdio/cucumber-framework';
import { browser, expect } from '@wdio/globals';

Given(/^the markdown viewer application is running$/, async () => {
  const title = await browser.getTitle();
  expect(title).toBe('Markdown Viewer');
});

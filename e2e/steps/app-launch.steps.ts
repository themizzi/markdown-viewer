import { When, Then } from '@wdio/cucumber-framework';
import { $, browser, expect } from '@wdio/globals';

When(/the page loads/, async () => {
  await browser.waitUntil(async () => {
    const text = await $('#app').getText();
    return text.length > 0;
  }, { timeout: 5000 });
});

Then(/the user should see the markdown rendered as HTML/, async () => {
  const appContent = await $('#app').getHTML();
  expect(appContent).toContain('<h1');
});

Then(/the heading "([^"]+)" should be visible/, async (headingText: string) => {
  const heading = await $(`h1=${headingText}`);
  await expect(heading).toBeDisplayed();
});

Then(/the bold text "([^"]+)" should be visible/, async (text: string) => {
  const bold = await $(`strong=${text}`);
  await expect(bold).toBeDisplayed();
});

Then(/the list items "([^"]+)" and "([^"]+)" should be visible/, async (item1: string, item2: string) => {
  const li1 = await $(`li=${item1}`);
  const li2 = await $(`li=${item2}`);
  await expect(li1).toBeDisplayed();
  await expect(li2).toBeDisplayed();
});

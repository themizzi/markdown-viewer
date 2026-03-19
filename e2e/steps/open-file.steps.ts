import { When, Then } from '@wdio/cucumber-framework';
import { browser, expect } from '@wdio/globals';

When(/the user opens the File menu/, async () => {
  await browser.electron.execute((electron) => {
    const menu = electron.Menu.getApplicationMenu();
    if (!menu || !menu.items) return;
    const fileMenu = menu.items.find((item: unknown) => (item as { label?: string }).label === 'File');
    if (fileMenu && fileMenu.submenu && fileMenu.submenu.items) {
      // No-op: just accessing the menu verifies it exists
    }
  });
});

Then(/the File menu should include Open/, async () => {
  const result = await browser.electron.execute((electron) => {
    const { Menu } = electron;
    try {
      const menu = Menu.getApplicationMenu();
      if (!menu) return 'no menu';
      const items = menu.items || [];
      const fileMenu = items.find((item: unknown) => (item as { label?: string }).label === 'File');
      if (!fileMenu) return 'no file menu';
      const submenu = fileMenu.submenu;
      if (!submenu) return 'no submenu';
      const submenuItems = submenu.items || submenu;
      const hasOpen = submenuItems.some((item: unknown) => (item as { id?: string }).id === 'file-open');
      return hasOpen ? true : 'no open item';
    } catch (e: unknown) {
      return 'error: ' + (e as Error).message;
    }
  });
  expect(result).toBe(true);
});

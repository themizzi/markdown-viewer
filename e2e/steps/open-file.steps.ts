import { When, Then } from '@wdio/cucumber-framework';
import { browser, expect } from '@wdio/globals';

When(/the user opens the File menu/, async () => {
  await browser.electron.execute((electron) => {
    const menu = electron.Menu.getApplicationMenu();
    const fileMenu = menu?.items?.find((item: any) => item.label === 'File');
    if (fileMenu && fileMenu.submenu) {
      const submenuItems = (fileMenu.submenu as any).items || [];
      submenuItems.forEach((menuItem: any) => {
        if (menuItem.label && menuItem.click) {
          menuItem.click();
        }
      });
    }
  });
});

Then(/the File menu should include Open/, async () => {
  const result = await browser.electron.execute((electron) => {
    const { Menu } = electron;
    try {
      const menu = Menu.getApplicationMenu();
      if (!menu) return 'no menu';
      const popupMenu = typeof menu.popup === 'function' ? menu : null;
      if (!popupMenu) return 'no popup menu';
      const items = popupMenu.items || [];
      const fileMenu = items.find((item: any) => item.label === 'File');
      if (!fileMenu) return 'no file menu';
      const submenu = fileMenu.submenu;
      if (!submenu) return 'no submenu';
      const submenuItems = submenu.items || submenu;
      const hasOpen = submenuItems.some(
        (item: any) => item.id === 'file-open' || item.label === 'Open'
      );
      return hasOpen ? true : 'no open item';
    } catch (e: any) {
      return 'error: ' + e.message;
    }
  });
  if (result !== true) {
    throw new Error(
      `Expected the File menu to include "Open", but the menu inspection returned: ${String(result)}`
    );
  }
});

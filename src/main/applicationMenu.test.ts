import { describe, it, expect, vi } from "vitest";
import { createApplicationMenu } from "./applicationMenu";

vi.mock("electron", () => ({
  app: {
    name: "markdown-viewer"
  },
  Menu: {
    buildFromTemplate: (template: unknown[]) => template
  }
}));

interface FakeMenuItem {
  label?: string;
  submenu?: FakeMenuItem[];
  id?: string;
  click?: () => void;
  type?: string;
  checked?: boolean;
}

interface TemplateItem {
  label?: string;
  submenu?: TemplateItem[];
  id?: string;
  click?: () => void;
  type?: string;
  checked?: boolean;
}

interface FakeMenu {
  items: FakeMenuItem[];
}

function buildFakeMenu(template: unknown[]): FakeMenu {
  return {
    items: template.map((item) => {
      const t = item as TemplateItem;
      return {
        label: t.label,
        submenu: t.submenu,
        id: t.id,
        click: t.click,
        type: t.type,
        checked: t.checked
      };
    })
  };
}

describe("applicationMenu", () => {
  it("creates a File menu", () => {
    const template = createApplicationMenu() as unknown as unknown[];
    const menu = buildFakeMenu(template);

    const fileMenu = menu.items.find((item) => item.label === "File");
    expect(fileMenu).toBeDefined();
  });

  it("includes an Open item under File", () => {
    const template = createApplicationMenu() as unknown as unknown[];
    const menu = buildFakeMenu(template);

    const fileMenu = menu.items.find((item) => item.label === "File");
    expect(fileMenu).toBeDefined();
    expect(fileMenu?.submenu).toBeDefined();

    const openItem = fileMenu?.submenu?.find((item) => item.label === "Open");
    expect(openItem).toBeDefined();
  });

  it("assigns a stable menu item id to the Open item", () => {
    const template = createApplicationMenu() as unknown as unknown[];
    const menu = buildFakeMenu(template);

    const fileMenu = menu.items.find((item) => item.label === "File");
    const openItem = fileMenu?.submenu?.find((item) => item.label === "Open");

    expect(openItem?.id).toBe("file-open");
  });

  it("File -> Open callback invokes the provided callback", () => {
    const onOpenCallback = vi.fn();
    const template = createApplicationMenu(onOpenCallback) as unknown as unknown[];
    const menu = buildFakeMenu(template);

    const fileMenu = menu.items.find((item) => item.label === "File");
    const openItem = fileMenu?.submenu?.find((item) => item.label === "Open");

    expect(openItem?.click).toBeDefined();
    openItem?.click?.();

    expect(onOpenCallback).toHaveBeenCalledTimes(1);
  });

  it("View menu contains Show Table of Contents", () => {
    const template = createApplicationMenu() as unknown as unknown[];
    const menu = buildFakeMenu(template);

    const viewMenu = menu.items.find((item) => item.label === "View");
    expect(viewMenu).toBeDefined();
    expect(viewMenu?.submenu).toBeDefined();

    const tocItem = viewMenu?.submenu?.find((item) => item.label === "Show Table of Contents");
    expect(tocItem).toBeDefined();
  });

  it("Show Table of Contents item has id view-toggle-table-of-contents", () => {
    const template = createApplicationMenu() as unknown as unknown[];
    const menu = buildFakeMenu(template);

    const viewMenu = menu.items.find((item) => item.label === "View");
    const tocItem = viewMenu?.submenu?.find((item) => item.label === "Show Table of Contents");

    expect(tocItem?.id).toBe("view-toggle-table-of-contents");
  });

  it("Show Table of Contents item is a checkbox", () => {
    const template = createApplicationMenu() as unknown as unknown[];
    const menu = buildFakeMenu(template);

    const viewMenu = menu.items.find((item) => item.label === "View");
    const tocItem = viewMenu?.submenu?.find((item) => item.label === "Show Table of Contents") as unknown as { type?: string };

    expect(tocItem?.type).toBe("checkbox");
  });

  it("Show Table of Contents item starts unchecked", () => {
    const template = createApplicationMenu() as unknown as unknown[];
    const menu = buildFakeMenu(template);

    const viewMenu = menu.items.find((item) => item.label === "View");
    const tocItem = viewMenu?.submenu?.find((item) => item.label === "Show Table of Contents") as unknown as { checked?: boolean };

    expect(tocItem?.checked).toBe(false);
  });

  it("Show Table of Contents callback invokes the provided toggle callback", () => {
    const onToggleTocCallback = vi.fn();
    const template = createApplicationMenu(() => {}, onToggleTocCallback) as unknown as unknown[];
    const menu = buildFakeMenu(template);

    const viewMenu = menu.items.find((item) => item.label === "View");
    const tocItem = viewMenu?.submenu?.find((item) => item.label === "Show Table of Contents");

    expect(tocItem?.click).toBeDefined();
    tocItem?.click?.();

    expect(onToggleTocCallback).toHaveBeenCalledTimes(1);
  });
});

import { describe, it, expect, vi } from "vitest";
import { createApplicationMenu } from "./applicationMenu";

vi.mock("electron", () => ({
  app: {
    name: "Markdown Viewer"
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
}

interface TemplateItem {
  label?: string;
  submenu?: TemplateItem[];
  id?: string;
  click?: () => void;
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
        click: t.click
      };
    })
  };
}

describe("applicationMenu", () => {
  it("uses the app name for the macOS application menu", () => {
    const platformDescriptor = Object.getOwnPropertyDescriptor(process, "platform");
    Object.defineProperty(process, "platform", {
      value: "darwin"
    });

    try {
      const template = createApplicationMenu() as unknown as unknown[];
      const menu = buildFakeMenu(template);

      expect(menu.items[0]?.label).toBe("Markdown Viewer");
    } finally {
      if (platformDescriptor) {
        Object.defineProperty(process, "platform", platformDescriptor);
      }
    }
  });

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
});

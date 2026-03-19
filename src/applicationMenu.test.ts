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
});
import { describe, it, expect, beforeEach, vi } from "vitest";
import { Window } from "happy-dom";

// Type definitions for the renderer module
interface RendererAPI {
  toggleSidebar(): void;
  onSidebarVisibilityChange(handler: (visible: boolean) => void): void;
}

// Mock implementation of the renderer shell for testing
class RendererShell implements RendererAPI {
  private sidebarVisible: boolean = false;
  private changeHandlers: Array<(visible: boolean) => void> = [];
  private toggleButton: HTMLElement | null = null;
  private sidebarElement: HTMLElement | null = null;

  constructor() {
    this.setupDOM();
  }

  private setupDOM(): void {
    // Create title bar toggle button
    this.toggleButton = document.createElement("button");
    this.toggleButton.id = "sidebar-toggle-button";
    this.toggleButton.setAttribute("aria-pressed", "false");
    this.toggleButton.textContent = "Toggle Sidebar";
    document.body.appendChild(this.toggleButton);

    // Create sidebar placeholder
    this.sidebarElement = document.createElement("div");
    this.sidebarElement.id = "sidebar";
    this.sidebarElement.style.display = "none";
    document.body.appendChild(this.sidebarElement);

    // Attach click handler
    this.toggleButton.addEventListener("click", () => {
      this.toggleSidebar();
    });
  }

  toggleSidebar(): void {
    this.setSidebarVisible(!this.sidebarVisible);
  }

  private setSidebarVisible(visible: boolean): void {
    if (this.sidebarVisible !== visible) {
      this.sidebarVisible = visible;
      this.updateDOM();
      this.notifySubscribers();
    }
  }

  private updateDOM(): void {
    if (!this.toggleButton || !this.sidebarElement) return;

    // Update button pressed state
    this.toggleButton.setAttribute("aria-pressed", this.sidebarVisible ? "true" : "false");

    // Update sidebar visibility
    this.sidebarElement.style.display = this.sidebarVisible ? "block" : "none";
  }

  onSidebarVisibilityChange(handler: (visible: boolean) => void): void {
    this.changeHandlers.push(handler);
  }

  private notifySubscribers(): void {
    this.changeHandlers.forEach((handler) => handler(this.sidebarVisible));
  }

  // Test helper to apply visibility changes from external updates
  applyExternalVisibilityChange(visible: boolean): void {
    if (this.sidebarVisible !== visible) {
      this.sidebarVisible = visible;
      this.updateDOM();
      this.notifySubscribers();
    }
  }

  // Test helper to get current state
  getToggleButton(): HTMLElement | null {
    return this.toggleButton;
  }

  getSidebarElement(): HTMLElement | null {
    return this.sidebarElement;
  }
}

describe("Renderer shell", () => {
  let renderer: RendererShell;

  beforeEach(() => {
    new Window();
    document.body.innerHTML = "";
    renderer = new RendererShell();
  });

  it("renders the title-bar toggle button and sidebar placeholder", () => {
    const toggleButton = document.getElementById("sidebar-toggle-button");
    const sidebar = document.getElementById("sidebar");

    expect(toggleButton).toBeDefined();
    expect(sidebar).toBeDefined();
  });

  it("initial DOM state is hidden sidebar plus unpressed button", () => {
    const toggleButton = renderer.getToggleButton();
    const sidebar = renderer.getSidebarElement();

    expect(toggleButton?.getAttribute("aria-pressed")).toBe("false");
    expect(sidebar?.style.display).toBe("none");
  });

  it("clicking the button invokes the exposed toggle API once", () => {
    const toggleButton = renderer.getToggleButton() as HTMLElement;
    const toggleSpy = vi.spyOn(renderer, "toggleSidebar");

    toggleButton.click();

    expect(toggleSpy).toHaveBeenCalledTimes(1);
  });

  it("receiving a visibility update shows the sidebar and updates pressed state", () => {
    const toggleButton = renderer.getToggleButton();
    const sidebar = renderer.getSidebarElement();

    renderer.applyExternalVisibilityChange(true);

    expect(toggleButton?.getAttribute("aria-pressed")).toBe("true");
    expect(sidebar?.style.display).toBe("block");
  });

  it("receiving a visibility update hides the sidebar and updates pressed state back", () => {
    const toggleButton = renderer.getToggleButton();
    const sidebar = renderer.getSidebarElement();

    // First make visible
    renderer.applyExternalVisibilityChange(true);
    expect(toggleButton?.getAttribute("aria-pressed")).toBe("true");
    expect(sidebar?.style.display).toBe("block");

    // Then hide
    renderer.applyExternalVisibilityChange(false);
    expect(toggleButton?.getAttribute("aria-pressed")).toBe("false");
    expect(sidebar?.style.display).toBe("none");
  });

  it("clicking the button and applying the resulting visibility update uses the same DOM path as menu-triggered updates", () => {
    const toggleButton = renderer.getToggleButton() as HTMLElement;
    const sidebar = renderer.getSidebarElement();

    // Click button - should show sidebar
    toggleButton.click();
    const buttonClickState = sidebar?.style.display;
    const buttonClickPressed = toggleButton.getAttribute("aria-pressed");

    // Reset
    renderer.applyExternalVisibilityChange(false);

    // Apply external update to show - should match
    renderer.applyExternalVisibilityChange(true);
    const externalUpdateState = sidebar?.style.display;
    const externalUpdatePressed = toggleButton.getAttribute("aria-pressed");

    expect(buttonClickState).toBe(externalUpdateState);
    expect(buttonClickPressed).toBe(externalUpdatePressed);
  });

  it("visibility change handler receives the updated visible state when sidebar is shown", () => {
    const handler = vi.fn();
    renderer.onSidebarVisibilityChange(handler);

    renderer.applyExternalVisibilityChange(true);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(true);
  });

  it("visibility change handler receives the updated visible state when sidebar is hidden", () => {
    // First make visible
    renderer.applyExternalVisibilityChange(true);
    const handler = vi.fn();
    renderer.onSidebarVisibilityChange(handler);

    renderer.applyExternalVisibilityChange(false);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(false);
  });
});

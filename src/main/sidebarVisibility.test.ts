import { describe, it, expect, beforeEach, vi } from "vitest";
import { SidebarVisibility } from "./sidebarVisibility";

describe("SidebarVisibility", () => {
  let visibility: SidebarVisibility;

  beforeEach(() => {
    visibility = new SidebarVisibility();
  });

  it("sidebar starts hidden", () => {
    expect(visibility.getCurrentVisibility()).toBe(false);
  });

  it("toggle flips hidden to visible", () => {
    visibility.toggle();
    expect(visibility.getCurrentVisibility()).toBe(true);
  });

  it("toggle flips visible back to hidden", () => {
    visibility.toggle();
    visibility.toggle();
    expect(visibility.getCurrentVisibility()).toBe(false);
  });

  it("toggle cycles through hidden -> visible -> hidden", () => {
    // Start hidden
    expect(visibility.getCurrentVisibility()).toBe(false);

    // First toggle: hidden -> visible
    visibility.toggle();
    expect(visibility.getCurrentVisibility()).toBe(true);

    // Second toggle: visible -> hidden
    visibility.toggle();
    expect(visibility.getCurrentVisibility()).toBe(false);
  });

  it("setVisible(true) when already visible does not emit change", () => {
    const handler = vi.fn();
    visibility.onVisibilityChange(handler);

    // Set to visible
    visibility.setVisible(true);
    expect(handler).toHaveBeenCalledTimes(1);

    // Set to visible again - should not emit
    visibility.setVisible(true);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("setVisible(false) when already hidden does not emit change", () => {
    const handler = vi.fn();
    visibility.onVisibilityChange(handler);

    // Already hidden, set to hidden - should not emit
    visibility.setVisible(false);
    expect(handler).toHaveBeenCalledTimes(0);
  });

  it("setVisible(true) when hidden emits change with true state", () => {
    const handler = vi.fn();
    visibility.onVisibilityChange(handler);

    visibility.setVisible(true);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(true);
  });

  it("setVisible(false) when visible emits change with false state", () => {
    // First make it visible
    visibility.setVisible(true);
    const handler = vi.fn();
    visibility.onVisibilityChange(handler);

    visibility.setVisible(false);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(false);
  });

  it("subscriber receives updated visible state on change", () => {
    const handler = vi.fn();
    visibility.onVisibilityChange(handler);

    visibility.setVisible(true);

    expect(handler).toHaveBeenCalledWith(true);
  });

  it("multiple subscribers receive visibility changes", () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    visibility.onVisibilityChange(handler1);
    visibility.onVisibilityChange(handler2);

    visibility.setVisible(true);

    expect(handler1).toHaveBeenCalledWith(true);
    expect(handler2).toHaveBeenCalledWith(true);
  });

  it("toggle notifies subscribers of new visibility state", () => {
    const handler = vi.fn();
    visibility.onVisibilityChange(handler);

    visibility.toggle();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(true);
  });
});

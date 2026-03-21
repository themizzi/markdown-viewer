import { describe, it, expect, beforeEach } from "vitest";
import { Window } from "happy-dom";
import { HtmlRenderer } from "./htmlRenderer.js";
import type { DiagramRenderer } from "../shared/contracts.js";

describe("HtmlRenderer", () => {
  let container: HTMLElement;

  beforeEach(() => {
    new Window();
    document.body.innerHTML = "";
    container = document.createElement("div");
    container.id = "root";
    document.body.appendChild(container);
  });

  it("throws when root element is missing", () => {
    expect(() => new HtmlRenderer("missing", [])).toThrow(
      "Missing #missing element"
    );
  });

  it("renders HTML to root element", async () => {
    // GIVEN
    const renderer = new HtmlRenderer("root", []);

    // WHEN
    await renderer.render("<p>Hello</p>");

    // THEN
    expect(container.innerHTML).toBe("<p>Hello</p>");
  });

  it("calls hydrate on all diagram renderers", async () => {
    // GIVEN
    const fakeRenderer: DiagramRenderer = {
      hydrate: (el: HTMLElement) => {
        el.setAttribute("data-hydrated", "true");
      },
      initialize: () => {},
    };
    const renderer = new HtmlRenderer("root", [fakeRenderer]);

    // WHEN
    await renderer.render("<p>Test</p>");

    // THEN
    expect(container.getAttribute("data-hydrated")).toBe("true");
  });

  it("calls run on all diagram renderers", async () => {
    // GIVEN
    let ran = false;
    const fakeRenderer: DiagramRenderer & { run?: () => Promise<void> } = {
      hydrate: () => {},
      initialize: () => {},
      run: async () => {
        ran = true;
      },
    };
    const renderer = new HtmlRenderer("root", [fakeRenderer]);

    // WHEN
    await renderer.render("<p>Test</p>");

    // THEN
    expect(ran).toBe(true);
  });

  it("handles renderer without run method", async () => {
    // GIVEN
    const fakeRenderer: DiagramRenderer = {
      hydrate: () => {},
      initialize: () => {},
    };
    const renderer = new HtmlRenderer("root", [fakeRenderer]);

    // WHEN
    await renderer.render("<p>Test</p>");

    // THEN
    expect(container.innerHTML).toBe("<p>Test</p>");
  });

  it("handles renderer with undefined run result", async () => {
    // GIVEN
    const fakeRenderer: DiagramRenderer & { run?: () => undefined } = {
      hydrate: () => {},
      initialize: () => {},
      run: () => undefined,
    };
    const renderer = new HtmlRenderer("root", [fakeRenderer]);

    // WHEN
    await renderer.render("<p>Test</p>");

    // THEN
    expect(container.innerHTML).toBe("<p>Test</p>");
  });

  it("calls multiple renderers in sequence for hydrate", async () => {
    // GIVEN
    const order: string[] = [];
    const fakeRenderer1: DiagramRenderer & { run?: () => Promise<void> } = {
      hydrate: () => { order.push("hydrate1"); },
      initialize: () => {},
      run: async () => { order.push("run1"); },
    };
    const fakeRenderer2: DiagramRenderer & { run?: () => Promise<void> } = {
      hydrate: () => { order.push("hydrate2"); },
      initialize: () => {},
      run: async () => { order.push("run2"); },
    };
    const renderer = new HtmlRenderer("root", [fakeRenderer1, fakeRenderer2]);

    // WHEN
    await renderer.render("<p>Test</p>");

    // THEN
    expect(order).toEqual(["hydrate1", "hydrate2", "run1", "run2"]);
  });
});

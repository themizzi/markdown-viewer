import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MermaidRenderer } from "./mermaidRenderer.js";
import type { MermaidApi } from "../shared/contracts.js";

describe("MermaidRenderer", () => {
  let mockMermaid: MermaidApi;
  let renderer: MermaidRenderer;

  beforeEach(() => {
    mockMermaid = {
      initialize: vi.fn(),
      run: vi.fn().mockResolvedValue(undefined),
    };
    renderer = new MermaidRenderer(mockMermaid);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("initialize", () => {
    it("calls mermaid.initialize with correct config", () => {
      // WHEN
      renderer.initialize();

      // THEN
      expect(mockMermaid.initialize).toHaveBeenCalledWith({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "default",
      });
    });
  });

  describe("hydrate", () => {
    it("finds and transforms mermaid code blocks", () => {
      // GIVEN
      const container = document.createElement("div");
      const pre = document.createElement("pre");
      const code = document.createElement("code");
      code.className = "language-mermaid";
      code.textContent = "graph TD; A-->B;";
      pre.appendChild(code);
      container.appendChild(pre);

      // WHEN
      renderer.hydrate(container);

      // THEN
      const mermaidDiv = container.querySelector(".mermaid");
      expect(mermaidDiv?.textContent).toBe("graph TD; A-->B;");
      expect(container.querySelector("pre")).toBeNull();
    });

    it("skips non-mermaid code blocks", () => {
      // GIVEN
      const container = document.createElement("div");
      const pre = document.createElement("pre");
      const code = document.createElement("code");
      code.className = "language-javascript";
      code.textContent = "const x = 1;";
      pre.appendChild(code);
      container.appendChild(pre);

      // WHEN
      renderer.hydrate(container);

      // THEN
      expect(container.querySelector("pre")).not.toBeNull();
      expect(container.querySelector(".mermaid")).toBeNull();
    });

    it("handles missing parent element gracefully", () => {
      // GIVEN
      const container = document.createElement("div");
      const pre = document.createElement("pre");
      const code = document.createElement("code");
      code.className = "language-mermaid";
      code.textContent = "graph TD;";
      pre.appendChild(code);
      container.appendChild(pre);
      Object.defineProperty(code, "parentElement", { value: null });

      // WHEN
      renderer.hydrate(container);

      // THEN
      expect(container.querySelector(".mermaid")).toBeNull();
    });

    it("handles empty code block", () => {
      // GIVEN
      const container = document.createElement("div");
      const pre = document.createElement("pre");
      const code = document.createElement("code");
      code.className = "language-mermaid";
      code.textContent = "";
      pre.appendChild(code);
      container.appendChild(pre);

      // WHEN
      renderer.hydrate(container);

      // THEN
      const mermaidDiv = container.querySelector(".mermaid");
      expect(mermaidDiv?.textContent).toBe("");
    });

    it("handles null textContent", () => {
      // GIVEN
      const container = document.createElement("div");
      const pre = document.createElement("pre");
      const code = document.createElement("code");
      code.className = "language-mermaid";
      Object.defineProperty(code, "textContent", {
        value: null,
        configurable: true,
      });
      pre.appendChild(code);
      container.appendChild(pre);

      // WHEN
      renderer.hydrate(container);

      // THEN
      const mermaidDiv = container.querySelector(".mermaid");
      expect(mermaidDiv?.textContent).toBe("");
    });
  });

  describe("run", () => {
    it("calls mermaid.run with query selector", async () => {
      // WHEN
      await renderer.run();

      // THEN
      expect(mockMermaid.run).toHaveBeenCalledWith({
        querySelector: ".mermaid",
      });
    });

    it("returns a Promise", async () => {
      // WHEN
      const result = renderer.run();

      // THEN
      expect(result).toBeInstanceOf(Promise);
      await result;
    });
  });
});
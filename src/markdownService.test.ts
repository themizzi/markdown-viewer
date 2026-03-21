import { describe, it, expect } from "vitest";
import { marked } from "marked";
import { MarkedMarkdownService } from "./markdownService";

describe("MarkedMarkdownService", () => {
  it("parses markdown and returns HTML", () => {
    const service = new MarkedMarkdownService(marked);

    const result = service.render("# Hello");

    expect(result.html).toBe("<h1 id=\"hello\">Hello</h1>");
    expect(result.toc).toEqual([{ id: "hello", text: "Hello", level: 1 }]);
  });

  it("parses markdown with multiple elements", () => {
    const service = new MarkedMarkdownService(marked);

    const result = service.render("# Hello\n\nWorld");

    expect(result.html).toBe("<h1 id=\"hello\">Hello</h1><p>World</p>\n");
    expect(result.toc).toEqual([{ id: "hello", text: "Hello", level: 1 }]);
  });

  it("parses markdown with inline code", () => {
    const service = new MarkedMarkdownService(marked);

    const result = service.render("Run `npm install`");

    expect(result.html).toBe("<p>Run <code>npm install</code></p>\n");
    expect(result.toc).toBeUndefined();
  });

  it("preserves relative image paths in rendered HTML", () => {
    const service = new MarkedMarkdownService(marked);

    const result = service.render("![icon](assets/icon.png)");

    expect(result.html).toBe('<p><img src="assets/icon.png" alt="icon"></p>\n');
    expect(result.toc).toBeUndefined();
  });
});

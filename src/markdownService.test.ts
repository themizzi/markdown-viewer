import { describe, it, expect } from "vitest";
import { marked } from "marked";
import { MarkedMarkdownService } from "./markdownService";

describe("MarkedMarkdownService", () => {
  it("parses markdown and returns HTML", () => {
    const service = new MarkedMarkdownService(marked);

    const result = service.render("# Hello");

    expect(result).toBe("<h1>Hello</h1>\n");
  });

  it("parses markdown with multiple elements", () => {
    const service = new MarkedMarkdownService(marked);

    const result = service.render("# Hello\n\nWorld");

    expect(result).toBe("<h1>Hello</h1>\n<p>World</p>\n");
  });

  it("parses markdown with inline code", () => {
    const service = new MarkedMarkdownService(marked);

    const result = service.render("Run `npm install`");

    expect(result).toBe("<p>Run <code>npm install</code></p>\n");
  });

  it("preserves relative image paths in rendered HTML", () => {
    const service = new MarkedMarkdownService(marked);

    const result = service.render("![icon](assets/icon.png)");

    expect(result).toBe('<p><img src="assets/icon.png" alt="icon"></p>\n');
  });

  it("skips highlighting for mermaid blocks", () => {
    const service = new MarkedMarkdownService(marked);

    const result = service.render("```mermaid\ngraph TD;\nA-->B;\n```");

    expect(result).not.toContain("hljs-");
    expect(result).toContain("language-mermaid");
  });

  it("highlights typescript code blocks", () => {
    const service = new MarkedMarkdownService(marked);

    const result = service.render("```typescript\nconst x = 1;\n```");

    expect(result).toMatch(/<span class="[^"]*hljs-[^"]*"/);
    expect(result).toContain("language-typescript");
    expect(result).toContain('class="hljs language-typescript"');
  });
});

import { describe, it, expect } from "vitest";
import { createSyntaxHighlighter } from "./syntaxHighlighter";

describe("SyntaxHighlighter", () => {
  const highlighter = createSyntaxHighlighter();

  it("highlights typescript code", () => {
    const code = "const x: number = 1;";
    const result = highlighter.highlight(code, "typescript");
    expect(result).toMatch(/<span class="[^"]*hljs-[^"]*"/);
  });

  it("falls back to auto-detection for unknown language", () => {
    const code = "const x = 1;";
    const result = highlighter.highlight(code, "notalanguage");
    expect(result).toContain("hljs");
  });

  it("falls back to auto-detection when no language provided", () => {
    const code = "const x = 1;";
    const result = highlighter.highlight(code);
    expect(result).toContain("hljs");
  });

  it("highlights python code", () => {
    const code = "def hello():\n    print('Hello')";
    const result = highlighter.highlight(code, "python");
    expect(result).toMatch(/<span class="[^"]*hljs-[^"]*"/);
  });

  it("highlights json code", () => {
    const code = '{"key": "value"}';
    const result = highlighter.highlight(code, "json");
    expect(result).toMatch(/<span class="[^"]*hljs-[^"]*"/);
  });

  it("highlightAuto detects language and returns highlighted HTML", () => {
    const code = "function test() { return true; }";
    const result = highlighter.highlightAuto(code);
    expect(result).toContain("hljs");
  });
});
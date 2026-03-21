import { marked } from "marked";
import type { MarkdownRenderer, TableOfContentsItem } from "./contracts";

type MarkedInstance = typeof marked;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export class MarkedMarkdownService implements MarkdownRenderer {
  constructor(private readonly marked: MarkedInstance) {
    const renderer = new this.marked.Renderer();
    renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
      const id = slugify(text);
      return `<h${depth} id="${id}">${text}</h${depth}>`;
    };
    this.marked.setOptions({ renderer, gfm: true });
  }

  render(markdown: string): { html: string; toc?: TableOfContentsItem[] } {
    const tokens = this.marked.lexer(markdown);
    const toc: TableOfContentsItem[] = [];

    for (const token of tokens) {
      if (token.type === "heading") {
        const text = token.text || "";
        toc.push({
          id: slugify(text),
          text: text,
          level: token.depth,
        });
      }
    }

    const html = this.marked.parse(markdown) as string;
    return { html, toc: toc.length > 0 ? toc : undefined };
  }
}

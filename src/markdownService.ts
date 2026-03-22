import { marked } from "marked";
import type { MarkdownRenderer, TableOfContentsItem } from "./contracts";
import { createSyntaxHighlighter } from "./syntaxHighlighter";

type MarkedInstance = typeof marked;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

interface CodeToken {
  text: string;
  lang?: string;
  escaped?: boolean;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export class MarkedMarkdownService implements MarkdownRenderer {
  private readonly syntaxHighlighter = createSyntaxHighlighter();

  constructor(private readonly marked: MarkedInstance) {
    const syntaxHighlighter = this.syntaxHighlighter;
    const renderer = new this.marked.Renderer();

    renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
      const id = slugify(text);
      return `<h${depth} id="${id}">${text}</h${depth}>`;
    };

    renderer.code = function(token: CodeToken): string {
      const code = token.escaped ? token.text : escapeHtml(token.text);
      const language = token.lang;

      if (language === "mermaid") {
        return `<pre><code class="language-mermaid">${code}</code></pre>`;
      }

      const highlighted = syntaxHighlighter.highlight(token.text, language);

      const classes = ["hljs", ...(language ? [`language-${language}`] : [])];
      const classAttr = `class="${classes.join(" ")}"`;
      return `<pre><code ${classAttr}>${highlighted}</code></pre>`;
    };

    this.marked.setOptions({ renderer, gfm: true, breaks: false });
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

    const html = this.marked.parser(tokens) as string;
    return { html, toc: toc.length > 0 ? toc : undefined };
  }
}

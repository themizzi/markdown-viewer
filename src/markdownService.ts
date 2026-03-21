import { marked } from "marked";
import type { MarkdownRenderer } from "./contracts";
import { createSyntaxHighlighter } from "./syntaxHighlighter";

interface CodeToken {
  text: string;
  lang?: string;
  escaped?: boolean;
}

type MarkedInstance = typeof marked;

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
    this.marked.use({
      gfm: true,
      breaks: false,
      renderer: {
        code(token: CodeToken): string {
          const code = token.escaped ? token.text : escapeHtml(token.text);
          const language = token.lang;

          if (language === "mermaid") {
            return `<pre><code class="language-mermaid">${code}</code></pre>`;
          }

          const highlighted = syntaxHighlighter.highlight(token.text, language);

          const classes = ["hljs", ...(language ? [`language-${language}`] : [])];
          const classAttr = `class="${classes.join(" ")}"`;
          return `<pre><code ${classAttr}>${highlighted}</code></pre>`;
        }
      }
    });
  }

  render(markdown: string): string {
    return this.marked.parse(markdown) as string;
  }
}

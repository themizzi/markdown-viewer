import { marked } from "marked";
import type { MarkdownRenderer } from "./contracts";

export class MarkedMarkdownService implements MarkdownRenderer {
  constructor() {
    marked.setOptions({ gfm: true });
  }

  render(markdown: string): string {
    return marked.parse(markdown) as string;
  }
}
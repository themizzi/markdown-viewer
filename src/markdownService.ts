import { marked } from "marked";
import type { MarkdownRenderer } from "./contracts";

type MarkedInstance = typeof marked;

export class MarkedMarkdownService implements MarkdownRenderer {
  constructor(private readonly marked: MarkedInstance) {}

  render(markdown: string): string {
    return this.marked.parse(markdown) as string;
  }
}
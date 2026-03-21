import type { DiagramRenderer, MermaidApi } from "../shared/contracts.js";

export class MermaidRenderer implements DiagramRenderer {
  private readonly mermaid: MermaidApi;

  constructor(mermaid: MermaidApi) {
    this.mermaid = mermaid;
  }

  initialize(): void {
    this.mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "default"
    });
  }

  hydrate(container: HTMLElement): void {
    const codeBlocks = container.querySelectorAll("pre > code.language-mermaid");

    codeBlocks.forEach((code) => {
      const pre = code.parentElement;
      if (!pre) return;

      const div = document.createElement("div");
      div.className = "mermaid";
      div.textContent = code.textContent ?? "";
      pre.replaceWith(div);
    });
  }

  async run(): Promise<void> {
    await Promise.resolve(this.mermaid.run({ querySelector: ".mermaid" }));
  }
}
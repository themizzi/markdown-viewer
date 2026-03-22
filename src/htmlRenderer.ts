import type { DiagramRenderer } from "./contracts";

export class HtmlRenderer {
  private readonly root: HTMLElement;
  private readonly diagramRenderers: DiagramRenderer[];

  constructor(rootId: string, diagramRenderers: DiagramRenderer[]) {
    const root = document.getElementById(rootId);
    if (!root) {
      throw new Error(`Missing #${rootId} element`);
    }
    this.root = root as HTMLElement;
    this.diagramRenderers = diagramRenderers;
  }

  getRoot(): HTMLElement {
    return this.root;
  }

  async render(html: string): Promise<void> {
    this.root.innerHTML = html;
    for (const renderer of this.diagramRenderers) {
      renderer.hydrate(this.root);
    }
    await Promise.all(
      this.diagramRenderers.map((renderer) => {
        const result = (renderer as { run?: () => Promise<void> }).run?.();
        return result ?? Promise.resolve();
      })
    );
  }
}

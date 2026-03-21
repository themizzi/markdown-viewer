import type { ViewerApi } from "./contracts";
import { HtmlRenderer } from "./htmlRenderer";
import { MermaidRenderer } from "./mermaidRenderer";

/**
 * Bootstrap application renderer with HTML and Mermaid support.
 */
export class AppBootstrap {
  private readonly viewerApi: ViewerApi;
  private readonly htmlRenderer: HtmlRenderer;

  constructor(viewerApi: ViewerApi, htmlRenderer: HtmlRenderer) {
    this.viewerApi = viewerApi;
    this.htmlRenderer = htmlRenderer;
  }

  async start(): Promise<void> {
    const initialDocument = await this.viewerApi.getHtml();
    await this.htmlRenderer.render(initialDocument.html);

    this.viewerApi.onHtmlUpdated((nextDocument) => {
      void this.htmlRenderer.render(nextDocument.html);
    });
  }
}

/**
 * Create a bootstrapped app instance with renderers.
 */
export function createApp(viewerApi: ViewerApi, mermaid: unknown): AppBootstrap {
  const mermaidRenderer = new MermaidRenderer(mermaid as never);
  mermaidRenderer.initialize();

  const htmlRenderer = new HtmlRenderer("app", [mermaidRenderer]);

  return new AppBootstrap(viewerApi, htmlRenderer);
}

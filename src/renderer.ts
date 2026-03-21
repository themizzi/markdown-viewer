declare global {
  interface Window {
    viewerApi: {
      getHtml: () => Promise<import("./contracts").RenderedDocument>;
      onHtmlUpdated: (handler: (document: import("./contracts").RenderedDocument) => void) => () => void;
      sidebar: import("./contracts").SidebarApi;
    };
    mermaid: {
      initialize: (config: Record<string, unknown>) => void;
      run: (options?: Record<string, unknown>) => Promise<void> | void;
    };
  }
}

import type { ViewerApi } from "./contracts";
import { HtmlRenderer } from "./htmlRenderer";
import { MermaidRenderer } from "./mermaidRenderer";

class AppBootstrap {
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

function createApp(viewerApi: ViewerApi, mermaid: unknown): AppBootstrap {
  const mermaidRenderer = new MermaidRenderer(mermaid as never);
  mermaidRenderer.initialize();

  const htmlRenderer = new HtmlRenderer("app", [mermaidRenderer]);

  return new AppBootstrap(viewerApi, htmlRenderer);
}

const mermaidApi = window.mermaid as never;
const viewerApi: ViewerApi = window.viewerApi;

const app = createApp(viewerApi, mermaidApi);
void app.start();

declare global {
  interface Window {
    viewerApi: {
      getHtml: () => Promise<string>;
      onHtmlUpdated: (handler: (html: string) => void) => () => void;
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
    const initialHtml = await this.viewerApi.getHtml();
    await this.htmlRenderer.render(initialHtml);

    this.viewerApi.onHtmlUpdated((nextHtml: string) => {
      void this.htmlRenderer.render(nextHtml);
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
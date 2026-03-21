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
import { createApp } from "./rendererBootstrap";

const mermaidApi = window.mermaid as never;
const viewerApi: ViewerApi = window.viewerApi;

const app = createApp(viewerApi, mermaidApi);
void app.start();

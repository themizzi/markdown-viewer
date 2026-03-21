import type { MermaidApi, ViewerApi } from "./contracts";
import { createApp } from "./rendererBootstrap";

declare global {
  interface Window {
    viewerApi: ViewerApi;
    mermaid: MermaidApi;
  }
}

const viewerApi: ViewerApi = window.viewerApi;
const mermaidApi: MermaidApi = window.mermaid;

const app = createApp(viewerApi, mermaidApi);
void app.start();

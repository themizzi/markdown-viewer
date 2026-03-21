import type { MermaidApi, ViewerApi } from "../shared/contracts.js";
import { createApp } from "./rendererBootstrap.js";

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

import type { MermaidApi, ViewerApi } from "./contracts";
import mermaid from "mermaid";
import { createApp } from "./rendererBootstrap";

declare global {
  interface Window {
    viewerApi: ViewerApi;
  }
}

const viewerApi: ViewerApi = window.viewerApi;
const mermaidApi: MermaidApi = mermaid;

const app = createApp(viewerApi, mermaidApi);
void app.start();

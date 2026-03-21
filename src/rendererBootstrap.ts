import type { MermaidApi, ViewerApi } from "./contracts";
import { HtmlRenderer } from "./htmlRenderer";
import { MermaidRenderer } from "./mermaidRenderer";

interface DomElements {
  baseHrefElement: HTMLBaseElement;
  tocToggleButton: HTMLButtonElement;
  tocSidebar: HTMLElement;
}

function queryDomElements(): DomElements {
  const root = document.getElementById("app");
  if (!root) {
    throw new Error("Missing #app element");
  }

  const tocToggleButton = document.querySelector('[data-testid="toc-toggle-button"]');
  if (!(tocToggleButton instanceof HTMLButtonElement)) {
    throw new Error("Missing table of contents toggle button");
  }

  const tocSidebar = document.querySelector('[data-testid="toc-sidebar"]');
  if (!(tocSidebar instanceof HTMLElement)) {
    throw new Error("Missing table of contents sidebar");
  }

  const baseHrefElement = document.getElementById("document-base");
  if (!(baseHrefElement instanceof HTMLBaseElement)) {
    throw new Error("Missing document base element");
  }

  return { baseHrefElement, tocToggleButton, tocSidebar };
}

export class AppBootstrap {
  private readonly viewerApi: ViewerApi;
  private readonly htmlRenderer: HtmlRenderer;
  private readonly baseHrefElement: HTMLBaseElement;
  private readonly tocToggleButton: HTMLButtonElement;
  private readonly tocSidebar: HTMLElement;

  constructor(
    viewerApi: ViewerApi,
    htmlRenderer: HtmlRenderer,
    baseHrefElement: HTMLBaseElement,
    tocToggleButton: HTMLButtonElement,
    tocSidebar: HTMLElement
  ) {
    this.viewerApi = viewerApi;
    this.htmlRenderer = htmlRenderer;
    this.baseHrefElement = baseHrefElement;
    this.tocToggleButton = tocToggleButton;
    this.tocSidebar = tocSidebar;
  }

  async start(): Promise<void> {
    await this.initSidebar();
    const initialDocument = await this.viewerApi.getHtml();
    await this.renderDocument(initialDocument);
    this.viewerApi.onHtmlUpdated((nextDocument) => {
      void this.renderDocument(nextDocument);
    });
  }

  private async renderDocument(document: { html: string; baseHref: string }): Promise<void> {
    this.baseHrefElement.href = document.baseHref;
    await this.htmlRenderer.render(document.html);
  }

  private applySidebarVisibility(visible: boolean): void {
    this.tocSidebar.hidden = !visible;
    this.tocToggleButton.setAttribute("aria-pressed", visible ? "true" : "false");
  }

  private async initSidebar(): Promise<void> {
    const initialVisibility = await this.viewerApi.sidebar.getInitialVisibility();
    this.applySidebarVisibility(initialVisibility);

    const handleToggleClick = () => {
      void this.viewerApi.sidebar.requestToggleSidebar();
    };
    this.tocToggleButton.addEventListener("click", handleToggleClick);

    this.viewerApi.sidebar.onVisibilityChanged((visible) => {
      this.applySidebarVisibility(visible);
    });
  }
}

export function createApp(viewerApi: ViewerApi, mermaid: MermaidApi): AppBootstrap {
  const { baseHrefElement, tocToggleButton, tocSidebar } = queryDomElements();

  const mermaidRenderer = new MermaidRenderer(mermaid);
  mermaidRenderer.initialize();

  const htmlRenderer = new HtmlRenderer("app", [mermaidRenderer]);

  return new AppBootstrap(viewerApi, htmlRenderer, baseHrefElement, tocToggleButton, tocSidebar);
}

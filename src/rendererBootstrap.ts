import type { MermaidApi, ViewerApi } from "./contracts";
import { HtmlRenderer } from "./htmlRenderer";
import { MermaidRenderer } from "./mermaidRenderer";

/**
 * Bootstrap application renderer with HTML and Mermaid support.
 */
export class AppBootstrap {
  private readonly viewerApi: ViewerApi;
  private readonly htmlRenderer: HtmlRenderer;
  private readonly documentBase: HTMLBaseElement;
  private readonly tocToggleButton: HTMLButtonElement;
  private readonly tocSidebar: HTMLElement;

  constructor(
    viewerApi: ViewerApi,
    htmlRenderer: HtmlRenderer,
    documentBase: HTMLBaseElement,
    tocToggleButton: HTMLButtonElement,
    tocSidebar: HTMLElement
  ) {
    this.viewerApi = viewerApi;
    this.htmlRenderer = htmlRenderer;
    this.documentBase = documentBase;
    this.tocToggleButton = tocToggleButton;
    this.tocSidebar = tocSidebar;
  }

  async start(): Promise<void> {
    // Initialize sidebar visibility
    await this.initSidebar();

    // Render initial document
    const initialDocument = await this.viewerApi.getHtml();
    await this.renderDocument(initialDocument);

    // Subscribe to updates
    this.viewerApi.onHtmlUpdated((nextDocument) => {
      void this.renderDocument(nextDocument);
    });
  }

  private async renderDocument(document: { html: string; baseHref: string }): Promise<void> {
    this.documentBase.href = document.baseHref;
    await this.htmlRenderer.render(document.html);
  }

  private applySidebarVisibility(visible: boolean): void {
    this.tocSidebar.hidden = !visible;
    this.tocToggleButton.setAttribute("aria-pressed", visible ? "true" : "false");
  }

  private async initSidebar(): Promise<void> {
    const initialVisibility = await this.viewerApi.sidebar.getInitialVisibility();
    this.applySidebarVisibility(initialVisibility);

    this.tocToggleButton.addEventListener("click", () => {
      void this.viewerApi.sidebar.requestToggleSidebar();
    });

    this.viewerApi.sidebar.onVisibilityChanged((visible) => {
      this.applySidebarVisibility(visible);
    });
  }
}

/**
 * Create a bootstrapped app instance with renderers.
 */
export function createApp(viewerApi: ViewerApi, mermaid: MermaidApi): AppBootstrap {
  // Validate required DOM elements
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

  const documentBase = document.getElementById("document-base");
  if (!(documentBase instanceof HTMLBaseElement)) {
    throw new Error("Missing document base element");
  }

  // Initialize mermaid renderer
  const mermaidRenderer = new MermaidRenderer(mermaid);
  mermaidRenderer.initialize();

  // Create HTML renderer with mermaid support
  const htmlRenderer = new HtmlRenderer("app", [mermaidRenderer]);

  // Create bootstrap instance with all required elements
  return new AppBootstrap(viewerApi, htmlRenderer, documentBase, tocToggleButton, tocSidebar);
}

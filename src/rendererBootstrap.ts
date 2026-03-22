import type { MermaidApi, RenderedDocument, TableOfContentsItem, ViewerApi } from "./contracts";
import { HtmlRenderer } from "./htmlRenderer";
import { MermaidRenderer } from "./mermaidRenderer";
import { SidebarResize } from "./sidebarResize";

interface DomElements {
  baseHrefElement: HTMLBaseElement;
  tocToggleButton: HTMLButtonElement;
  tocSidebar: HTMLElement;
  resizeHandle: HTMLElement;
}

function queryDomElements(): DomElements {
  if (!document.getElementById("app")) {
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

  const resizeHandle = document.querySelector('[data-testid="resize-handle"]');
  if (!(resizeHandle instanceof HTMLElement)) {
    throw new Error("Missing resize handle");
  }

  const baseHrefElement = document.getElementById("document-base");
  if (!(baseHrefElement instanceof HTMLBaseElement)) {
    throw new Error("Missing document base element");
  }

  return { baseHrefElement, tocToggleButton, tocSidebar, resizeHandle };
}

export class AppBootstrap {
  private readonly viewerApi: ViewerApi;
  private readonly htmlRenderer: HtmlRenderer;
  private readonly baseHrefElement: HTMLBaseElement;
  private readonly tocToggleButton: HTMLButtonElement;
  private readonly tocSidebar: HTMLElement;
  private readonly sidebarResize: SidebarResize;
  private handleToggleClick: (() => void) | null = null;

  constructor(
    viewerApi: ViewerApi,
    htmlRenderer: HtmlRenderer,
    baseHrefElement: HTMLBaseElement,
    tocToggleButton: HTMLButtonElement,
    tocSidebar: HTMLElement,
    sidebarResize: SidebarResize
  ) {
    this.viewerApi = viewerApi;
    this.htmlRenderer = htmlRenderer;
    this.baseHrefElement = baseHrefElement;
    this.tocToggleButton = tocToggleButton;
    this.tocSidebar = tocSidebar;
    this.sidebarResize = sidebarResize;
  }

  async start(): Promise<void> {
    await this.initSidebar();
    const initialDocument = await this.viewerApi.getHtml();
    await this.renderDocument(initialDocument);
    this.viewerApi.onHtmlUpdated((nextDocument) => {
      void this.renderDocument(nextDocument);
    });
  }

  destroy(): void {
    if (this.handleToggleClick) {
      this.tocToggleButton.removeEventListener("click", this.handleToggleClick);
      this.handleToggleClick = null;
    }
    this.sidebarResize.disable();
  }

  private async renderDocument(document: RenderedDocument): Promise<void> {
    const originalBaseHref = this.baseHrefElement.href;
    this.baseHrefElement.href = document.baseHref;
    await this.htmlRenderer.render(document.html);

    const images = Array.from(this.htmlRenderer.getRoot().querySelectorAll<HTMLImageElement>("img"));
    if (images.length > 0) {
      await Promise.all(
        images.map((img: HTMLImageElement) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
          });
        })
      );
    }

    this.baseHrefElement.href = originalBaseHref;

    if (document.toc) {
      this.renderToc(document.toc);
    } else {
      this.clearToc();
    }
  }

  private renderToc(items: TableOfContentsItem[]): void {
    const resizeHandle = this.tocSidebar.querySelector('.resize-handle');
    
    const nav = document.createElement("nav");
    nav.className = "toc-nav";
    const ul = document.createElement("ul");
    ul.className = "toc-list";

    for (const item of items) {
      const li = document.createElement("li");
      li.className = `toc-item toc-level-${item.level}`;
      const a = document.createElement("a");
      a.href = `#${item.id}`;
      a.textContent = item.text;
      li.appendChild(a);
      ul.appendChild(li);
    }

    nav.appendChild(ul);
    this.tocSidebar.innerHTML = "";
    this.tocSidebar.appendChild(nav);
    if (resizeHandle) {
      this.tocSidebar.appendChild(resizeHandle);
    }

    this.tocSidebar.querySelectorAll(".toc-list a").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const href = (link as HTMLAnchorElement).getAttribute("href");
        if (!href) return;
        const targetId = href.substring(1);
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  private clearToc(): void {
    const resizeHandle = this.tocSidebar.querySelector('.resize-handle');
    this.tocSidebar.innerHTML = '<p class="sidebar-empty">No table of contents available.</p>';
    if (resizeHandle) {
      this.tocSidebar.appendChild(resizeHandle);
    }
  }

  private applySidebarVisibility(visible: boolean): void {
    this.tocSidebar.hidden = !visible;
    this.tocToggleButton.setAttribute("aria-pressed", visible ? "true" : "false");
  }

  private async initSidebar(): Promise<void> {
    this.sidebarResize.enable();

    const initialVisibility = await this.viewerApi.sidebar.getInitialVisibility();
    this.applySidebarVisibility(initialVisibility);

    this.handleToggleClick = () => {
      void this.viewerApi.sidebar.requestToggleSidebar();
    };
    this.tocToggleButton.addEventListener("click", this.handleToggleClick);

    this.viewerApi.sidebar.onVisibilityChanged((visible) => {
      this.applySidebarVisibility(visible);
    });
  }
}

export function createApp(viewerApi: ViewerApi, mermaid: MermaidApi): AppBootstrap {
  const { baseHrefElement, tocToggleButton, tocSidebar, resizeHandle } = queryDomElements();

  const mermaidRenderer = new MermaidRenderer(mermaid);
  mermaidRenderer.initialize();

  const htmlRenderer = new HtmlRenderer("app", [mermaidRenderer]);

  const sidebarResize = new SidebarResize(tocSidebar, resizeHandle, (collapsed: boolean) => {
    if (collapsed) {
      void viewerApi.sidebar.requestToggleSidebar();
    }
  });

  return new AppBootstrap(viewerApi, htmlRenderer, baseHrefElement, tocToggleButton, tocSidebar, sidebarResize);
}

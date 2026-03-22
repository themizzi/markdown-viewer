export interface WatchHandle {
  close(): Promise<void>;
}

export interface FileReader {
  read(filePath: string): Promise<string>;
}

export interface FileWatcher {
  watch(filePath: string, onChange: () => void): Promise<WatchHandle>;
}

export interface TableOfContentsItem {
  id: string;
  text: string;
  level: number; // 1-6 for h1-h6
}

export interface MarkdownRenderer {
  render(markdown: string): { html: string; toc?: TableOfContentsItem[] };
}

export interface RenderedDocument {
  html: string;
  baseHref: string;
  toc?: TableOfContentsItem[];
}

export interface MermaidApi {
  initialize(config: Record<string, unknown>): void;
  run(options?: Record<string, unknown>): Promise<void> | void;
}

export interface CommandShortcuts {
  toggleTocShortcut: string;
  toggleTocDescription: string;
}

export interface ViewerApi {
  getHtml(): Promise<RenderedDocument>;
  onHtmlUpdated(handler: (document: RenderedDocument) => void): () => void;
  sidebar: SidebarApi;
  fullscreen?: FullscreenApi;
  commands?: CommandShortcuts;
  toggleToc?: () => Promise<void>;
}

export interface DiagramRenderer {
  hydrate(container: HTMLElement): void;
  initialize(): void;
}

export interface SidebarApi {
  getInitialVisibility(): Promise<boolean>;
  requestToggleSidebar(): Promise<void>;
  onVisibilityChanged(callback: (visible: boolean) => void): () => void;
}

export interface FullscreenApi {
  getInitialState(): Promise<boolean>;
  onStateChanged(callback: (isFullscreen: boolean) => void): () => void;
}

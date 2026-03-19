export interface WatchHandle {
  close(): Promise<void>;
}

export interface FileReader {
  read(filePath: string): Promise<string>;
}

export interface FileWatcher {
  watch(filePath: string, onChange: () => void): Promise<WatchHandle>;
}

export interface MarkdownRenderer {
  render(markdown: string): string;
}

export interface RenderedDocument {
  html: string;
  baseHref: string;
}

export interface MermaidApi {
  initialize(config: Record<string, unknown>): void;
  run(options?: Record<string, unknown>): Promise<void> | void;
}

export interface ViewerApi {
  getHtml(): Promise<RenderedDocument>;
  onHtmlUpdated(handler: (document: RenderedDocument) => void): () => void;
}

export interface DiagramRenderer {
  hydrate(container: HTMLElement): void;
  initialize(): void;
}

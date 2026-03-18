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
import type {
  FileReader,
  FileWatcher,
  MarkdownRenderer,
  WatchHandle
} from "./contracts";

export class ViewerController {
  private latestHtml = "<p>Loading...</p>";
  private watchHandle: WatchHandle | null = null;
  private filePath = "";

  constructor(
    private readonly fileReader: FileReader,
    private readonly fileWatcher: FileWatcher,
    private readonly markdownRenderer: MarkdownRenderer,
    private readonly publishHtml: (html: string) => void
  ) {}

  getHtml(): string {
    return this.latestHtml;
  }

  async start(filePath: string): Promise<void> {
    this.filePath = filePath;
    await this.refresh();
    this.watchHandle = await this.fileWatcher.watch(this.filePath, () => {
      void this.refresh();
    });
  }

  async stop(): Promise<void> {
    if (this.watchHandle) {
      await this.watchHandle.close();
      this.watchHandle = null;
    }
  }

  private async refresh(): Promise<void> {
    const markdown = await this.fileReader.read(this.filePath);
    this.latestHtml = this.markdownRenderer.render(markdown);
    this.publishHtml(this.latestHtml);
  }
}
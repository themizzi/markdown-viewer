import type {
  FileReader,
  FileWatcher,
  MarkdownRenderer,
  RenderedDocument,
  WatchHandle
} from "./contracts";
import path from "node:path";
import { pathToFileURL } from "node:url";

export class ViewerController {
  private latestDocument: RenderedDocument = {
    html: "<p>Loading...</p>",
    baseHref: pathToFileURL(`${process.cwd()}${path.sep}`).href,
  };
  private watchHandle: WatchHandle | null = null;
  private filePath = "";

  constructor(
    private readonly fileReader: FileReader,
    private readonly fileWatcher: FileWatcher,
    private readonly markdownRenderer: MarkdownRenderer,
    private readonly publishDocument: (document: RenderedDocument) => void
  ) {}

  getHtml(): RenderedDocument {
    return this.latestDocument;
  }

  getFocusedFilePath(): string {
    return this.filePath;
  }

  async start(filePath: string): Promise<void> {
    this.filePath = filePath;
    await this.refresh();
    this.watchHandle = await this.fileWatcher.watch(this.filePath, () => {
      void this.refresh();
    });
  }

  async openFile(filePath: string): Promise<void> {
    await this.stop();
    await this.start(filePath);
  }

  async stop(): Promise<void> {
    if (this.watchHandle) {
      await this.watchHandle.close();
      this.watchHandle = null;
    }
  }

  private async refresh(): Promise<void> {
    const markdown = await this.fileReader.read(this.filePath);
    const { html, toc } = this.markdownRenderer.render(markdown);
    this.latestDocument = {
      html,
      toc,
      baseHref: pathToFileURL(`${path.dirname(this.filePath)}${path.sep}`).href,
    };
    this.publishDocument(this.latestDocument);
  }
}

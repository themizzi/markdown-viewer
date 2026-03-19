import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Volume } from "memfs";
import { promises as fs } from "node:fs";
import { pathToFileURL } from "node:url";
import type { FileWatcher, WatchHandle, MarkdownRenderer } from "./contracts";
import { ViewerController } from "./viewerController";
import { FileReaderService } from "./fileReader";

describe("ViewerController", () => {
  let volume: Volume;
  let fileReader: FileReaderService;
  let fakeMarkdownRenderer: { render: (markdown: string) => string };
  let capturedRenders: string[];
  let fakeWatchHandle: WatchHandle;
  let fakeFileWatcher: FileWatcher;
  let publishedDocuments: Array<{ html: string; baseHref: string }>;
  let controller: ViewerController;

  beforeEach(() => {
    publishedDocuments = [];
    capturedRenders = [];
    volume = new Volume();

    fakeMarkdownRenderer = {
      render(markdown: string): string {
        capturedRenders.push(markdown);
        return `<rendered>${markdown}</rendered>`;
      }
    };

    fakeWatchHandle = {
      close: vi.fn().mockResolvedValue(undefined),
    };

    fakeFileWatcher = {
      watch: vi.fn().mockResolvedValue(fakeWatchHandle),
    };

    fileReader = new FileReaderService(volume.promises as unknown as typeof fs);
    controller = new ViewerController(
      fileReader,
      fakeFileWatcher,
      fakeMarkdownRenderer as unknown as MarkdownRenderer,
      (document) => publishedDocuments.push(document)
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns initial loading HTML", () => {
    // GIVEN

    // WHEN
    const document = controller.getHtml();

    // THEN
    expect(document).toEqual({
      html: "<p>Loading...</p>",
      baseHref: pathToFileURL(`${process.cwd()}/`).href,
    });
  });

  it("reads file and renders markdown when starting", async () => {
    // GIVEN
    volume.mkdirSync("/path/to", { recursive: true });
    volume.writeFileSync("/path/to/file.md", "# Hello World");

    // WHEN
    await controller.start("/path/to/file.md");

    // THEN
    expect(capturedRenders).toEqual(["# Hello World"]);
  });

  it("starts watching the file", async () => {
    // GIVEN
    volume.mkdirSync("/path/to", { recursive: true });
    volume.writeFileSync("/path/to/file.md", "# Hello World");

    // WHEN
    await controller.start("/path/to/file.md");

    // THEN
    expect(fakeFileWatcher.watch).toHaveBeenCalledWith(
      "/path/to/file.md",
      expect.any(Function)
    );
  });

  it("stops watching and closes handle", async () => {
    // GIVEN
    volume.mkdirSync("/path/to", { recursive: true });
    volume.writeFileSync("/path/to/file.md", "# Hello World");
    await controller.start("/path/to/file.md");

    // WHEN
    await controller.stop();

    // THEN
    expect(fakeWatchHandle.close).toHaveBeenCalled();
  });

  it("does nothing when stopping without a watch handle", async () => {
    // GIVEN

    // WHEN
    await controller.stop();

    // THEN
    expect(fakeWatchHandle.close).not.toHaveBeenCalled();
  });

  it("re-renders when file changes", async () => {
    // GIVEN
    volume.mkdirSync("/path/to", { recursive: true });
    volume.writeFileSync("/path/to/file.md", "# Hello World");
    await controller.start("/path/to/file.md");
    volume.writeFileSync("/path/to/file.md", "# Updated");

    // WHEN
    const onChangeCallback = (fakeFileWatcher.watch as ReturnType<typeof vi.fn>).mock.calls[0][1];
    onChangeCallback();
    await new Promise(resolve => setImmediate(resolve));

    // THEN
    expect(capturedRenders).toEqual(["# Hello World", "# Updated"]);
  });

  it("returns latest rendered HTML", async () => {
    // GIVEN
    volume.mkdirSync("/path/to", { recursive: true });
    volume.writeFileSync("/path/to/file.md", "# Hello World");
    await controller.start("/path/to/file.md");

    // WHEN
    const document = controller.getHtml();

    // THEN
    expect(document).toEqual({
      html: "<rendered># Hello World</rendered>",
      baseHref: "file:///path/to/",
    });
  });

  it("publishes the opened file directory as the base href", async () => {
    // GIVEN
    volume.mkdirSync("/path/to", { recursive: true });
    volume.writeFileSync("/path/to/file.md", "![icon](assets/icon.png)");

    // WHEN
    await controller.start("/path/to/file.md");

    // THEN
    expect(publishedDocuments).toEqual([
      {
        html: "<rendered>![icon](assets/icon.png)</rendered>",
        baseHref: "file:///path/to/",
      },
    ]);
  });
});

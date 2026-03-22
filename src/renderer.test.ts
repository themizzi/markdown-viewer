import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import type { ViewerApi, RenderedDocument, SidebarApi, FullscreenApi } from "./contracts";
import { AppBootstrap } from "./rendererBootstrap";

/**
 * Tests for AppBootstrap helper class that coordinates rendering flow.
 */
describe("AppBootstrap", () => {
  let mockViewerApi: ViewerApi;
  let mockHtmlRenderer: { render: (html: string) => Promise<void> };
  let renderSpy: ReturnType<typeof vi.fn>;
  let mockDocumentBase: HTMLBaseElement;
  let mockTocToggleButton: HTMLButtonElement;
  let mockTocSidebar: HTMLElement;

  beforeEach(() => {
    renderSpy = vi.fn().mockResolvedValue(undefined);

    mockHtmlRenderer = {
      render: renderSpy,
      getRoot: () => {
        const el = document.getElementById("app");
        if (!el) {
          const created = document.createElement("div");
          created.id = "app";
          return created;
        }
        return el;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    const mockSidebarApi: SidebarApi = {
      getInitialVisibility: vi.fn().mockResolvedValue(false),
      requestToggleSidebar: vi.fn().mockResolvedValue(undefined),
      onVisibilityChanged: vi.fn().mockReturnValue(() => {})
    };

    const mockFullscreenApi: FullscreenApi = {
      getInitialState: vi.fn().mockResolvedValue(false),
      onStateChanged: vi.fn().mockReturnValue(() => {})
    };

    mockViewerApi = {
      getHtml: vi.fn().mockResolvedValue({
        html: "<h1>Initial HTML</h1>",
        baseHref: "./"
      } as RenderedDocument),
      onHtmlUpdated: vi.fn().mockReturnValue(() => {}),
      sidebar: mockSidebarApi,
      fullscreen: mockFullscreenApi
    };

    // Create mock DOM elements
    mockDocumentBase = {
      href: "./"
    } as HTMLBaseElement;

    mockTocToggleButton = {
      setAttribute: vi.fn(),
      addEventListener: vi.fn()
    } as unknown as HTMLButtonElement;

    mockTocSidebar = {
      hidden: false
    } as HTMLElement;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("fetches and renders initial document on start", async () => {
    const bootstrap = new AppBootstrap(
      mockViewerApi,
      mockHtmlRenderer as never,
      mockDocumentBase,
      mockTocToggleButton,
      mockTocSidebar
    );

    await bootstrap.start();

    expect(mockViewerApi.getHtml).toHaveBeenCalled();
    expect(renderSpy).toHaveBeenCalledWith("<h1>Initial HTML</h1>");
  });

  it("subscribes to HTML updates on start", async () => {
    const bootstrap = new AppBootstrap(
      mockViewerApi,
      mockHtmlRenderer as never,
      mockDocumentBase,
      mockTocToggleButton,
      mockTocSidebar
    );

    await bootstrap.start();

    expect(mockViewerApi.onHtmlUpdated).toHaveBeenCalled();
  });

  it("renders document when HTML is updated", async () => {
    let updateHandler: ((doc: RenderedDocument) => void) | null = null;
    vi.mocked(mockViewerApi.onHtmlUpdated).mockImplementation((handler) => {
      updateHandler = handler;
      return () => {};
    });

    const bootstrap = new AppBootstrap(
      mockViewerApi,
      mockHtmlRenderer as never,
      mockDocumentBase,
      mockTocToggleButton,
      mockTocSidebar
    );
    await bootstrap.start();

    // Trigger update callback
    updateHandler!({
      html: "<h1>Updated HTML</h1>",
      baseHref: "./"
    } as RenderedDocument);

    // Verify render was called with updated HTML
    const calls = vi.mocked(renderSpy).mock.calls;
    expect(calls.some((call) => call[0] === "<h1>Updated HTML</h1>")).toBe(true);
  });

  it("handles multiple sequential HTML updates", async () => {
    let updateHandler: ((doc: RenderedDocument) => void) | null = null;
    vi.mocked(mockViewerApi.onHtmlUpdated).mockImplementation((handler) => {
      updateHandler = handler;
      return () => {};
    });

    const bootstrap = new AppBootstrap(
      mockViewerApi,
      mockHtmlRenderer as never,
      mockDocumentBase,
      mockTocToggleButton,
      mockTocSidebar
    );
    await bootstrap.start();

    // Multiple updates
    updateHandler!({ html: "<h1>Update 1</h1>", baseHref: "./" } as RenderedDocument);
    updateHandler!({ html: "<h1>Update 2</h1>", baseHref: "./" } as RenderedDocument);
    updateHandler!({ html: "<h1>Update 3</h1>", baseHref: "./" } as RenderedDocument);

    const calls = vi.mocked(renderSpy).mock.calls;
    expect(calls.length).toBeGreaterThanOrEqual(4); // Initial + 3 updates
  });
});

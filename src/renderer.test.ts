import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import type { ViewerApi, RenderedDocument, SidebarApi, FullscreenApi } from "./contracts";
import { AppBootstrap } from "./rendererBootstrap";
import { SidebarResize } from "./sidebarResize";

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
    mockDocumentBase = document.createElement("base");
    mockDocumentBase.href = "./";

    mockTocToggleButton = document.createElement("button");

    mockTocSidebar = document.createElement("aside");
    const resizeHandle = document.createElement("div");
    resizeHandle.className = "resize-handle";
    mockTocSidebar.appendChild(resizeHandle);

  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches and renders initial document on start", async () => {
    const mockSidebarResize = {
      enable: vi.fn(),
      disable: vi.fn(),
    } as unknown as SidebarResize;

    const bootstrap = new AppBootstrap(
      mockViewerApi,
      mockHtmlRenderer as never,
      mockDocumentBase,
      mockTocToggleButton,
      mockTocSidebar,
      mockSidebarResize
    );

    await bootstrap.start();

    expect(mockViewerApi.getHtml).toHaveBeenCalled();
    expect(renderSpy).toHaveBeenCalledWith("<h1>Initial HTML</h1>");
  });

  it("subscribes to HTML updates on start", async () => {
    const mockSidebarResize = {
      enable: vi.fn(),
      disable: vi.fn(),
    } as unknown as SidebarResize;

    const bootstrap = new AppBootstrap(
      mockViewerApi,
      mockHtmlRenderer as never,
      mockDocumentBase,
      mockTocToggleButton,
      mockTocSidebar,
      mockSidebarResize
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

    const mockSidebarResize = {
      enable: vi.fn(),
      disable: vi.fn(),
    } as unknown as SidebarResize;

    const bootstrap = new AppBootstrap(
      mockViewerApi,
      mockHtmlRenderer as never,
      mockDocumentBase,
      mockTocToggleButton,
      mockTocSidebar,
      mockSidebarResize
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

    const mockSidebarResize = {
      enable: vi.fn(),
      disable: vi.fn(),
    } as unknown as SidebarResize;

    const bootstrap = new AppBootstrap(
      mockViewerApi,
      mockHtmlRenderer as never,
      mockDocumentBase,
      mockTocToggleButton,
      mockTocSidebar,
      mockSidebarResize
    );
    await bootstrap.start();

    // Multiple updates
    updateHandler!({ html: "<h1>Update 1</h1>", baseHref: "./" } as RenderedDocument);
    updateHandler!({ html: "<h1>Update 2</h1>", baseHref: "./" } as RenderedDocument);
    updateHandler!({ html: "<h1>Update 3</h1>", baseHref: "./" } as RenderedDocument);

    const calls = vi.mocked(renderSpy).mock.calls;
    expect(calls.length).toBeGreaterThanOrEqual(4); // Initial + 3 updates
  });

  it("applies initial fullscreen state on macOS", async () => {
    document.documentElement.classList.add("platform-macos");
    const onStateChangedUnsubscribe = vi.fn();
    const onStateChanged = vi.fn().mockReturnValue(onStateChangedUnsubscribe);
    const getInitialState = vi.fn().mockResolvedValue(true);

    mockViewerApi.fullscreen = {
      getInitialState,
      onStateChanged
    };

    const mockSidebarResize = {
      enable: vi.fn(),
      disable: vi.fn(),
    } as unknown as SidebarResize;

    const bootstrap = new AppBootstrap(
      mockViewerApi,
      mockHtmlRenderer as never,
      mockDocumentBase,
      mockTocToggleButton,
      mockTocSidebar,
      mockSidebarResize
    );

    await bootstrap.start();

    expect(getInitialState).toHaveBeenCalled();
    expect(document.documentElement.classList.contains("is-fullscreen")).toBe(true);
    bootstrap.destroy();
  });

  it("updates fullscreen class on state changes and unsubscribes on destroy", async () => {
    document.documentElement.classList.add("platform-macos");
    let fullscreenHandler: ((isFullscreen: boolean) => void) | null = null;
    const unsubscribe = vi.fn();

    mockViewerApi.fullscreen = {
      getInitialState: vi.fn().mockResolvedValue(false),
      onStateChanged: vi.fn().mockImplementation((handler) => {
        fullscreenHandler = handler;
        return unsubscribe;
      })
    };

    const mockSidebarResize = {
      enable: vi.fn(),
      disable: vi.fn(),
    } as unknown as SidebarResize;

    const bootstrap = new AppBootstrap(
      mockViewerApi,
      mockHtmlRenderer as never,
      mockDocumentBase,
      mockTocToggleButton,
      mockTocSidebar,
      mockSidebarResize
    );

    await bootstrap.start();
    expect(document.documentElement.classList.contains("is-fullscreen")).toBe(false);

    expect(fullscreenHandler).not.toBeNull();
    fullscreenHandler!(true);
    expect(document.documentElement.classList.contains("is-fullscreen")).toBe(true);

    fullscreenHandler!(false);
    expect(document.documentElement.classList.contains("is-fullscreen")).toBe(false);

    bootstrap.destroy();
    expect(unsubscribe).toHaveBeenCalled();
  });
});

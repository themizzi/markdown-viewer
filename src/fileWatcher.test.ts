import { describe, it, expect, vi } from "vitest";
import { FileWatcherService } from "./fileWatcher";

describe("FileWatcherService", () => {
  it("returns a handle that can close the watcher", async () => {
    // GIVEN
    let closed = false;
    const fakeWatcher = {
      on: vi.fn(),
      close: vi.fn().mockImplementation(() => {
        closed = true;
        return Promise.resolve();
      })
    };
    const fakeChokidar = {
      watch: vi.fn().mockReturnValue(fakeWatcher)
    };
    const service = new FileWatcherService(fakeChokidar);

    // WHEN
    const handle = await service.watch("/path/to/file.md", vi.fn());

    // THEN
    expect(closed).toBe(false);
    await handle.close();
    expect(closed).toBe(true);
  });

  it("returns a handle for watching files", async () => {
    // GIVEN
    const fakeWatcher = {
      on: vi.fn(),
      close: vi.fn().mockResolvedValue(undefined)
    };
    const fakeChokidar = {
      watch: vi.fn().mockReturnValue(fakeWatcher)
    };
    const service = new FileWatcherService(fakeChokidar);

    // WHEN
    const handle = await service.watch("/path/to/file.md", vi.fn());

    // THEN
    expect(handle).toBeDefined();
    expect(typeof handle.close).toBe("function");
  });
});
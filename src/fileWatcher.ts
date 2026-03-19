import type { FileWatcher, WatchHandle } from "./contracts";

class ChokidarWatchHandle implements WatchHandle {
  constructor(private readonly closeFn: () => Promise<void>) {}

  async close(): Promise<void> {
    await this.closeFn();
  }
}

type ChokidarInstance = {
  watch(path: string, options?: object): {
    on(event: string, callback: () => void): void;
    close(): Promise<void>;
  };
};

export class FileWatcherService implements FileWatcher {
  constructor(private readonly chokidar: ChokidarInstance) {}

  async watch(filePath: string, onChange: () => void): Promise<WatchHandle> {
    const watcher = this.chokidar.watch(filePath, {
      ignoreInitial: true,
      usePolling: process.platform === "linux",
      interval: 100,
      awaitWriteFinish: {
        stabilityThreshold: 150,
        pollInterval: 50
      }
    });

    watcher.on("add", onChange);
    watcher.on("change", onChange);
    watcher.on("unlink", onChange);

    return new ChokidarWatchHandle(async () => {
      await watcher.close();
    });
  }
}

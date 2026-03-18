import { promises as fs } from "node:fs";
import chokidar from "chokidar";
import type { FileReader, FileWatcher, WatchHandle } from "./contracts";

class ChokidarWatchHandle implements WatchHandle {
  constructor(private readonly closeFn: () => Promise<void>) {}

  async close(): Promise<void> {
    await this.closeFn();
  }
}

export class FileService implements FileReader, FileWatcher {
  async read(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, "utf8");
    } catch {
      return `# File not found\n\n\`${filePath}\``;
    }
  }

  async watch(filePath: string, onChange: () => void): Promise<WatchHandle> {
    const watcher = chokidar.watch(filePath, {
      ignoreInitial: true,
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
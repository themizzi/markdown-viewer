import { promises as fs } from "node:fs";
import type { FileReader } from "../shared/contracts";

export class FileReaderService implements FileReader {
  constructor(private readonly fileSystem: typeof fs) {}

  async read(filePath: string): Promise<string> {
    try {
      const result = await this.fileSystem.readFile(filePath, "utf8");
      return result.toString();
    } catch {
      return `# File not found\n\n\`${filePath}\``;
    }
  }
}
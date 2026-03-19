import { describe, it, expect } from "vitest";
import { Volume } from "memfs";
import { promises as fs } from "node:fs";
import { FileReaderService } from "./fileReader";

describe("FileReaderService", () => {
  it("returns file content on successful read", async () => {
    // GIVEN
    const volume = new Volume();
    volume.mkdirSync("/path/to", { recursive: true });
    volume.writeFileSync("/path/to/file.md", "# Hello World");
    const service = new FileReaderService(volume.promises as unknown as typeof fs);

    // WHEN
    const result = await service.read("/path/to/file.md");

    // THEN
    expect(result).toBe("# Hello World");
  });

  it("returns 'File not found' message on error", async () => {
    // GIVEN
    const volume = new Volume();
    const service = new FileReaderService(volume.promises as unknown as typeof fs);

    // WHEN
    const result = await service.read("/nonexistent/file.md");

    // THEN
    expect(result).toBe("# File not found\n\n`/nonexistent/file.md`");
  });
});
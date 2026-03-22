import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("styles.css", () => {
  it("contains fullscreen toolbar rules for macOS", () => {
    const cssContent = readFileSync(join(__dirname, "styles.css"), "utf-8");
    expect(cssContent).toContain(".platform-macos.is-fullscreen .toolbar");
    expect(cssContent).toContain("padding-left: 0");
  });
});

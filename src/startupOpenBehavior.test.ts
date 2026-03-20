import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { dialog } from "electron";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

// Mock dialog module
vi.mock("electron", async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown> & {
    app: unknown;
  };
  return {
    ...actual,
    dialog: {
      showOpenDialog: vi.fn()
    },
    app: actual.app
  };
});

describe("startupOpenBehavior", () => {
  let tmpDir: string;

  beforeEach(() => {
    // Reset the dialog mock completely
    vi.mocked(dialog.showOpenDialog).mockReset();
    vi.mocked(dialog.showOpenDialog).mockRejectedValue(new Error("Mock not configured"));
    
    // Create a temporary directory for test files
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "startup-test-"));
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  describe("resolveStartupFile - startup filename arg resolution", () => {
    it("when a startup filename arg is present, it returns that resolved path and does not request a startup dialog", async () => {
      // GIVEN
      const mockResult = { canceled: true, filePaths: [] };
      vi.mocked(dialog.showOpenDialog).mockResolvedValueOnce(mockResult);
      
      // Create a test file
      const testFile = path.join(tmpDir, "file.md");
      fs.writeFileSync(testFile, "# Test File\n");

      // WHEN
      const { resolveStartupFile } = await import("./startupOpenBehavior");
      const result = await resolveStartupFile([
        "some-other-flag",
        testFile
      ]);

      // THEN
      expect(result.kind).toBe("file-path-resolved");
      expect(result.filePath).toBe(testFile);
      expect(dialog.showOpenDialog).not.toHaveBeenCalled();
    });

    it("when only flag args are present, it requests the startup dialog and does not fall back to README.md", async () => {
      // GIVEN
      const mockResult = { canceled: true, filePaths: [] };
      vi.mocked(dialog.showOpenDialog).mockResolvedValueOnce(mockResult);

      // WHEN
      const { resolveStartupFile } = await import("./startupOpenBehavior");
      const result = await resolveStartupFile(["--some-flag", "--another-flag"]);

      // THEN
      expect(dialog.showOpenDialog).toHaveBeenCalled();
      expect(result.kind).toBe("no-startup-file-selected");
      expect(result.filePath).toBeUndefined();
    });

    it("when --test-file= is present, it still resolves the harness file path exactly as today", async () => {
      // GIVEN
      const mockResult = { canceled: true, filePaths: [] };
      vi.mocked(dialog.showOpenDialog).mockResolvedValueOnce(mockResult);

      // WHEN
      const { resolveStartupFile } = await import("./startupOpenBehavior");
      const result = await resolveStartupFile([
        "--test-file=./e2e/fixtures/test.md"
      ]);

      // THEN
      expect(result.kind).toBe("file-path-resolved");
      expect(result.filePath).toMatch(/e2e\/fixtures\/test\.md$/);
      expect(dialog.showOpenDialog).not.toHaveBeenCalled();
    });

    it("rejects candidates that fail file validation (not readable or not text files)", async () => {
      // GIVEN
      const mockResult = { canceled: true, filePaths: [] };
      vi.mocked(dialog.showOpenDialog).mockResolvedValueOnce(mockResult);

      // WHEN
      const { resolveStartupFile } = await import("./startupOpenBehavior");
      const result = await resolveStartupFile([
        "/nonexistent-file-that-does-not-exist.md"
      ]);

      // THEN
      // Should fall through to the dialog since the file is invalid
      expect(result.kind).toBe("no-startup-file-selected");
      expect(dialog.showOpenDialog).toHaveBeenCalled();
    });

    it("rejects binary files (those containing null bytes)", async () => {
      // GIVEN
      const mockResult = { canceled: true, filePaths: [] };
      vi.mocked(dialog.showOpenDialog).mockResolvedValueOnce(mockResult);
      
      // Create a binary file with null bytes
      const binaryFile = path.join(tmpDir, "binary-file.bin");
      const binaryData = Buffer.alloc(512);
      binaryData[10] = 0; // Insert null byte
      fs.writeFileSync(binaryFile, binaryData);

      // WHEN
      const { resolveStartupFile } = await import("./startupOpenBehavior");
      const result = await resolveStartupFile([
        binaryFile
      ]);

      // THEN
      expect(result.kind).toBe("no-startup-file-selected");
      expect(dialog.showOpenDialog).toHaveBeenCalled();
    });
  });

  describe("resolveStartupFile - dialog flow", () => {
    it("when the startup dialog returns canceled: true, the helper returns no-startup-file-selected without substituting any fallback path", async () => {
      // GIVEN
      const mockResult = { canceled: true, filePaths: [] };
      vi.mocked(dialog.showOpenDialog).mockResolvedValueOnce(mockResult);

      // WHEN
      const { resolveStartupFile } = await import("./startupOpenBehavior");
      const result = await resolveStartupFile(["--some-flag"]);

      // THEN
      expect(result.kind).toBe("no-startup-file-selected");
      expect(result.filePath).toBeUndefined();
    });

    it("when the startup dialog returns no file paths, the helper returns no-startup-file-selected without substituting any fallback path", async () => {
      // GIVEN
      const mockResult = { canceled: false, filePaths: [] };
      vi.mocked(dialog.showOpenDialog).mockResolvedValueOnce(mockResult);

      // WHEN
      const { resolveStartupFile } = await import("./startupOpenBehavior");
      const result = await resolveStartupFile(["--some-flag"]);

      // THEN
      expect(result.kind).toBe("no-startup-file-selected");
      expect(result.filePath).toBeUndefined();
    });

    it("when the startup dialog returns a path, that selected path becomes the startup file path", async () => {
      // GIVEN
      const selectedPath = "/home/user/documents/my-file.md";
      const mockResult = { canceled: false, filePaths: [selectedPath] };
      vi.mocked(dialog.showOpenDialog).mockResolvedValue(mockResult);

      // WHEN
      const { resolveStartupFile } = await import("./startupOpenBehavior");
      const result = await resolveStartupFile([]);

      // THEN
      expect(result.kind).toBe("file-path-resolved");
      expect(result.filePath).toBe(selectedPath);
    });
  });

  describe("resolveStartupFile - startup decision gating", () => {
    it("when no startup file is selected, the helper explicitly reports do-not-create-window and do-not-start-controller via kind: no-startup-file-selected", async () => {
      // GIVEN
      const mockResult = { canceled: true, filePaths: [] };
      vi.mocked(dialog.showOpenDialog).mockResolvedValueOnce(mockResult);

      // WHEN
      const { resolveStartupFile } = await import("./startupOpenBehavior");
      const result = await resolveStartupFile([]);

      // THEN
      expect(result.kind).toBe("no-startup-file-selected");
      expect(result.filePath).toBeUndefined();
    });

    it("when a resolved file path exists, the kind is file-path-resolved so createWindow and controller.start can proceed", async () => {
      // GIVEN
      const testFile = path.join(tmpDir, "myfile.md");
      fs.writeFileSync(testFile, "# My File\n");

      // WHEN
      const { resolveStartupFile } = await import("./startupOpenBehavior");
      const result = await resolveStartupFile([testFile]);

      // THEN
      expect(result.kind).toBe("file-path-resolved");
      expect(result.filePath).toBeDefined();
    });
  });

  describe("resolveStartupFile - arg precedence", () => {
    it("prefers .md files over other non-flag candidates", async () => {
      // GIVEN
      const mockResult = { canceled: true, filePaths: [] };
      vi.mocked(dialog.showOpenDialog).mockResolvedValueOnce(mockResult);
      
      // Create test files
      const first = path.join(tmpDir, "first.txt");
      const second = path.join(tmpDir, "second.md");
      const third = path.join(tmpDir, "third.log");
      fs.writeFileSync(first, "text");
      fs.writeFileSync(second, "# markdown");
      fs.writeFileSync(third, "log");

      // WHEN
      const { resolveStartupFile } = await import("./startupOpenBehavior");
      const result = await resolveStartupFile([
        first,
        second,
        third
      ]);

      // THEN
      expect(result.kind).toBe("file-path-resolved");
      expect(result.filePath).toBe(second);
    });

    it("uses the last candidate when no .md file is present", async () => {
      // GIVEN
      const mockResult = { canceled: true, filePaths: [] };
      vi.mocked(dialog.showOpenDialog).mockResolvedValueOnce(mockResult);
      
      // Create test files
      const first = path.join(tmpDir, "first.txt");
      const second = path.join(tmpDir, "second.log");
      const third = path.join(tmpDir, "third.json");
      fs.writeFileSync(first, "text");
      fs.writeFileSync(second, "log");
      fs.writeFileSync(third, "{}");

      // WHEN
      const { resolveStartupFile } = await import("./startupOpenBehavior");
      const result = await resolveStartupFile([
        first,
        second,
        third
      ]);

      // THEN
      expect(result.kind).toBe("file-path-resolved");
      expect(result.filePath).toBe(third);
    });
  });

  describe("startupOpenBehavior interface", () => {
    it("exports StartupResolution interface with file-path-resolved variant", async () => {
      // GIVEN
      // WHEN
      const module = await import("./startupOpenBehavior");

      // THEN
      // If the module exports the interface, this import succeeds
      expect(module.resolveStartupFile).toBeDefined();
    });

    it("exports resolveStartupFile function", async () => {
      // GIVEN
      // WHEN
      const { resolveStartupFile } = await import("./startupOpenBehavior");

      // THEN
      expect(typeof resolveStartupFile).toBe("function");
    });
  });
});

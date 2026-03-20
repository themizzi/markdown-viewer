import path from "node:path";
import fs from "node:fs/promises";
import { app } from "electron";
import { showOpenFileDialog } from "./openFileDialog";

/**
 * Result of the startup file resolution logic.
 */
export interface StartupResolution {
  kind: "file-path-resolved" | "no-startup-file-selected";
  filePath?: string;
}

/**
 * Checks if a file exists, is readable, and is a text file (not binary).
 * A file is considered text if:
 * - It's readable by the process
 * - It has a text-like extension (.md, .txt, .json, etc.)
 * - The first chunk doesn't contain null bytes (binary indicator)
 */
async function isValidTextFile(filePath: string): Promise<boolean> {
  try {
    // Check if file exists and is readable
    await fs.access(filePath, fs.constants.R_OK);
    
    // Check file extension - must be a text-like extension
    const ext = path.extname(filePath).toLowerCase();
    const textExtensions = [
      ".md", ".txt", ".json", ".yaml", ".yml", ".xml", ".html", 
      ".css", ".js", ".ts", ".jsx", ".tsx", ".py", ".java", ".cpp",
      ".c", ".h", ".sh", ".bash", ".go", ".rs", ".rb", ".php",
      ".sql", ".csv", ".log", ".ini", ".toml", ".gradle", ".properties"
    ];
    
    if (!textExtensions.includes(ext)) {
      return false;
    }
    
    // Read first chunk to check for binary data (null bytes)
    const handle = await fs.open(filePath, "r");
    try {
      const buffer = Buffer.alloc(512);
      const { bytesRead } = await handle.read(buffer, 0, 512, 0);
      const chunk = buffer.slice(0, bytesRead);
      
      // Check for null bytes (binary indicator)
      if (chunk.includes(0)) {
        return false;
      }
    } finally {
      await handle.close();
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolves the startup file behavior:
 * - If a startup filename arg is present, returns that resolved path
 * - If only flag args are present, shows the startup dialog and returns its result
 * - If the dialog is canceled or returns no file, returns no-startup-file-selected
 * - Never falls back to README.md
 */
export async function resolveStartupFile(
  argv: string[]
): Promise<StartupResolution> {
  // Check for startup filename arg (non-flag args)
  const flaggedCandidate = argv
    .find((value) => value.startsWith("--test-file="))
    ?.slice("--test-file=".length);

  if (flaggedCandidate) {
    // --test-file= takes precedence
    const resolved = path.resolve(process.cwd(), flaggedCandidate);
    return {
      kind: "file-path-resolved",
      filePath: resolved
    };
  }

  // Check for non-flag candidates
  // Only consider arguments that look like actual file paths:
  // - Contain a path separator (/ or \)
  // - OR end with a file extension like .md
  // - Exclude arguments that start with schemes like "data:" or look like URLs
  const candidates = argv.filter((value) => {
    // Exclude flags (start with -)
    if (value.startsWith("-")) return false;
    
    // Exclude data URLs and other schemes
    if (value.includes(":")) return false;
    
    // Only accept values that contain path separators or file extensions
    // This filters out wdio's automation arguments like "data:,"
    return value.includes("/") || value.includes("\\") || /\.\w+$/.test(value);
  });
  
  const preferredCandidate = [...candidates]
    .reverse()
    .find((value) => value.endsWith(".md"));
  const candidate = preferredCandidate ?? candidates.at(-1);

  if (candidate) {
    // A non-flag arg is present, validate it's a readable text file
    const resolved = path.resolve(process.cwd(), candidate);
    const isValid = await isValidTextFile(resolved);
    
    if (isValid) {
      return {
        kind: "file-path-resolved",
        filePath: resolved
      };
    }
  }

  // No startup filename arg, show the startup dialog
  // Ensure the app is in focus so the native dialog appears properly
  try {
    app.focus({ steal: true });
  } catch {
    // app.focus might not work in all environments, continue anyway
  }

  let dialogResult;
  try {
    const dialogPromise = showOpenFileDialog();
    // Add a timeout to prevent hanging forever in test environments
    const timeoutPromise = new Promise<{ canceled: boolean; filePaths: string[] }>((_, reject) => {
      setTimeout(() => {
        reject(new Error("[TIMEOUT] Dialog did not respond within 30 seconds, treating as canceled"));
      }, 30000);
    });
    
    dialogResult = await Promise.race([dialogPromise, timeoutPromise]);
  } catch {
    // If dialog times out or throws, treat as canceled
    return {
      kind: "no-startup-file-selected"
    };
  }

  if (dialogResult.canceled || dialogResult.filePaths.length === 0) {
    return {
      kind: "no-startup-file-selected"
    };
  }

  return {
    kind: "file-path-resolved",
    filePath: dialogResult.filePaths[0]
  };
}

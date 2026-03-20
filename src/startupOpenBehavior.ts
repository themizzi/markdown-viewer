import path from "node:path";
import { app } from "electron";
import { showOpenFileDialog } from "./openFileDialog";

const preferredMarkdownExtensions = new Set([
  ".md",
  ".markdown",
  ".mdown",
  ".mkd",
  ".mkdn"
]);

/**
 * Result of the startup file resolution logic.
 */
export interface StartupResolution {
  kind: "file-path-resolved" | "no-startup-file-selected";
  filePath?: string;
}

function isWindowsAbsolutePath(value: string): boolean {
  return /^[a-zA-Z]:[\\/]/.test(value);
}

function isExplicitPathCandidate(value: string): boolean {
  if (value.startsWith("-")) {
    return false;
  }

  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value) && !isWindowsAbsolutePath(value)) {
    return false;
  }

  return value.includes("/") || value.includes("\\") || /\.\w+$/.test(value);
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
  const flaggedCandidate = argv
    .find((value) => value.startsWith("--test-file="))
    ?.slice("--test-file=".length);

  if (flaggedCandidate) {
    return {
      kind: "file-path-resolved",
      filePath: path.resolve(process.cwd(), flaggedCandidate)
    };
  }

  const candidates = argv.filter(isExplicitPathCandidate);
  const preferredCandidate = [...candidates]
    .reverse()
    .find((value) => preferredMarkdownExtensions.has(path.extname(value).toLowerCase()));
  const candidate = preferredCandidate ?? candidates.at(-1);

  if (candidate) {
    return {
      kind: "file-path-resolved",
      filePath: path.resolve(process.cwd(), candidate)
    };
  }

  try {
    app.focus({ steal: true });
  } catch {
    // app.focus might not work in all environments, continue anyway
  }

  let dialogResult;
  try {
    const dialogPromise = showOpenFileDialog();
    const timeoutPromise = new Promise<{ canceled: boolean; filePaths: string[] }>((_, reject) => {
      setTimeout(() => {
        reject(new Error("[TIMEOUT] Dialog did not respond within 30 seconds, treating as canceled"));
      }, 30000);
    });

    dialogResult = await Promise.race([dialogPromise, timeoutPromise]);
  } catch {
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

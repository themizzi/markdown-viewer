import path from "node:path";
import { existsSync } from "node:fs";

const DEFAULT_APP_ARGS = ["--test-file=./e2e/fixtures/test.md"];

export function parseAppArgsFromEnv(): string[] {
  const envVar = process.env.WDIO_APP_ARGS_JSON;

  if (!envVar) {
    return [...DEFAULT_APP_ARGS];
  }

  try {
    const parsed = JSON.parse(envVar);
    if (!Array.isArray(parsed)) {
      throw new Error(
        `startup-harness error: WDIO_APP_ARGS_JSON must parse to an array of strings, got ${typeof parsed}`
      );
    }

    if (!parsed.every((value) => typeof value === "string")) {
      throw new Error("startup-harness error: WDIO_APP_ARGS_JSON array must contain only strings");
    }

    return [...parsed];
  } catch (error) {
    if (error instanceof SyntaxError) {
      const wrapped = new Error(
        `startup-harness error: WDIO_APP_ARGS_JSON is malformed JSON: ${error.message}`
      ) as Error & { cause?: unknown };
      wrapped.cause = error;
      throw wrapped;
    }

    throw error;
  }
}

export function resolveAppBinaryPath(): string {
  if (process.platform === "darwin") {
    return "./release/mac-arm64/markdown-viewer.app/Contents/MacOS/markdown-viewer";
  }

  if (process.arch === "arm64") {
    return "./release/linux-arm64-unpacked/markdown-viewer";
  }

  return "./release/linux-unpacked/markdown-viewer";
}

export function withLinuxSandboxArgs(appArgs: string[]): string[] {
  if (process.platform !== "linux") {
    return [...appArgs];
  }

  if (appArgs.includes("--no-sandbox")) {
    return [...appArgs];
  }

  return ["--no-sandbox", ...appArgs];
}

export function isNoArgsStartupRun(appArgs: string[]): boolean {
  return appArgs.length === 0;
}

export function resolvePlatformTagExpression(appArgs: string[]): string {
  if (process.platform === "darwin") {
    return isNoArgsStartupRun(appArgs)
      ? "not @linux"
      : "not @linux and not @startup-no-args";
  }

  if (process.platform === "linux") {
    return "@linux and not @macos";
  }

  return "not @linux and not @macos";
}

export function assertPackagedBinaryExists(appBinaryPath: string): void {
  const absoluteBinaryPath = path.resolve(process.cwd(), appBinaryPath);
  if (!existsSync(absoluteBinaryPath)) {
    throw new Error(
      `Missing packaged Electron binary at ${appBinaryPath}. Run \`npm run package\` before running e2e tests.`
    );
  }
}

export function createElectronCapabilities(appBinaryPath: string, appArgs: string[]): WebdriverIO.Capabilities {
  return {
    browserName: "electron",
    "wdio:electronServiceOptions": {
      appBinaryPath,
      appArgs,
    },
  };
}

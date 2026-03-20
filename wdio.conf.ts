import path from "node:path";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
const dirname = path.dirname(new URL(import.meta.url).pathname);

/**
 * Parse app arguments from WDIO_APP_ARGS_JSON environment variable.
 * Defaults to ["--test-file=./e2e/fixtures/test.md"] if not provided.
 * Fails fast with clear error if malformed or not an array of strings.
 */
function parseAppArgs(): string[] {
  const envVar = process.env.WDIO_APP_ARGS_JSON;
  
  if (!envVar) {
    return ["--test-file=./e2e/fixtures/test.md"];
  }
  
  try {
    const parsed = JSON.parse(envVar);
    
    if (!Array.isArray(parsed)) {
      throw new Error(
        `startup-harness error: WDIO_APP_ARGS_JSON must parse to an array of strings, ` +
        `got ${typeof parsed}`
      );
    }
    
    if (!parsed.every(arg => typeof arg === 'string')) {
      throw new Error(
        `startup-harness error: WDIO_APP_ARGS_JSON array must contain only strings`
      );
    }
    
    return parsed;
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

const appArgs = parseAppArgs();
const isNoArgsStartupRun = JSON.stringify(appArgs) === '[]';

const appBinaryPath = process.platform === 'darwin'
  ? "./release/mac-arm64/markdown-viewer.app/Contents/MacOS/markdown-viewer"
  : process.arch === 'arm64'
    ? "./release/linux-arm64-unpacked/markdown-viewer"
    : "./release/linux-unpacked/markdown-viewer";

if (process.platform === "linux") {
  appArgs.unshift("--no-sandbox");
}

function startXvfb() {
  spawn("Xvfb", [":99", "-screen", "0", "1280x1024x24"], {
    stdio: "ignore",
    detached: true
  }).unref();
}

export const config = {
  runner: "local",
  autoXvfb: false,
  xvfbAutoInstall: false,
  xvfbMaxRetries: 5,
  xvfbRetryDelay: 2000,
  specs: ["./e2e/features/*.feature"],
  exclude: [],
  maxInstances: 1,
  capabilities: [
    {
      maxInstances: 1,
      browserName: "electron",
      "wdio:electronServiceOptions": {
        appBinaryPath,
        appArgs
      }
    }
  ],
  logLevel: "warn",
  bail: 0,
  baseUrl: "",
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  services: ["electron"],
  framework: "cucumber",
  reporters: ["spec"],
  cucumberOpts: {
    require: ["./e2e/steps/*.ts", "./e2e/support/hooks.ts"],
    timeout: 60000,
    strict: true,
    // Platform-specific tag expression to prevent cross-platform tag leakage:
    // - macOS: exclude @linux (runs all non-explicitly-excluded scenarios)
    // - Linux: require @linux AND exclude @macos (only Linux-specific scenarios)
    // - Other: exclude @linux and @macos (only platform-agnostic scenarios)
    tagExpression: 
      process.platform === "darwin"
        ? isNoArgsStartupRun
          ? "not @linux"
          : "not @linux and not @startup-no-args"
        : process.platform === "linux"
          ? "@linux and not @macos"
          : "not @linux and not @macos"
  },
  tsConfigPath: path.join(dirname, "tsconfig.wdio.json"),
  onPrepare: async () => {
    if (!existsSync(path.resolve(dirname, appBinaryPath))) {
      throw new Error(
        `Missing packaged Electron binary at ${appBinaryPath}. Run \`npm run package\` before running e2e tests.`
      );
    }

    console.log("Skipping rebuild - using pre-built app");
  },
  beforeSession: function () {
    if (process.platform === "linux") {
      startXvfb();
      process.env.DISPLAY = ":99";
    }
  }
};

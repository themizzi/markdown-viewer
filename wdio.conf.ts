import path from "node:path";
import { spawn } from "node:child_process";
const dirname = path.dirname(new URL(import.meta.url).pathname);

const appArgs = ["--test-file=./e2e/fixtures/test.md"];

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
        appBinaryPath: process.platform === 'darwin'
          ? "./release/mac-arm64/markdown-viewer.app/Contents/MacOS/markdown-viewer"
          : process.arch === 'arm64'
            ? "./release/linux-arm64-unpacked/markdown-viewer"
            : "./release/linux-unpacked/markdown-viewer",
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
        ? "not @linux"
        : process.platform === "linux"
          ? "@linux and not @macos"
          : "not @linux and not @macos"
  },
  tsConfigPath: path.join(dirname, "tsconfig.wdio.json"),
  onPrepare: async () => {
    const { exec } = await import("node:child_process");
    return new Promise<void>((resolve, reject) => {
      exec("npm run package", (error, stdout, stderr) => {
        if (error) {
          console.error("Build failed:", stderr);
          reject(error);
        } else {
          console.log("Build complete:", stdout);
          resolve();
        }
      });
    });
  },
  beforeSession: function () {
    if (process.platform === "linux") {
      startXvfb();
      process.env.DISPLAY = ":99";
    }
  }
};

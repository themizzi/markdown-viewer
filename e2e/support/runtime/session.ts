import { startWdioSession } from "wdio-electron-service";
import {
  createElectronCapabilities,
  parseAppArgsFromEnv,
  resolveAppBinaryPath,
  withLinuxSandboxArgs,
} from "./appConfig.ts";

export type RuntimeSessionConfig = {
  appBinaryPath: string;
  appArgs: string[];
  capabilities: WebdriverIO.Capabilities;
};

export function buildRuntimeSessionConfig(): RuntimeSessionConfig {
  const rawAppArgs = parseAppArgsFromEnv();
  const appArgs = withLinuxSandboxArgs(rawAppArgs);
  const appBinaryPath = resolveAppBinaryPath();
  const capabilities = createElectronCapabilities(appBinaryPath, appArgs);

  return {
    appBinaryPath,
    appArgs,
    capabilities,
  };
}

export async function createElectronSession(capabilities: WebdriverIO.Capabilities): Promise<WebdriverIO.Browser> {
  return startWdioSession([capabilities], {
    rootDir: process.cwd(),
    cdpBridgeTimeout: 15_000,
    cdpBridgeRetryCount: 15,
    cdpBridgeWaitInterval: 200,
  });
}

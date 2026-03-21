import { startWdioSession } from "wdio-electron-service";
import {
  createElectronCapabilities,
  parseAppArgsFromEnv,
  resolveAppBinaryPath,
  withLinuxSandboxArgs,
} from "./appConfig.ts";

const DEFAULT_CDP_BRIDGE_TIMEOUT_MS = 30_000;
const DEFAULT_CDP_BRIDGE_RETRY_COUNT = 20;
const DEFAULT_CDP_BRIDGE_WAIT_INTERVAL_MS = 250;

function parsePositiveIntegerFromEnv(envValue: string | undefined, fallback: number): number {
  if (!envValue) {
    return fallback;
  }

  const parsed = Number.parseInt(envValue, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

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
  const cdpBridgeTimeout = parsePositiveIntegerFromEnv(
    process.env.WDIO_CDP_BRIDGE_TIMEOUT_MS,
    DEFAULT_CDP_BRIDGE_TIMEOUT_MS
  );
  const cdpBridgeRetryCount = parsePositiveIntegerFromEnv(
    process.env.WDIO_CDP_BRIDGE_RETRY_COUNT,
    DEFAULT_CDP_BRIDGE_RETRY_COUNT
  );
  const cdpBridgeWaitInterval = parsePositiveIntegerFromEnv(
    process.env.WDIO_CDP_BRIDGE_WAIT_INTERVAL_MS,
    DEFAULT_CDP_BRIDGE_WAIT_INTERVAL_MS
  );

  return startWdioSession([capabilities], {
    rootDir: process.cwd(),
    cdpBridgeTimeout,
    cdpBridgeRetryCount,
    cdpBridgeWaitInterval,
  });
}

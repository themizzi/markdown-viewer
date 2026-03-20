const DEFAULT_APP_ARGS = ["--test-file=./e2e/fixtures/test.md"];

function parseAppArgsFromEnv() {
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

    if (!parsed.every((arg) => typeof arg === "string")) {
      throw new Error("startup-harness error: WDIO_APP_ARGS_JSON array must contain only strings");
    }

    return [...parsed];
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`startup-harness error: WDIO_APP_ARGS_JSON is malformed JSON: ${error.message}`);
    }

    throw error;
  }
}

function resolveTagExpression(appArgs) {
  if (process.platform === "darwin") {
    return appArgs.length === 0 ? "not @linux" : "not @linux and not @startup-no-args";
  }

  if (process.platform === "linux") {
    return "@linux and not @macos";
  }

  return "not @linux and not @macos";
}

const appArgs = parseAppArgsFromEnv();

module.exports = {
  default: {
    paths: ["e2e/features/*.feature"],
    import: ["tsx", "e2e/support/world.ts", "e2e/support/hooks.ts", "e2e/steps/*.ts"],
    strict: true,
    parallel: 1,
    retry: 0,
    publishQuiet: true,
    format: ["progress"],
    timeout: 60000,
    tags: resolveTagExpression(appArgs),
    worldParameters: {
      appArgs,
    },
  },
};

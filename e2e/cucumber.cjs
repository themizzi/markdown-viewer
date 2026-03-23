function resolveTagExpression() {
  if (process.platform === "darwin") {
    return "not @linux";
  }

  if (process.platform === "linux") {
    return "@linux and not @macos";
  }

  return "not @linux and not @macos";
}

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
    tags: resolveTagExpression(),
  },
};

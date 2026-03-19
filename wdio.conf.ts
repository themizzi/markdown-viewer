import path from "node:path";
const dirname = path.dirname(new URL(import.meta.url).pathname);

export const config = {
  runner: "local",
  specs: ["./e2e/features/*.feature"],
  exclude: [],
  maxInstances: 1,
  capabilities: [
    {
      maxInstances: 1,
      browserName: "electron",
      "wdio:electronServiceOptions": {
        appEntryPoint: "./dist/main.js",
        appArgs: ["test-file=./e2e/fixtures/test.md"]
      }
    }
  ],
  logLevel: "debug",
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
    strict: true
  },
  tsConfigPath: path.join(dirname, "tsconfig.wdio.json")
};

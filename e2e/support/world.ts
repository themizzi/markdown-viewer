import { World, type IWorldOptions, setWorldConstructor } from "@cucumber/cucumber";

export class E2EWorld extends World {
  private browserInstance: WebdriverIO.Browser | undefined;

  constructor(options: IWorldOptions) {
    super(options);
  }

  setBrowser(browser: WebdriverIO.Browser): void {
    this.browserInstance = browser;
  }

  getBrowser(): WebdriverIO.Browser {
    if (!this.browserInstance) {
      throw new Error("Browser session is not initialized for this scenario.");
    }

    return this.browserInstance;
  }

  getBrowserOrUndefined(): WebdriverIO.Browser | undefined {
    return this.browserInstance;
  }

  clearBrowser(): void {
    this.browserInstance = undefined;
  }
}

setWorldConstructor(E2EWorld);

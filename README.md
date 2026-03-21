![Markdown Viewer icon](assets/icon-readme.png)

# Markdown Viewer

A minimal desktop markdown viewer built with Electron and TypeScript.

## Features

- **GitHub Flavored Markdown (GFM)** - Renders task lists, tables, strikethrough, and more
- **Mermaid Diagrams** - Renders Mermaid diagrams embedded in markdown code fences
- **Live Reload** - Automatically refreshes the rendered view when the markdown file changes

## Installation

```bash
npm install
```

## Usage

Run the app:
```bash
npm start
```

Open a specific markdown file:
```bash
npm start -- ./path/to/file.md
```

If no file is specified, it defaults to `README.md` in the current directory.

## Development

Run with electron-vite (dev server + Electron):
```bash
npm run dev
```

Build production artifacts:
```bash
npm run build
```

Type-check the TypeScript code:
```bash
npm run typecheck
```

Run tests:
```bash
npm test -- --run
```

## E2E Testing

Run end-to-end tests:
```bash
npm run test:e2e
```

Run no-startup-args startup coverage (`@startup-no-args`):
```bash
WDIO_APP_ARGS_JSON='[]' npm run test:e2e -- --tags @startup-no-args
```

### E2E Execution Model

- The suite uses standalone `@cucumber/cucumber` with `cucumber-js --config e2e/cucumber.cjs`.
- A brand-new Electron/WebDriver session is created in `Before` for every scenario via `startWdioSession(...)`, attached to `E2EWorld`, and deleted in `After`.
- Deterministic fixture files are rewritten before each scenario session starts in `e2e/support/runtime/fixtures.ts`.
- App startup args come from `WDIO_APP_ARGS_JSON` (default `['--test-file=./e2e/fixtures/test.md']`) and are parsed in `e2e/support/runtime/appConfig.ts`.
- Platform tag filtering is applied in `e2e/cucumber.cjs` to preserve existing `@linux`, `@macos`, and `@startup-no-args` behavior.
- Packaged-binary preflight and Linux Xvfb setup are handled in `BeforeAll`/`AfterAll` via `e2e/support/hooks.ts` and `e2e/support/runtime/xvfb.ts`.
- CDP bridge startup tuning can be adjusted with optional env vars: `WDIO_CDP_BRIDGE_TIMEOUT_MS`, `WDIO_CDP_BRIDGE_RETRY_COUNT`, and `WDIO_CDP_BRIDGE_WAIT_INTERVAL_MS`.

### macOS File Dialog Testing

The e2e test suite includes testing for the File → Open dialog. On macOS, this requires **accessibility permissions** for AppleScript automation.

**If e2e tests fail with "Open File dialog did not appear" errors:**

Manually grant permissions:
   - Go to: **System Settings → Privacy & Security → Accessibility**
   - Click **+** and select your Terminal or IDE app
   - Close and reopen your Terminal/IDE
   - Run tests again

## License

MIT

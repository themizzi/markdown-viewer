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

Build the TypeScript code:
```bash
npm run build
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

### macOS File Dialog Testing

The e2e test suite includes testing for the File → Open dialog. On macOS, this requires **accessibility permissions** for AppleScript automation.

**If e2e tests fail with "Open File dialog did not appear" errors:**

1. Run the permission setup script:
   ```bash
   ./scripts/setup-e2e-permissions.sh
   ```

2. Or manually grant permissions:
   - Go to: **System Settings → Privacy & Security → Accessibility**
   - Click **+** and select your Terminal or IDE app
   - Close and reopen your Terminal/IDE
   - Run tests again

For detailed information, see: [E2E_MACOS_PERMISSIONS.md](E2E_MACOS_PERMISSIONS.md)

## License

MIT

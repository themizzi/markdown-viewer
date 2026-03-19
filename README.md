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

## Project Structure

```
src/
  main.ts           - Electron main process
  preload.ts        - Preload script for IPC
  renderer.ts       - Browser-side rendering logic
  index.html        - HTML shell
  styles.css        - Basic styling
  contracts.ts      - TypeScript interfaces
  fileService.ts   - File reading and watching
  markdownService.ts - Markdown to HTML rendering
  viewerController.ts - Application orchestration
```

## License

MIT

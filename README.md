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

## License

MIT

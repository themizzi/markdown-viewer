# AGENTS.md

## Project Overview

Markdown Viewer is a minimal Electron + TypeScript desktop application for rendering GitHub Flavored Markdown with Mermaid diagram support and live file watching.

## Tech Stack

- **Runtime**: Electron 41 + Node.js
- **Language**: TypeScript
- **Build**: electron-vite + electron-builder
- **Testing**: Vitest (unit) + Cucumber + WebDriver (e2e)
- **Linting**: ESLint + TypeScript
- **Markdown**: marked + mermaid + github-markdown-css

## Key Commands

```bash
npm run dev          # Development mode
npm run build        # Production build
npm run start        # Build and run
npm run test         # Unit tests
npm run test:e2e     # E2E tests (requires packaged binary)
npm run typecheck   # TypeScript check
npm run lint        # Linting
npm run lint:fix    # Auto-fix lint issues
```

## Code Conventions

- **Language**: TypeScript strict mode
- **Linting**: ESLint with @typescript-eslint/recommended rules, 0 warnings max
- **Tests**: Unit tests alongside source files (e.g., `foo.ts` → `foo.test.ts`)
- **E2E**: Gherkin scenarios in `e2e/features/`, step definitions in `e2e/steps/`
- **E2E fixtures**: Deterministic fixture files in `e2e/fixtures/`, auto-rewritten per scenario

## Architecture

Follow **SOLID principles**:
- **S**ingle Responsibility: Each module has one purpose (e.g., `fileReader.ts`, `fileWatcher.ts`)
- **O**pen/Closed: Extend behavior via new modules, not modification
- **L**iskov Substitution: Interface contracts are clear and consistent
- **I**nterface Segregation: Small, focused interfaces (see `src/contracts.ts`)
- **D**ependency Inversion: Depend on abstractions, not concrete implementations

## Project Structure

```
src/
├── main.ts           # Electron main process entry
├── preload.ts        # Preload script (IPC bridge)
├── renderer.ts       # Renderer entry
├── rendererBootstrap.ts
├── index.html
├── contracts.ts      # TypeScript interfaces
├── *.ts              # Feature modules
├── *.test.ts         # Unit tests
e2e/
├── features/         # Gherkin .feature files
├── steps/            # Step definitions
├── fixtures/         # Test data files
├── support/          # Hooks and runtime configuration
```

## Operating Rules

- **Do not guess**: When something fails, investigate the actual error. Read test output, check console logs, examine stack traces. Do not assume the cause—find evidence.
- **Test-first**: For behavior changes, write tests first to capture expected behavior, verify they fail, then implement.
- **Verify before commit**: Run `npm run typecheck` and `npm run lint` before committing.
- **E2E prerequisites**: E2E tests require a packaged binary (`npm run package`). macOS requires accessibility permissions for file dialog automation.

## Important Notes

1. E2E tests require a packaged binary and platform-specific setup
2. macOS e2e tests require accessibility permissions for file dialog automation
3. File paths in e2e are relative to project root
# Open File Dialog Plan (Orchestration Prompt)

## Current Baseline

Confirmed starting state:
- `File -> Open` menu item already exists in `src/applicationMenu.ts:28` with `id: "file-open"`.
- `src/main.ts:47` wires a no-op callback placeholder for the Open action.
- No `dialog.showOpenDialog` call is currently implemented.

## Baseline Command Snapshot (Before Changes)

Run these commands before starting work to establish current state:

```bash
# Unit tests - currently PASS
npm test -- --run src/applicationMenu.test.ts
# expected: PASS (3 tests pass)

# E2E tests - currently PASS (tests menu presence, will be replaced)
npm run test:e2e -- --spec ./e2e/features/open-file.feature
# expected: PASS (on macOS) or SKIP (non-macOS)
```

Record these outputs to ensure later changes can be compared unambiguously.

## Files That Already Exist (Update, Don't Create)

- `e2e/features/open-file.feature` - exists, currently tests menu presence, must be replaced with new scenario
- `e2e/steps/open-file.steps.ts` - exists, contains different steps, must be rewritten to exact Gherkin phrases
- `src/applicationMenu.test.ts` - exists, may need extension

## Preflight Environment Check

Before running e2e tests, verify these conditions:

```bash
# Node/npm versions
node -v   # expected: v20.x or v22.x
npm -v    # expected: 10.x

# AppleScript availability
which osascript   # expected: /usr/bin/osascript

# Packaged binary exists (arm64)
test -f ./release/mac-arm64/markdown-viewer.app/Contents/MacOS/markdown-viewer && echo "arm64 EXISTS" || echo "arm64 MISSING"
# expected: arm64 EXISTS

# Packaged binary exists (Intel x64 fallback)
test -f ./release/mac/markdown-viewer.app/Contents/MacOS/markdown-viewer && echo "x64 EXISTS" || echo "x64 MISSING"
# expected: x64 MISSING (if arm64 exists)
```

If binary is missing for your architecture, do not proceed - resolve packaging first.
- Pass criteria: arm64 OR x64 binary exists (either is sufficient)
- arm64 Mac: arm64 binary must exist; x64 may be missing
- Intel Mac: x64 binary must exist; arm64 may be missing
- Node/npm/osascript failures: resolve before proceeding

## Preflight Commands

Run these exact commands in order before starting any milestone work:

```bash
# 1. Install dependencies
npm ci
# expected: no errors, completes successfully

# 2. Build TypeScript
npm run build
# expected: no TypeScript errors, dist/ files generated

# 3. Package app for e2e (required by wdio.conf.ts onPrepare)
npm run package
# expected: ./release/mac-arm64/markdown-viewer.app exists

# 4. Verify AppleScript available
which osascript
# expected: /usr/bin/osascript
```

If any step fails, do not proceed with tests. Packaging failures in onPrepare must be classified separately from test-step failures (see Packaging Failure Gate below).

## Runtime Identity Facts

- appId (package.json:24): `com.markdownviewer.app`
- productName (package.json:25): `markdown-viewer`
- Binary path (wdio.conf.ts:33): `./release/mac-arm64/markdown-viewer.app/Contents/MacOS/markdown-viewer` (arm64)
- Binary path (Intel fallback): `./release/mac/markdown-viewer.app/Contents/MacOS/markdown-viewer`
- AppleScript process name: `markdown-viewer`

## Tag Gating Source of Truth

- `@macos` tag enforcement is configured in `wdio.conf.ts:54` via `tagExpression`.
- Do not duplicate tag logic in step definitions - rely on this central config.

## Prompt

You are a build orchestration agent.

Your only goal is to make `File -> Open` show the native Open File dialog.

Do not implement file-loading behavior.
Do not switch the displayed document.
Do not update renderer content from selected files.
Do not change startup file selection behavior.

## Critical Operating Rules (Strict)

- You are the coordinator only.
- You must manage progress exclusively through `todowrite`.
- You must delegate each milestone to a subagent using the `task` tool.
- You must not skip milestones.
- You must work on exactly one milestone at a time.
- You must not mark milestone/step completion without evidence (changed files + command output).
- Use fail-first workflow: write tests, run and confirm failure, implement, then pass.
- Do not guess at failures; use logs, test output, and code inspection.
- Keep assertions user-visible and behavior-focused.
- Keep scope minimal and exact.

## Dialog/API Decisions (Must Follow)

- Use Electron `dialog.showOpenDialog(options)` from main process.
- Do **not** pass a `BrowserWindow` argument.
  - This ensures macOS shows a standalone dialog (not a sheet).
- Use single-file selection only:
  - `properties: ['openFile']`
  - do not include `multiSelections`
- Use both filters:
  - `{ name: 'Markdown', extensions: ['md', 'markdown', 'mdown', 'mkd', 'mkdn'] }`
  - `{ name: 'All Files', extensions: ['*'] }`

## E2E Assertion Rule (Must Follow)

- AppleScript is used to verify cleanup behavior only.
- Do NOT explicitly assert that the dialog appears before clicking Cancel - clicking Cancel implies the dialog was visible.
- Do not use AppleScript to select a file.
- Do not use AppleScript as a proxy for file-open behavior.
- No telemetry assertion is required in this phase.
- This test is macOS-only and should be gated to run only on macOS.
- The `@macos` tag is enforced via `tagExpression` in `wdio.conf.ts`:
  - On macOS (`darwin`): runs all scenarios (including `@macos`)
  - On non-macOS: runs only scenarios without `@macos`

## Exact Gherkin (Must Use Exactly)

```gherkin
@macos
Feature: Open file dialog

  Scenario: File Open shows the native open dialog
    When the user clicks File Open
    And the user clicks Cancel on the Open File dialog
    Then the Open File dialog is not present
```

## Exact Todo List

1. `Milestone 1 / Step 1: Write Open dialog e2e feature and step definitions`
2. `Milestone 1 / Step 2: Run Open dialog e2e test and confirm expected failure`
3. `Milestone 2 / Step 1: Write Open dialog unit tests`
4. `Milestone 2 / Step 2: Run Open dialog unit tests and confirm expected failure`
5. `Milestone 3 / Step 1: Implement File -> Open standalone dialog callback`
6. `Milestone 3 / Step 2: Pass Open dialog unit tests`
7. `Milestone 3 / Step 3: Pass Open dialog e2e test`
8. `Final Verification / Step 1: Run focused unit and e2e verification`

Initial todo state:

- mark `Milestone 1 / Step 1: Write Open dialog e2e feature and step definitions` as `in_progress`
- mark every other todo as `pending`

## Required Orchestration Protocol

For every step, in order:

1. Update `todowrite` so only the current step is `in_progress`.
2. Delegate that exact step to a subagent.
3. Wait for subagent completion.
4. Review evidence:
   - files changed
   - commands run
   - observed results
5. If and only if complete, mark step `completed`.
6. Move the next step to `in_progress`.
7. Repeat until all steps are complete.

## Required Subagent Prompt Contract

Every subagent prompt must include these exact directives:

- `You are authorized for this single step only.`
- `Do not start the next step.`
- `When you finish, stop and report back with: step completed, files changed, commands run, and observed result.`
- `Do not guess at failures; use evidence from logs, test output, and code inspection.`

## Subagent Scope Constraint

**Subagents must do exactly what they are asked - nothing more, nothing less.**

- Do NOT implement features beyond the current step's scope.
- Do NOT write tests for future steps.
- Do NOT refactor unrelated code.
- Do NOT add logging, telemetry, or instrumentation unless explicitly required.
- Do NOT fix bugs or issues outside the current step's mandate.

If unrelated issues are discovered, report them but do not fix them.

## Exact Subagent Prompt Template

Use this exact prompt for each subagent call - do not modify the core directives:

```
You are authorized for this single step only.

[INSERT STEP DESCRIPTION FROM TODO LIST]

Do not start the next step.

When you finish, stop and report back with: step completed, files changed, commands run, and observed result.

Do not guess at failures; use evidence from logs, test output, and code inspection.

[INSERT ANY STEP-SPECIFIC INSTRUCTIONS FROM MILESTONE BREAKDOWN BELOW]
```

Example for Milestone 1 Step 1:
```
You are authorized for this single step only.

Write Open dialog e2e feature and step definitions

Do not start the next step.

When you finish, stop and report back with: step completed, files changed, commands run, and observed result.

Do not guess at failures; use evidence from logs, test output, and code inspection.

Add/update e2e/features/open-file.feature with the exact Gherkin scenario:
@macos
Feature: Open file dialog
  Scenario: File Open shows the native open dialog
    When the user clicks File Open
    And the user clicks Cancel on the Open File dialog
    Then the Open File dialog is not present

Add/update e2e/steps/open-file.steps.ts with step definitions matching exact Gherkin phrases.
```

## Milestone Breakdown

### Milestone 1: E2E test-first for dialog appearance

#### Step 1: Write e2e feature and step definitions
- Add/update `e2e/features/open-file.feature` with the exact Gherkin scenario above.
- Add `@macos` tag to feature for platform gating.
- Add/update `e2e/steps/open-file.steps.ts`:
  - `When the user clicks File Open`
    - trigger real menu item `file-open` from Electron app menu.
  - `And the user clicks Cancel on the Open File dialog`
    - use AppleScript to click Cancel button.
  - `Then the Open File dialog is not present`
    - use AppleScript to assert dialog no longer present.
- AppleScript must handle cleanup properly.
- Use process name `markdown-viewer` in AppleScript (works for both dev and packaged builds).

Files expected:
- `e2e/features/open-file.feature`
- `e2e/steps/open-file.steps.ts`

#### Step 2: Run e2e and confirm expected failure
Command:
```bash
npm run test:e2e -- --spec ./e2e/features/open-file.feature
```
Expected failure reason:
- dialog implementation not yet wired from `File -> Open`.

### Milestone 2: Unit test-first for standalone dialog config

#### Step 1: Write unit tests
- Add/extend tests to verify:
  - `File -> Open` wiring invokes callback.
  - open dialog helper uses `dialog.showOpenDialog(options)` with no parent window argument.
  - options include `properties: ['openFile']`.
  - options include both markdown-focused filters and "All Files".

### Unit Test Mocking Pattern

For `src/openFileDialog.test.ts`, use this mocking pattern:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { dialog } from 'electron';

// Mock dialog module
vi.mock('electron', async () => {
  const actual = await vi.importActual('electron');
  return {
    ...actual,
    dialog: {
      showOpenDialog: vi.fn().mockResolvedValue({ canceled: true, filePaths: [] })
    }
  };
});

describe('openFileDialog', () => {
  it('calls dialog.showOpenDialog with correct options', async () => {
    const { showOpenFileDialog } = await import('./openFileDialog');
    
    await showOpenFileDialog();
    
    expect(dialog.showOpenDialog).toHaveBeenCalledWith({
      properties: ['openFile'],
      filters: [
        { name: 'Markdown', extensions: ['md', 'markdown', 'mdown', 'mkd', 'mkdn'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
  });
  
  it('does not pass a window argument', async () => {
    const { showOpenFileDialog } = await import('./openFileDialog');
    
    await showOpenFileDialog();
    
    // Verify only one argument passed (options object, no window)
    expect(dialog.showOpenDialog).toHaveBeenCalledTimes(1);
    const callArgs = (dialog.showOpenDialog as any).mock.calls[0];
    expect(callArgs.length).toBe(1);
    expect(typeof callArgs[0]).toBe('object'); // options only
  });
});
```

- Mock: `electron/dialog` module
- Assert: `dialog.showOpenDialog` called with exactly one argument (options object)
- Assert: options contains `properties: ['openFile']`
- Assert: options contains both filter objects in exact order (Markdown first, then All Files)
- Do not assert on return value in this phase

## Unit Test Assertion Contract

All unit tests must follow these exact assertions:

```typescript
// 1. Verify call count
expect(dialog.showOpenDialog).toHaveBeenCalledTimes(1);

// 2. Verify single argument (no window)
const callArgs = (dialog.showOpenDialog as any).mock.calls[0];
expect(callArgs.length).toBe(1);
expect(typeof callArgs[0]).toBe('object');

// 3. Verify options content
expect(dialog.showOpenDialog).toHaveBeenCalledWith({
  properties: ['openFile'],
  filters: [
    { name: 'Markdown', extensions: ['md', 'markdown', 'mdown', 'mkd', 'mkdn'] },
    { name: 'All Files', extensions: ['*'] }
  ]
});
```

- Filter order must be exact: Markdown first, All Files second
- No optional arguments should be asserted (e.g., title, defaultPath)
- Do not test return value handling in this phase

## Unit Test Non-Goal Guardrail

Unit tests must NOT assert any of the following (these are out of scope for this phase):

- No assertion on renderer/document update side effects
- No assertion on file content loading
- No assertion on document title changes
- No assertion on file path switching behavior
- No IPC message assertions related to file loading

The File -> Open callback should only invoke `dialog.showOpenDialog(options)` and return. Any side effects from the dialog (file selection, content loading, etc.) are out of scope.

Files expected:
- `src/openFileDialog.test.ts` (new)
- `src/applicationMenu.test.ts`

#### Step 2: Run unit tests and confirm expected failure
Command:
```bash
npm test -- --run src/openFileDialog.test.ts src/applicationMenu.test.ts
```
Expected failure reason:
- open dialog implementation/helper missing.

### Milestone 3: Implement and pass

#### Step 1: Implement standalone dialog callback
- Add helper for open dialog logic, e.g. `src/openFileDialog.ts`.
- Wire `File -> Open` callback in `src/main.ts`.
- Ensure call is `dialog.showOpenDialog(options)` only (no window argument).
- Keep scope to showing dialog only; no file-open flow.

Files expected:
- `src/openFileDialog.ts` (new)
- `src/main.ts`
- optionally `src/applicationMenu.ts`

#### Step 2: Pass unit tests
Command:
```bash
npm test -- --run src/openFileDialog.test.ts src/applicationMenu.test.ts
```

#### Step 3: Pass e2e test
Command:
```bash
npm run test:e2e -- --spec ./e2e/features/open-file.feature
```

### Final Verification

#### Step 1: Focused verification run
Commands:
```bash
npm test -- --run src/openFileDialog.test.ts src/applicationMenu.test.ts
npm run test:e2e -- --spec ./e2e/features/open-file.feature
```

## Acceptance Criteria

- App menu has `File -> Open`.
- Clicking `File -> Open` triggers native `dialog.showOpenDialog`.
- Dialog is standalone on macOS (not a sheet) by virtue of no parent window argument.
- Dialog is single-file selection only.
- Dialog shows both Markdown and All Files filters.
- E2E uses AppleScript to click Cancel and verify the dialog is no longer visible.
- Explicit appearance assertion is NOT required - clicking Cancel implies the dialog was visible.
- E2E is gated to macOS only via `@macos` tag.
- No file-loading behavior is implemented in this phase.
- AppleScript permission (Accessibility/Automation) is required on macOS; tests assume permission is granted.

## AppleScript Implementation Notes

### Process Selector
- Use process name `markdown-viewer` in AppleScript (as defined in Runtime Identity Facts section).

### Exact AppleScript Snippet Contract

Use exactly this script structure. Do not deviate:

```applescript
-- Click Cancel on Open File dialog
tell application "System Events"
  tell process "markdown-viewer"
    -- Wait for dialog to appear (max 10 seconds)
    repeat with i from 1 to 50
      if exists (first window whose name contains "Open") then exit repeat
      delay 0.2
    end repeat
    
    -- Click Cancel button
    click button "Cancel" of (first window whose name contains "Open")
  end tell
end tell
```

```applescript
-- Assert dialog is not present
tell application "System Events"
  tell process "markdown-viewer"
    -- Wait for dialog to close (max 10 seconds)
    repeat with i from 1 to 50
      if not (exists (first window whose name contains "Open")) then exit repeat
      delay 0.2
    end repeat
    set dialogExists to exists (first window whose name contains "Open")
    return not dialogExists
  end tell
end tell
```

- Process name: must be exactly `markdown-viewer`
- Button: must be exactly `Cancel`
- Window: match by name containing "Open"
- Do not add arbitrary delays, timeouts, or alternative selectors

### Timeout and Retry Policy

- Dialog appearance: poll up to 10 seconds (50 x 200ms)
- Dialog dismissal assertion: poll up to 10 seconds (50 x 200ms)
- No additional retries - if either fails, the test fails

### Cleanup
- Click Cancel to close dialog cleanly.
- Assert dialog is no longer visible.

### Permission Requirement
- Tests require macOS Accessibility/Automation permission.
- If permission is not granted, tests will fail due to AppleScript access denied.
- This is a known limitation and must be set up manually or via system preferences.

### macOS Permission Precheck

One-line check for missing Automation/Accessibility permission:

```bash
osascript -e 'tell application "System Events" to keystroke "x"'
# expected failure text if missing: "Application isn't allowed to send Apple events"
```

If this command fails with "Application isn't allowed to send Apple events" or similar permission error, grant Automation permission to the test runner (Terminal or VS Code) in System Settings > Privacy & Security > Automation.

### Test Execution Note
- Milestone 1 Step 2, Milestone 3 Step 3, and Final Verification e2e runs are expected on macOS only.
- On non-macOS, `@macos` scenarios are skipped via `tagExpression` in `wdio.conf.ts`.

## Platform Execution Matrix

| Platform | Unit Tests | E2E Tests | Expected Outcome |
|----------|------------|-----------|------------------|
| macOS (darwin) | Required | Runs all `@macos` scenarios | Full verification |
| Linux | Required | Skips `@macos` scenarios | Unit tests must pass |
| Windows | Required | Skips `@macos` scenarios | Unit tests must pass |

- **Non-macOS**: Only run unit tests. E2E steps are skipped.
- **macOS**: Run both unit and e2e tests.
- Do not consider a build complete until unit tests pass on all platforms.

## Packaging Failure Gate

`npm run test:e2e` triggers `npm run package` via `wdio.conf.ts:onPrepare`. Failures here are **infrastructure failures**, not product failures:

- **Symptom**: e2e test fails immediately with "app not found" or build errors
- **Cause**: `npm run package` failed or packaged binary is missing
- **Action**: Fix packaging before proceeding to test steps

Do not confuse packaging failures with dialog-wiring failures. Check build output first.

## Failure Classification Checklist

When e2e tests fail, classify the failure using these signatures:

### Product Failure (implement to fix)
- Error message contains: `"dialog implementation not yet wired"`, `"Cannot read property"`, `"undefined"` in main process logs
- AppleScript successfully clicked Cancel but dialog did not close → wiring missing

### Environment Failure (infrastructure to fix)
- Error message contains: `"osascript"`, `"permission"`, `"access"`, `" Automation "`, `"Accessibility"`
- Error: `AppleScript error: Application isn't running` → process name mismatch
- Error: `AppleScript error: Can't get button "Cancel"` → dialog didn't appear or wrong process

## Step Definition Contract

- Gherkin step wording must match step definition function names exactly.
- `And the user clicks Cancel on the Open File dialog` is responsible for implied visibility assertion:
  - If we can click Cancel, the dialog was visible.
  - No separate "dialog appears" assertion is needed.
- Step definitions must use exact phrases from Gherkin:
  - `When the user clicks File Open`
  - `And the user clicks Cancel on the Open File dialog`
  - `Then the Open File dialog is not present`

## Dialog Cleanup Guarantee

- If any step fails after the dialog is opened, test cleanup MUST close the dialog before proceeding.
- Canonical cleanup implementation: use an `After` hook in `e2e/support/hooks.ts`.
- Alternative: use try/finally within the step definition itself.
- Do NOT implement cleanup in multiple places - pick one canonical location.
- This prevents dialog state from contaminating subsequent scenarios.

## Cleanup Ownership Rule (Locked)

Canonical cleanup implementation is **mandatory**: use an `After` hook in `e2e/support/hooks.ts`.

Do NOT implement cleanup in step definitions or anywhere else - this is the single source of truth.

```typescript
// In e2e/support/hooks.ts
After(async () => {
  await closeOpenDialogIfPresent();
});
```

Do not scatter cleanup logic across multiple files.

## Evidence Template (Per Milestone Step)

For each completed step, report exactly:

1. **Files changed**: list of modified/created files
2. **Command run**: exact command executed
3. **Observed result**: one-line summary of pass/fail with key detail

Example:
- Files changed: `e2e/features/open-file.feature`, `e2e/steps/open-file.steps.ts`
- Command run: `npm run test:e2e -- --spec ./e2e/features/open-file.feature`
- Observed result: FAILED - "dialog implementation not yet wired" (expected)

## Success Artifacts

Upon completing Final Verification, these artifacts must be present:

### Changed Files
- `src/openFileDialog.ts` - dialog helper implementation
- `src/openFileDialog.test.ts` - unit tests
- `src/main.ts` - callback wiring
- `e2e/features/open-file.feature` - updated Gherkin
- `e2e/steps/open-file.steps.ts` - step definitions with AppleScript

### Passing Command Outputs
```bash
npm test -- --run src/openFileDialog.test.ts src/applicationMenu.test.ts
# expected: PASS
npm run test:e2e -- --spec ./e2e/features/open-file.feature
# expected: PASS (on macOS only)
```

### macOS Proof of Execution
- Console output showing:
  1. `When the user clicks File Open` - menu item triggered
  2. `And the user clicks Cancel on the Open File dialog` - AppleScript clicked Cancel
  3. `Then the Open File dialog is not present` - assertion passed
- AppleScript execution logs showing Cancel button clicked and dialog dismissed
- No lingering dialog windows after test completion

### UI Language Assumption

The AppleScript snippets assume English macOS UI:
- Button text: `Cancel` (not localized, e.g., "Annuler" in French)
- Window name: contains `Open` (for "Open" dialog)

**Default policy**: CI and local test runners must use English-language macOS. Do not implement localization handling in this phase.

If running on non-English macOS, adjust button/window selectors to localized strings.

## Final Evidence Checklist

Before marking this plan complete, verify all of:

- [ ] Changed files list matches Success Artifacts (openFileDialog.ts, openFileDialog.test.ts, main.ts, feature, steps)
- [ ] `npm test -- --run src/openFileDialog.test.ts src/applicationMenu.test.ts` passes
- [ ] `npm run test:e2e -- --spec ./e2e/features/open-file.feature` passes (macOS only)
- [ ] Confirmed: File -> Open still does NOT load or switch files (dialog is shown but no file opened)
- [ ] Confirmed: Renderer content unchanged after clicking File -> Open and Cancel
- [ ] Baseline snapshot commands re-run and still pass (no regression)
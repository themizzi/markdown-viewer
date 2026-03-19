# Open File Plan

## Prompt

You are a build orchestration agent.

Your only goal is to make the app show a `File -> Open` menu item.

Do not implement any actual open-file behavior.
Do not change startup behavior.
Do not add dialog handling.
Do not add file switching.
Do not add cancel behavior.
Do not add live-refresh behavior.

## Non-negotiable Rules

- Use subagents for every milestone step.
- Use `todowrite` before and after every step.
- Use the exact todo list in this document.
- Work on exactly one step at a time.
- Do not continue to the next step until the current step is complete and the todo list is updated.
- Do not guess at failures; use evidence from logs, test output, and code inspection.
- Keep Gherkin assertions focused on user-visible behavior.

## Exact Todo List

1. `Milestone 1 / Step 1: Write File menu e2e test`
2. `Milestone 1 / Step 2: Run File menu e2e test and confirm expected failure`
3. `Milestone 1 / Step 3: Write File menu unit tests`
4. `Milestone 1 / Step 4: Run File menu unit tests and confirm expected failure`
5. `Milestone 1 / Step 5: Implement File -> Open menu item`
6. `Milestone 1 / Step 6: Pass File menu unit tests`
7. `Milestone 1 / Step 7: Pass File menu e2e test`
8. `Final Verification / Step 1: Run focused unit and e2e verification`

Initial todo state:

- mark `Milestone 1 / Step 1: Write File menu e2e test` as `in_progress`
- mark every other todo as `pending`

## Required Execution Pattern

1. Select the single active step from the todo list.
2. Mark that exact step `in_progress`.
3. Delegate that exact step to a subagent.
4. Wait for the subagent to report completion.
5. Review the evidence.
6. Mark that exact step `completed` only if the step is truly done.
7. Move the next step to `in_progress`.

## Required Subagent Prompt Rules

Every subagent prompt must include these instructions:

- `You are authorized for this single step only.`
- `Do not start the next step.`
- `When you finish, stop and report back with: step completed, files changed, commands run, and observed result.`
- `Do not guess at failures; use evidence from logs, test output, and code inspection.`

## Goal

Add a `File` menu containing an `Open` item to the application menu.

That is the entire scope of this plan.

## Useful Commands

```bash
npm install
npm run build
npm test -- --run
npm test -- --run src/applicationMenu.test.ts
npm run test:e2e -- --spec ./e2e/features/open-file.feature
```

## Test Strategy

Only test that the menu item exists.

Do not test any open dialog behavior yet.

### E2E

Assert only that the user can observe a `File` menu with an `Open` item.

### Unit

Assert only that the application menu contains `File -> Open` and that the menu item is wired to a callback.

## Build and Harness Setup

Keep the existing WDIO runner and Cucumber setup.

No separate test build is required for this plan.

Use the existing app/test setup unless a failing test provides evidence that a small harness adjustment is necessary.

## Feature File

Create or update `e2e/features/open-file.feature` with this scenario:

```gherkin
Feature: Open file menu

  Scenario: The File menu includes Open
    When the user opens the File menu
    Then the File menu should include Open
```

## Milestone 1: The File menu includes Open

### Step 1: Write the e2e test first

- add the menu-existence scenario to `e2e/features/open-file.feature`
- add step definitions needed to inspect the application menu

Files expected to change:

- `e2e/features/open-file.feature`
- `e2e/steps/open-file.steps.ts`

### Step 2: Run the e2e test and confirm it fails for the expected reason

- confirm the failure is due to the missing `File -> Open` menu item

Suggested command:

```bash
npm run test:e2e -- --spec ./e2e/features/open-file.feature
```

### Step 3: Write the unit tests

- add unit tests for a testable application menu module
- verify the application menu includes `File -> Open`
- verify the `Open` item is wired to the provided callback

Suggested unit test targets:

- `src/applicationMenu.test.ts`
  - creates a `File` menu
  - includes an `Open` item under `File`
  - wires the `Open` item to the provided callback
  - assigns a stable menu item id such as `file-open`

Files expected to change:

- `src/applicationMenu.test.ts`

### Step 4: Run the unit tests and confirm they fail for the expected reason

- confirm they fail because the menu is not implemented yet

Suggested command:

```bash
npm test -- --run src/applicationMenu.test.ts
```

### Step 5: Write the implementation

- add an application menu with `File -> Open`
- give the `Open` item a stable menu item id such as `file-open`
- wire the `Open` item to a placeholder callback

Files expected to change:

- `src/applicationMenu.ts`
- `src/main.ts`

### Step 6: Pass the unit tests

Suggested command:

```bash
npm test -- --run src/applicationMenu.test.ts
```

### Step 7: Pass the e2e test

Suggested command:

```bash
npm run test:e2e -- --spec ./e2e/features/open-file.feature
```

## Step Definition Guidance

- `When the user opens the File menu`
  - access the real application menu through Electron
- `Then the File menu should include Open`
  - assert that the `File` submenu contains an `Open` item

Avoid assertions about:

- dialog APIs
- IPC channel names
- file switching
- controller method names

## Acceptance Criteria

- the app shows a `File` menu
- the `File` menu includes an `Open` item
- unit tests cover menu creation and callback wiring
- e2e tests cover visible menu behavior only

## Final Verification

```bash
npm test -- --run src/applicationMenu.test.ts
npm run test:e2e -- --spec ./e2e/features/open-file.feature
```

# Keyboard Shortcut for Table of Contents

## Prompt

Implement a keyboard shortcut (F6) for toggling the Table of Contents sidebar. The F6 shortcut must be:
- Displayed as a tooltip on the toolbar button when hovering
- Displayed next to the menu item in the application menu (via Electron accelerator)
- Functional: pressing F6 toggles the sidebar open/closed

Tests are written first and must fail before implementation begins.

## Non-Goals

- This plan does not cover implementing keyboard shortcut handling via Electron's globalShortcut module — Electron menus natively handle accelerator keys without additional registration.
- Does not cover platform-specific accelerators (e.g., Cmd on macOS, Ctrl on Windows).

## Exact Todo List

- [ ] **[Milestone 0 - Step 1]** Verify existing test infrastructure and codebase state
- [ ] **[Milestone 1 - Step 1]** Add E2E scenario for tooltip in `e2e/features/toc-sidebar.feature`
- [ ] **[Milestone 1 - Step 2]** Add step definition for tooltip in `e2e/steps/toc-sidebar.steps.ts`
- [ ] **[Milestone 1 - Step 3]** Run E2E tests and confirm tooltip scenario fails
- [ ] **[Milestone 1 - Step 4]** Add `title` attribute to toolbar button in `src/index.html`
- [ ] **[Milestone 1 - Step 5]** Run E2E tests and confirm tooltip scenario passes
- [ ] **[Milestone 2 - Step 1]** Add unit test verifying F6 accelerator in `src/applicationMenu.test.ts`
- [ ] **[Milestone 2 - Step 2]** Run unit tests and confirm accelerator test fails
- [ ] **[Milestone 2 - Step 3]** Add F6 accelerator to menu item in `src/applicationMenu.ts`
- [ ] **[Milestone 2 - Step 4]** Run unit tests and confirm accelerator test passes
- [ ] **[Milestone 3 - Step 1]** Add E2E scenario for F6 showing the TOC in `e2e/features/toc-sidebar.feature`
- [ ] **[Milestone 3 - Step 2]** Add step definition for pressing F6 in `e2e/steps/toc-sidebar.steps.ts`
- [ ] **[Milestone 3 - Step 3]** Run E2E tests and confirm scenario fails
- [ ] **[Milestone 3 - Step 4]** Verify F6 keyboard shortcut functionality
- [ ] **[Milestone 3 - Step 5]** Run E2E tests and confirm scenario passes
- [ ] **[Milestone 4 - Step 1]** Add E2E scenario for F6 hiding the TOC in `e2e/features/toc-sidebar.feature`
- [ ] **[Milestone 4 - Step 2]** Run E2E tests and confirm scenario fails
- [ ] **[Milestone 4 - Step 3]** Run E2E tests and confirm scenario passes
- [ ] **[Milestone 5 - Step 1]** Run all tests and summarize output

## Delegation Rule

> **CRITICAL**: The orchestrator must not execute any steps directly. All steps must be delegated to a subagent. One milestone at a time. The orchestrator only updates `todowrite` and coordinates subagents.

The orchestrator uses `todowrite` (a task-tracking tool) to mark items as complete. After each subagent report, the orchestrator marks the just-completed step as done in `todowrite` before assigning the next step.

If a subagent encounters an unexpected failure (not the documented expected failure), the subagent should stop, report the error to the orchestrator, and await guidance.

## Subagent Prompt Template

When delegating a milestone to a subagent, use this template:

```
You are assigned to complete **[Milestone X: Name]** from the plan at `plans/TOC_KEYBOARD_SHORTCUT.md`.

Your task is to complete all steps within this milestone. After each step, report back to the orchestrator with:
1. Files changed
2. Commands run
3. Observed result (pass/fail/error)
4. Completion status

Once all steps in the milestone are complete, report back to the orchestrator for coordination.

Steps to complete:
[Copy all step headers and instructions from the milestone section]
```

## Milestones

Each milestone is a self-contained unit of work to be delegated to a subagent. The subagent completes all steps within the milestone, reporting back to the orchestrator after each step so the orchestrator can update `todowrite`. The orchestrator assigns the next milestone only after receiving the subagent's report.

### Milestone 0: Prerequisites

#### [Milestone 0 - Step 1]: Verify existing test infrastructure and codebase state

Before writing any tests, verify the codebase is in a known good state.

Commands:
```bash
npm install
npm run typecheck
npm run lint
npm run test -- src/applicationMenu.test.ts
```

Also verify the shared `Given` step exists in the codebase:

Command:
```bash
grep -n "Given the app is showing the initial test markdown document" e2e/steps/*.ts
```

**Expected**: Step exists in `e2e/steps/open-file.steps.ts`. If not found at line 12, search for it and note the actual location.

**Completion condition**: All commands exit with code 0 (no existing test failures)

---

### Milestone 1: Tooltip Scenario

#### [Milestone 1 - Step 1]: Add E2E scenario for tooltip verification

File: `e2e/features/toc-sidebar.feature`

Add new scenario (after line 74, before TOC test scenarios):

```gherkin
Scenario: Toolbar button tooltip shows keyboard shortcut
  Given the app is showing the initial test markdown document
  When the user hovers over the table of contents toggle button
  Then the tooltip should contain "F6"
```

---

#### [Milestone 1 - Step 2]: Add step definitions for tooltip

File: `e2e/steps/toc-sidebar.steps.ts`

Add new step definitions (after existing `When`/`Then` definitions):

```typescript
When("the user hovers over the table of contents toggle button", async function () {
  const tocToggleButton = await browser.$('[data-testid="toc-toggle-button"]');
  await tocToggleButton.moveTo();
});

Then("the tooltip should contain {string}", async function (text: string) {
  const tocToggleButton = await browser.$('[data-testid="toc-toggle-button"]');
  const title = await tocToggleButton.getAttribute("title");
  expect(title).toContain(text);
});
```

**Completion condition**: Files contain the new step and scenario text

---

#### [Milestone 1 - Step 3]: Verify tooltip E2E test fails

Command:
```bash
npm run test:e2e
```

**Expected failure**:
```
Error: Expect attribute value to contain 'F6'
Actual: null
```

**Completion condition**: E2E test run completes with the new scenario failing

---

#### [Milestone 1 - Step 4]: Implement tooltip

File: `src/index.html`

Add `title="Toggle Table of Contents (F6)"` to the button element:

```html
<!-- Button element (line 19-27), change from: -->
<button
  type="button"
  class="toc-toggle-button"
  data-testid="toc-toggle-button"
  aria-label="Toggle sidebar"
  aria-pressed="false"
>
  <img src="/assets/sidebar.svg" alt="" class="sidebar-icon" />
</button>

<!-- To: -->
<button
  type="button"
  class="toc-toggle-button"
  data-testid="toc-toggle-button"
  aria-label="Toggle sidebar"
  aria-pressed="false"
  title="Toggle Table of Contents (F6)"
>
  <img src="/assets/sidebar.svg" alt="" class="sidebar-icon" />
</button>
```

**Completion condition**: `grep -n 'title="Toggle Table of Contents (F6)"' src/index.html` returns a match

---

#### [Milestone 1 - Step 5]: Verify tooltip E2E test passes

Command:
```bash
npm run test:e2e
```

**Completion condition**: The tooltip scenario passes

---

### Milestone 2: Menu Scenario

#### [Milestone 2 - Step 1]: Add unit test verifying the F6 accelerator

File: `src/applicationMenu.test.ts`

- Add interface field for `accelerator` to `FakeMenuItem`, `TemplateItem`
- Update `buildFakeMenu()` function to copy `accelerator: t.accelerator` in the returned object
- Add a new test case that finds the "Show Table of Contents" menu item and asserts it has `accelerator: "F6"`

```typescript
// Add to interface (line ~14 and ~23):
accelerator?: string;

// In buildFakeMenu() returned object (after line 45), add:
accelerator: t.accelerator

// New test (after line 150):
it("Show Table of Contents item has F6 accelerator", () => {
  const template = createApplicationMenu() as unknown as unknown[];
  const menu = buildFakeMenu(template);

  const viewMenu = menu.items.find((item) => item.label === "View");
  const tocItem = viewMenu?.submenu?.find(
    (item) => item.label === "Show Table of Contents"
  ) as unknown as { accelerator?: string };

  expect(tocItem?.accelerator).toBe("F6");
});
```

**Completion condition**: Files contain the new test and interface changes

---

#### [Milestone 2 - Step 2]: Verify menu accelerator unit test fails

Command:
```bash
npm run test -- src/applicationMenu.test.ts
```

**Expected failure**:
```
Expected: "F6"
Received: undefined
```

**Completion condition**: Unit test run completes with the new test failing

---

#### [Milestone 2 - Step 3]: Implement menu accelerator

File: `src/applicationMenu.ts`

Add `accelerator: "F6"` to the menu item:

```typescript
// In createViewSubmenu() (line 15-21), change from:
{
  label: "Show Table of Contents",
  id: "view-toggle-table-of-contents",
  type: "checkbox" as const,
  checked: false,
  click: onToggleToc
}

// To:
{
  label: "Show Table of Contents",
  accelerator: "F6",
  id: "view-toggle-table-of-contents",
  type: "checkbox" as const,
  checked: false,
  click: onToggleToc
}
```

**Completion condition**: `grep -n 'accelerator: "F6"' src/applicationMenu.ts` returns a match

---

#### [Milestone 2 - Step 4]: Verify menu accelerator unit test passes

Command:
```bash
npm run test -- src/applicationMenu.test.ts
```

**Completion condition**: The accelerator test passes

---

### Milestone 3: Pressing Keyboard Shortcut Opens Sidebar

#### [Milestone 3 - Step 1]: Add E2E scenario for F6 showing the TOC

File: `e2e/features/toc-sidebar.feature`

Add new scenario:

```gherkin
Scenario: Pressing F6 opens the table of contents sidebar
  Given the app is showing the initial test markdown document
  And the table of contents sidebar is hidden
  When the user presses F6
  Then the table of contents sidebar should be visible
```

---

#### [Milestone 3 - Step 2]: Add step definition for pressing F6

File: `e2e/steps/toc-sidebar.steps.ts`

Add new step definition:

```typescript
When("the user presses F6", async function () {
  await browser.keys("F6");
});
```

**Note**: The `Given` and `Then` steps for sidebar visibility already exist in the codebase at lines 98-121 (`Given("the table of contents sidebar is {word}")` and `Then("the table of contents sidebar should be {word}")`).

**Completion condition**: Files contain the new step and scenario text

---

#### [Milestone 3 - Step 3]: Verify keyboard open E2E test fails

Command:
```bash
npm run test:e2e
```

**Expected failure**:
```
Error: Expected <toc-sidebar> to be displayed
```

**Completion condition**: E2E test run completes with the new scenario failing

---

#### [Milestone 3 - Step 4]: Verify F6 keyboard shortcut functionality

Before implementing, verify that the existing menu accelerator architecture works for keyboard-initiated events.

**Architecture check**: Adding `accelerator: "F6"` to the menu item (Step 9) causes Electron to invoke the menu item's `click` handler (`onToggleToc`), which calls `sidebarVisibility?.toggle()` in main.ts. This triggers the existing IPC channel (`IPC_SIDEBAR_VISIBILITY_CHANGED`) to notify the renderer.

Command to verify:
```bash
npm run test:e2e
```

**Expected result**: If the existing menu architecture properly routes accelerator clicks through the IPC channel to update the renderer's DOM, the test should pass without additional implementation changes.

**If test fails**, diagnose the failure:
1. **Menu accelerator not firing**: Check if `browser.keys("F6")` reaches the main process menu accelerator, or if it only sends a key event to the focused element in the renderer. If Electron menus don't intercept `browser.keys("F6")`, alternative approaches include:
   - Using `browser.execute()` to dispatch a custom keyboard event
   - Directly invoking the IPC channel from the test

2. **IPC not updating renderer**: Verify `IPC_SIDEBAR_VISIBILITY_CHANGED` listener in the renderer updates the DOM correctly.

**Completion condition**: `npm run test:e2e` passes for the "Pressing F6 opens" scenario

---

### Milestone 4: Pressing Keyboard Shortcut Hides Sidebar

#### [Milestone 4 - Step 1]: Add E2E scenario for F6 hiding the TOC

File: `e2e/features/toc-sidebar.feature`

Add new scenario:

```gherkin
Scenario: Pressing F6 hides the table of contents sidebar
  Given the app is showing the initial test markdown document
  And the table of contents sidebar is visible
  When the user presses F6
  Then the table of contents sidebar should be hidden
```

**Completion condition**: File contains the new scenario

---

#### [Milestone 4 - Step 2]: Verify keyboard hide E2E test fails

Command:
```bash
npm run test:e2e
```

**Expected failure**:
```
Error: Expected <toc-sidebar> to not be displayed
```

**Completion condition**: E2E test run completes with the new scenario failing

---

#### [Milestone 4 - Step 3]: Verify keyboard hide E2E test passes

Command:
```bash
npm run test:e2e
```

**Note**: If Step 14 passes and the accelerator is properly wired, the menu's `onToggleToc` handler toggles the sidebar state regardless of current visibility. The "hides" scenario reuses the same implementation as "opens" — the toggle is stateless.

**Completion condition**: The "Pressing F6 hides the table of contents sidebar" scenario passes

---

### Milestone 5: Verification

#### [Milestone 5 - Step 1]: Run all tests and summarize output

Commands:
```bash
npm run typecheck
npm run lint
npm run test
npm run test:e2e
```

**Completion condition**:
- `npm run typecheck` exits with code 0
- `npm run lint` reports 0 warnings
- All unit tests pass
- All E2E scenarios pass (tooltip, menu accelerator, keyboard show, keyboard hide)

Summarize the output of each command showing green tests.

---

## Baseline State

Before this plan:
- Menu item "Show Table of Contents" has no `accelerator` property
- Toolbar button has no `title` attribute
- F6 key does not toggle the TOC sidebar

After this plan:
- Menu item displays "Show Table of Contents F6" (Electron auto-displays accelerator)
- Toolbar button shows "Toggle Table of Contents (F6)" on hover
- F6 key toggles the TOC sidebar visibility

## Environment Checks

- Ensure `npm run test` runs unit tests with Vitest
- Ensure `npm run test:e2e` runs E2E tests (requires packaged binary via `npm run package`)
- For local E2E on macOS: Ensure accessibility permissions are granted

## Acceptance Criteria

1. E2E tooltip scenario fails first (no `title`), then passes after implementation
2. Unit accelerator test fails first (no `accelerator`), then passes after implementation
3. E2E keyboard open scenario fails first, then passes after implementation
4. E2E keyboard hide scenario fails first, then passes (same implementation as open)
5. `npm run typecheck` passes with no errors
6. `npm run lint` passes with 0 warnings
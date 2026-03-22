# Resizable TOC Sidebar Feature

## Prompt

Implement a feature to resize the TOC (Table of Contents) sidebar horizontally
  with the mouse. At a certain small size, it should collapse automatically. It
  should have a maximum size of about 1/3 the window width.

## Non-negotiable Rules

- **Delegate to subagent**: Each milestone MUST be delegated to a subagent. Do
  NOT attempt to complete milestones yourself. Use the exact subagent prompt
  provided in each milestone section.

- **One scenario per milestone**: Each milestone focuses on one test scenario
  and the minimal implementation to pass it

- **Test-first approach**: Write tests before implementation, verify they fail,
  then implement

- **SOLID principles**: Follow single responsibility - create a dedicated module
  for resize logic

- **TypeScript strict mode**: All new code must pass type checking

- **ESLint compliance**: Zero warnings allowed

- **No guesswork**: Investigate actual errors, read test output, check console
  logs

- **E2E prerequisites**: E2E tests require packaged binary (`npm run package`)

- **Platform considerations**: macOS requires accessibility permissions for file
  dialog automation

## Current State

### Existing Files

- `src/index.html`: Contains `.toc-sidebar` element inside `.layout-wrapper`

- `src/styles.css`: Defines `.toc-sidebar` with fixed `--sidebar-width: 240px`

- `src/sidebarVisibility.ts`: Manages sidebar visibility state (show/hide)

- `src/sidebarIntegration.ts`: IPC handlers for sidebar toggle

- `src/rendererBootstrap.ts`: Queries DOM elements and creates `AppBootstrap`

- `e2e/features/toc-sidebar.feature`: Existing e2e tests for sidebar visibility

### Key CSS Variables

- `--sidebar-width: 240px` (current fixed width)

- `--sidebar-width-sm: 200px`

- `--sidebar-width-xs: 160px`

### Architecture

The sidebar currently has:

- Fixed width defined in CSS

- Hidden/visible state managed by `SidebarVisibility` class

- Toggle via toolbar button and View menu

- `AppBootstrap` in `rendererBootstrap.ts` manages sidebar visibility

## Execution Pattern

**Work on exactly one milestone at a time:**

1. Update `todowrite` to mark current milestone as `in_progress`

2. Delegate the current milestone to a subagent using the exact prompt provided

3. Wait for evidence of completion (test output, file changes)

4. Mark milestone as `completed` in `todowrite`

5. Move to next milestone

## Subagent Prompt Contract

**Authorized for one milestone only.** Do not start the next milestone. Stop
  after completion and report:

- Files changed (with paths)

- Commands run

- Observed result (test output, errors, or success confirmation)

**Evidence Format**:

- Git diff output or file content changes

- Command output in code blocks

- File paths with line numbers for any errors

## Rollback Strategy

If a milestone fails:

1. Revert changes to the specific files modified in that milestone

2. Run `npm run test` to confirm baseline is restored

3. Investigate the specific failure before re-attempting

## Milestone 0: Baseline Verification

**Scenario**: "Baseline verification - all existing tests pass"

**Goal**: Confirm existing tests pass and verify test environment is configured
correctly.

**NOTE**: Delegate this milestone to a subagent using the prompt below.

### Subagent Prompt for Milestone 0

You are implementing Milestone 0: Baseline Verification.

GOAL: Run npm install, verify existing tests pass, and ensure the development
environment is working.

CONTEXT:

- This is a new feature branch - no changes have been made yet
- The project uses Electron + TypeScript + Vitest

WORK REQUIRED:

1. Run `npm install` to ensure all dependencies are installed
2. Run `npm run test` to verify unit tests pass
3. Run `npm run typecheck` to verify TypeScript compiles
4. Run `npm run lint` to verify linting passes
5. Run `npm run build` to verify the project builds

VERIFICATION:

- All commands must pass with 0 errors
- If any command fails, investigate and fix before proceeding

COMPLETION CRITERIA:

- `npm install` completes successfully
- `npm run test` passes
- `npm run typecheck` passes
- `npm run lint` passes
- `npm run build` passes

Stop after completing this milestone and report all command outputs.

## Milestone 1: Resize Handle Visibility

**Scenario**: "Resize handle is visible when sidebar is shown"

**Goal**: Make the resize handle element visible on the right edge of the TOC
sidebar.

**NOTE**: Delegate this milestone to a subagent using the prompt below.

### CSS Positioning Strategy

The `.layout-wrapper` uses flexbox. Position the resize handle using:

```css
.layout-wrapper {
  display: flex; /* already set */
}

.toc-sidebar {
  position: relative; /* add this to contain absolute resize handle */
}

.resize-handle {
  position: absolute;
  right: -2px; /* center on the border */
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: col-resize;
}

```

### Subagent Prompt for Milestone 1

You are implementing Milestone 1: Resize Handle Visibility.

GOAL: Make the resize handle element visible on the right edge of the TOC
  sidebar.

CONTEXT:

- The TOC sidebar is in src/index.html with data-testid="toc-sidebar"

- CSS variables are defined in src/styles.css :root

- Current sidebar width: --sidebar-width: 240px

WORK REQUIRED:

1. Add a resize handle div element **inside** `.toc-sidebar` in src/index.html,
   as the last child element

2. Add CSS styles for .resize-handle in src/styles.css

3. Add `position: relative` to .toc-sidebar to contain the absolute resize

  handle

IMPLEMENTATION DETAILS:

- HTML: `<div class="resize-handle" data-testid="resize-handle"
  aria-label="Resize sidebar"></div>`

- Place this as the **last child inside** `.toc-sidebar` (not as a sibling after
  it)

- CSS: Add `.resize-handle` with:

  - `position: absolute; right: -2px; top: 0; bottom: 0;`

  - `width: 4px; cursor: col-resize;`

- Background color on hover for visibility (e.g., `background: rgba(0,0,0,0.1)`)

- Add `position: relative` to `.toc-sidebar` to contain the absolute positioning

FILES TO CREATE/MODIFY:

- src/index.html (add resize handle element)

- src/styles.css (add .resize-handle styles)

VERIFICATION:

- Run: npm run lint (must pass with 0 warnings)

- Run: npm run typecheck (must pass with 0 errors)

- Manually verify: Resize handle is visible when sidebar is shown

EVIDENCE REQUIRED:

- Show the diff of changes to src/index.html and src/styles.css

- Show output of npm run lint and npm run typecheck

DO NOT:

- Implement drag functionality yet

- Create unit tests yet

- Modify any TypeScript files

Stop after completing this milestone and report files changed, commands run, and
  observed result.

**Completion Condition**: Resize handle element exists and is styled visibly.

## Milestone 2: Drag to Resize - Basic Implementation

**Scenario**: "Drag resize handle to increase sidebar width"

**Goal**: Implement the core SidebarResize module and make dragging
increase/decrease sidebar width.

**NOTE**: Delegate this milestone to a subagent using the prompt below.

### Unit Test Setup

Use vitest with happy-dom environment. Check `vitest.config.ts` for environment
  configuration. Test file pattern:

```typescript

import { describe, it, expect } from 'vitest';
// Use happy-dom or jsdom environment as configured in vitest.config.ts

```

### Subagent Prompt for Milestone 2

You are implementing Milestone 2: Drag to Resize - Basic Implementation.

GOAL: Implement the core SidebarResize module and make dragging
  increase/decrease sidebar width.

CONTEXT:

- Resize handle exists from Milestone 1

- Sidebar element has data-testid="toc-sidebar"

- DOM elements are queried in src/rendererBootstrap.ts

- Sidebar width is currently fixed via CSS variable --sidebar-width: 240px

WORK REQUIRED:

1. Create src/sidebarResize.ts with the SidebarResize class

2. Create src/sidebarResize.test.ts with unit tests (use vitest + happy-dom)

3. Integrate SidebarResize in src/rendererBootstrap.ts

IMPLEMENTATION DETAILS:

Unit test file structure:

- Location: `src/sidebarResize.test.ts` (alongside source file)

- Imports: `import { describe, it, expect } from 'vitest';`

- Use happy-dom or jsdom environment as configured in vitest.config.ts

- Expected test count: 4-6 tests covering getMinWidth(), getMaxWidth(),
  shouldCollapse(true), shouldCollapse(false), constrainWidth()

SidebarResize class API:

```typescript

export class SidebarResize {
  constructor(
    sidebar: HTMLElement,
    resizeHandle: HTMLElement,
    onCollapse: (collapsed: boolean) => void
  ) {}
  
  enable(): void;  // Start listening to drag events
  disable(): void; // Stop listening and cleanup
  getWidth(): number;
  setWidth(width: number): void;
  getMinWidth(): number; // Return 120 (collapse threshold)
  getMaxWidth(): number; // Return window.innerWidth / 3
  shouldCollapse(width: number): boolean; // Return true if width < minWidth
}

```

**Note on window reference**: Use the global `window` object directly for
  `window.innerWidth` in the renderer context. Do not inject window as a
  dependency.

Drag behavior:

- On mousedown on resizeHandle: add mousemove and mouseup listeners to window

- On mousemove: calculate new width from mouse X position, call setWidth()

- On mouseup: remove listeners

- Use sidebar.style.width = `${width}px` to update width inline

- **Important**: `getMaxWidth()` should use `window.innerWidth` from the global
  context at the time of the call (not cached), since the window may be resized
  between calls

Unit tests (src/sidebarResize.test.ts):

- Test getMinWidth() returns 120

- Test getMaxWidth() returns window width / 3

- Test shouldCollapse(width) returns true when width < 120

- Test shouldCollapse(width) returns false when width >= 120

- Use happy-dom for DOM simulation if needed

Integration in rendererBootstrap.ts:

- Add resizeHandle to DomElements interface

- Query resizeHandle in queryDomElements()

- Create SidebarResize instance in AppBootstrap

- Call enable() in start() method

- Pass a no-op onCollapse callback for now (will wire in Milestone 3)

FILES TO CREATE/MODIFY:

- src/sidebarResize.ts (CREATE)

- src/sidebarResize.test.ts (CREATE)

- src/rendererBootstrap.ts (MODIFY - add resize handle query and SidebarResize
  integration)

VERIFICATION:

- Run: npm run test (must pass, including new sidebarResize.test.ts)

- Run: npm run lint (must pass with 0 warnings)

- Run: npm run typecheck (must pass with 0 errors)

- Manually verify: Dragging resize handle changes sidebar width

EVIDENCE REQUIRED:

- Show the content of src/sidebarResize.ts and src/sidebarResize.test.ts

- Show the diff of changes to src/rendererBootstrap.ts

- Show output of npm run test, npm run lint, npm run typecheck

DO NOT:

- Implement collapse behavior yet (use no-op callback)

- Implement maximum width clamping in tests yet

- Modify CSS from Milestone 1

Stop after completing this milestone and report files changed, commands run, and
  observed result.

**Completion Condition**: Dragging resize handle changes sidebar width, unit
  tests pass.

## Milestone 3: Collapse at Minimum Width

**Scenario**: "Sidebar collapses when resized below threshold"

**Goal**: Make the sidebar collapse and hide when resized below the minimum
width threshold.

**NOTE**: Delegate this milestone to a subagent using the prompt below.

### onCollapse Callback Contract

- Call `onCollapse(true)` when width crosses **below** minWidth (sidebar IS
  collapsing)

- Call `onCollapse(false)` when width crosses **back above** minWidth (sidebar
  IS expanding)

- Track internal state to avoid repeated callbacks on the same side of threshold

### Subagent Prompt for Milestone 3

You are implementing Milestone 3: Collapse at Minimum Width.

GOAL: Make the sidebar collapse and hide when resized below the minimum width
  threshold.

CONTEXT:

- SidebarResize module exists from Milestone 2

- Sidebar width can be changed via drag

- SidebarVisibility class manages visibility state (src/sidebarVisibility.ts)

- AppBootstrap applies sidebar visibility via applySidebarVisibility() method

WORK REQUIRED:

1. Update SidebarResize to call onCollapse callback when crossing threshold

2. Wire onCollapse callback in rendererBootstrap.ts to toggle sidebar visibility

3. Add e2e test scenario for collapse behavior

IMPLEMENTATION DETAILS:

onCollapse Callback Contract:

- Call `onCollapse(true)` when width crosses **below** minWidth (sidebar IS
  collapsing)

- Call `onCollapse(false)` when width crosses **back above** minWidth (sidebar
  IS expanding)

- Track internal state to avoid repeated callbacks on the same side of threshold

Update SidebarResize.ts:

- Track internal `isCollapsed` state

- In setWidth(width): if width < minWidth and !isCollapsed, set isCollapsed=true
  and call onCollapse(true)

- In setWidth(width): if width >= minWidth and isCollapsed, set
  IsCollapsed=false and call onCollapse(false)

Update rendererBootstrap.ts:

- Wire onCollapse callback to call requestToggleSidebar() ONLY when
  collapsed=true:

```typescript

const onCollapse = (collapsed: boolean) => {
  if (collapsed) {
    void this.viewerApi.sidebar.requestToggleSidebar();
  }
  // Do nothing on expand - user must manually toggle to re-show sidebar
};

```

- This hides the sidebar when collapsed, but does not auto-show it when expanded
  back above threshold

- The inline width style persists; when user manually re-shows sidebar, it
  reappears at pre-collapse width

Add e2e test (CREATE NEW FILE e2e/features/sidebar-resize.feature):

- Add the "Sidebar collapses when resized below threshold" scenario

- Use WebDriver actions to drag the resize handle left until sidebar hides

- Keep resize scenarios separate from existing toc-sidebar.feature visibility
  scenarios

- Before implementing, examine existing e2e step definitions in `e2e/steps/*.ts`
  for the WebDriver action pattern used to perform drag operations

- **If no drag helper exists**, use WebDriverIO's native action API directly in
  the test:

```typescript

const handle = await browser.$('[data-testid="resize-handle"]');
await browser.action('mouse')
  .move({ origin: handle, x: 2, y: 10 })
  .down()
  .move({ origin: 'pointer', x: -100, y: 0 })
  .up()
  .perform();

```

FILES TO CREATE/MODIFY:

- src/sidebarResize.ts (MODIFY - add collapse callback logic)

- src/rendererBootstrap.ts (MODIFY - wire onCollapse to toggle sidebar)

- e2e/features/sidebar-resize.feature (CREATE with collapse scenario)

VERIFICATION:

- Run: npm run test (must pass)

- Run: npm run lint (must pass with 0 warnings)

- Run: npm run typecheck (must pass with 0 errors)

- Manually verify: Dragging sidebar below 120px collapses it

- Manually verify: View menu checkbox updates when sidebar collapses

EVIDENCE REQUIRED:

- Show the diff of changes to src/sidebarResize.ts and src/rendererBootstrap.ts

- Show the content of e2e/features/sidebar-resize.feature (collapse scenario
  only)

- Show output of npm run test, npm run lint, npm run typecheck

DO NOT:

- Implement maximum width clamping yet

- Add other e2e scenarios yet

Stop after completing this milestone and report files changed, commands run, and
  observed result.

**Completion Condition**: Sidebar collapses when dragged below 120px, View menu
  updates.

## Milestone 4: Maximum Width Constraint

**Scenario**: "Sidebar respects maximum width"

**Goal**: Prevent the sidebar from being resized wider than 1/3 of the window
  width.

**NOTE**: Delegate this milestone to a subagent using the prompt below.

### Window Resize Behavior

- Sidebar width should NOT automatically shrink when window shrinks

- Maximum width constraint only applies during drag operations

- If window shrinks below current sidebar width, sidebar stays at current width
  (no auto-shrink)

### Subagent Prompt for Milestone 4

You are implementing Milestone 4: Maximum Width Constraint.

GOAL: Prevent the sidebar from being resized wider than 1/3 of the window width.

CONTEXT:

- SidebarResize module exists with getMinWidth() and shouldCollapse()

- getMaxWidth() already returns window width / 3 but may not be enforced

- Window resize events may change the maximum allowed width

WORK REQUIRED:

1. Enforce maximum width in SidebarResize.setWidth() and drag handler

2. Add unit tests for maximum width constraint

3. Add e2e test scenario for maximum width

IMPLEMENTATION DETAILS:

Window Resize Behavior:

- Sidebar width should NOT automatically shrink when window shrinks

- Maximum width constraint only applies during drag operations

- If window shrinks below current sidebar width, sidebar stays at current width
  (no auto-shrink)

Update SidebarResize.ts:

- In setWidth(width): clamp width to [minWidth, getMaxWidth()]

- In drag handler: constrain new width before calling setWidth()

- Add private constrainWidth(width: number): number helper method

Add unit tests to sidebarResize.test.ts:

- Test getMaxWidth() returns window.innerWidth / 3

- Test setWidth(width) clamps to max when width > getMaxWidth()

- Test constrainWidth(width) returns minWidth when width < minWidth

- Test constrainWidth(width) returns getMaxWidth() when width > getMaxWidth()

Add e2e test (extend e2e/features/sidebar-resize.feature):

- Add the "Sidebar respects maximum width" scenario

- Drag resize handle right and verify sidebar stops at 1/3 window width

FILES TO CREATE/MODIFY:

- src/sidebarResize.ts (MODIFY - add width clamping)

- src/sidebarResize.test.ts (MODIFY - add max width tests)

- e2e/features/sidebar-resize.feature (MODIFY - add max width scenario)

VERIFICATION:

- Run: npm run test (must pass)

- Run: npm run lint (must pass with 0 warnings)

- Run: npm run typecheck (must pass with 0 errors)

- Manually verify: Sidebar cannot be dragged wider than 1/3 of window

EVIDENCE REQUIRED:

- Show the diff of changes to src/sidebarResize.ts and src/sidebarResize.test.ts

- Show the added e2e scenario

- Show output of npm run test, npm run lint, npm run typecheck

DO NOT:

- Modify CSS

- Add cursor hover scenario yet

Stop after completing this milestone and report files changed, commands run, and
  observed result.

**Completion Condition**: Sidebar width is clamped to maximum of 1/3 window
  width.

## Milestone 5: Cursor Hover Feedback

**Scenario**: "Resize handle shows resize cursor on hover"

**Goal**: Ensure the cursor changes to col-resize when hovering over the resize
  handle.

**NOTE**: Delegate this milestone to a subagent using the prompt below.

### E2E Cursor Verification

WebDriver cannot directly check computed CSS cursor style. Use JavaScript
  execution:

```typescript

const cursor = await browser.execute(() => {
  const handle = document.querySelector('[data-testid="resize-handle"]');
  return getComputedStyle(handle!).cursor;
});
expect(cursor).toBe('col-resize');
```

### Subagent Prompt for Milestone 5

You are implementing Milestone 5: Cursor Hover Feedback.

GOAL: Ensure the cursor changes to col-resize when hovering over the resize
  handle.

CONTEXT:

- Resize handle exists with basic CSS from Milestone 1

- Cursor should be col-resize on hover, grabbing during drag

WORK REQUIRED:

1. Verify/update CSS for cursor styles

2. Add e2e test scenario for cursor hover

IMPLEMENTATION DETAILS:

Update src/styles.css (if needed):

- .resize-handle { cursor: col-resize; }

- .resize-handle.dragging { cursor: grabbing; }

- Ensure the `.dragging` class provides visual feedback during the drag
  operation

Update SidebarResize.ts (if needed):

- Add 'dragging' class to resizeHandle on mousedown

- Remove 'dragging' class on mouseup OR if mouseleave occurs while dragging

- This ensures the grabbing cursor doesn't persist if mouse leaves the handle
  during drag

Add e2e test (extend e2e/features/sidebar-resize.feature):

- Add the "Resize handle shows resize cursor on hover" scenario

- Use JavaScript execution to check computed cursor style:

```typescript

const cursor = await browser.execute(() => {
  const handle = document.querySelector('[data-testid="resize-handle"]');
  return getComputedStyle(handle!).cursor;
});
expect(cursor).toBe('col-resize');

```

FILES TO CREATE/MODIFY:

- src/styles.css (MODIFY - verify cursor styles)

- src/sidebarResize.ts (MODIFY - add dragging class toggle, if needed)

- e2e/features/sidebar-resize.feature (MODIFY - add cursor scenario)

VERIFICATION:

- Run: npm run test (must pass)

- Run: npm run lint (must pass with 0 warnings)

- Run: npm run typecheck (must pass with 0 errors)

- Manually verify: Cursor changes to col-resize on hover, grabbing during drag

EVIDENCE REQUIRED:

- Show any CSS changes

- Show the added e2e scenario

- Show output of npm run test, npm run lint, npm run typecheck

Stop after completing this milestone and report files changed, commands run, and
  observed result.

**Completion Condition**: Cursor changes appropriately on hover and during drag.

## Milestone 6: Final Verification

**Scenario**: "All verification commands pass"

**Goal**: Run all verification commands and ensure the complete feature works.

**NOTE**: Delegate this milestone to a subagent using the prompt below.

### Subagent Prompt for Milestone 6

You are implementing Milestone 6: Final Verification.

GOAL: Run all verification commands and ensure the complete feature works.

WORK REQUIRED:

1. Run full test suite

2. Run e2e tests (requires packaged binary)

3. Run typecheck and lint

4. Document any remaining issues

COMMANDS:

```bash
npm run test
npm run package
npm run test:e2e
npm run typecheck
npm run lint

```

COMPLETION CRITERIA:

- All unit tests pass (including sidebarResize.test.ts)

- All e2e tests pass (including sidebar-resize.feature scenarios)

- Zero TypeScript errors

- Zero ESLint warnings

EVIDENCE REQUIRED:

- Show full output of all 5 commands

- List any failing tests or errors

- If all pass, confirm "All verification commands passed"

Stop after completing this milestone and report the results.

**Completion condition**: All tests, typecheck, and lint pass.

## Acceptance Criteria

1. **Resize handle visible**: A 4px-wide resize handle appears on the right edge
   of the TOC sidebar when visible

2. **Cursor change**: Cursor changes to `col-resize` when hovering over the
   resize handle

3. **Drag to resize**: Clicking and dragging the resize handle horizontally
   changes the sidebar width in real-time

4. **Collapse threshold**: When sidebar width drops below 120px, it collapses
   and hides completely

5. **Maximum width**: Sidebar cannot be resized wider than 33% of the window
   width

6. **Persistence during resize**: Content reflows smoothly during resize without
   flickering

7. **Keyboard accessibility**: Resize functionality does not interfere with
   existing keyboard shortcuts

8. **All tests green**: Unit tests, e2e tests, typecheck, and lint all pass

## Failure Classification

### Test Infrastructure Failures

- Missing packaged binary for e2e: Run `npm run package`

- macOS permissions: Grant accessibility permissions

- Dependency issues: Run `npm install`

### Product Behavior Failures

- Resize handle not visible: Check CSS styles and HTML element

- Drag not working: Check event listener registration

- Width not updating: Check inline style application

- Collapse not triggering: Check threshold comparison logic

## Evidence Templates

### Unit Test Success

```bash
✓ src/sidebarResize.test.ts (12 tests) 45ms
  ✓ SidebarResize > getInitialWidth returns default width
  ✓ SidebarResize > shouldCollapse returns true below threshold
  ...

```

### E2E Test Success

```bash
✓ sidebar-resize.feature (6 scenarios)
  ✓ Resize handle is visible when sidebar is shown
  ✓ Drag resize handle to increase sidebar width
  ...

```

### Manual Verification

- Resize handle visible on right edge of sidebar

- Cursor changes to col-resize on hover

- Sidebar width changes smoothly during drag

- Sidebar collapses at ~120px

- Sidebar stops at ~33% window width

# E2E macOS Permissions - Developer Checklist

## Before Running E2E Tests

- [ ] Read the permissions issue summary: `SOLUTION_SUMMARY.md`
- [ ] Understand the root cause: osascript needs accessibility permissions
- [ ] Choose a setup method (script, manual, or command-line)

## Setting Up Permissions

### Method 1: Automated Setup Script (Recommended)

- [ ] Run: `./scripts/setup-e2e-permissions.sh`
- [ ] Follow on-screen prompts
- [ ] Note which app will get the permissions
- [ ] Script will offer automatic or manual setup

### Method 2: Manual System Settings

- [ ] Open: **System Settings → Privacy & Security → Accessibility**
- [ ] Click the **+** button
- [ ] Navigate to `/Applications/Utilities/Terminal.app` (or your IDE)
- [ ] Click **Open**
- [ ] Verify the app appears in the Accessibility list
- [ ] The toggle should be **ON** (enabled)

### Method 3: Command Line (tccutil)

- [ ] Run: `sudo tccutil grant Accessibility /Applications/Utilities/Terminal.app`
- [ ] Enter your password when prompted
- [ ] Verify with: `tccutil dump Accessibility`

## Verification

- [ ] Close and **fully restart your Terminal/IDE**
- [ ] Verify permissions with:
  ```bash
  osascript -e 'tell application "System Events" to get processes' 2>&1
  ```
- [ ] Should show process list (not permission error)

## Running Tests

- [ ] Build the project: `npm run build`
- [ ] Run unit tests: `npm test -- --run`
- [ ] Run e2e tests: `npm run test:e2e -- --spec ./e2e/features/open-file.feature`
- [ ] Verify all tests pass

## Troubleshooting

### Tests Still Fail with Permission Error

- [ ] **Did you restart Terminal/IDE?** (Required - system caches permissions)
- [ ] **Is the permission actually granted?**
  ```bash
  tccutil dump Accessibility | grep -i "terminal\|vscode\|intellij"
  ```
- [ ] If not listed, go back to System Settings and add it
- [ ] Restart Terminal/IDE again

### Tests Fail But NOT with Permission Error

- [ ] Check: `e2e/reports/wdio.log` for actual error
- [ ] See: `E2E_MACOS_PERMISSIONS.md` → Troubleshooting section
- [ ] Verify app is building: `npm run build`
- [ ] Run with verbose output: `DEBUG=wdio:* npm run test:e2e -- --spec ./e2e/features/open-file.feature`

### Still Unsure?

1. Start from scratch:
   ```bash
   npm run build
   npm run test:e2e -- --spec ./e2e/features/open-file.feature
   ```

2. Note the exact error message

3. Check the comprehensive guide: `E2E_MACOS_PERMISSIONS.md`

4. If still stuck, review the test implementation: `e2e/steps/open-file.steps.ts:35-102`

## Understanding What's Being Tested

The test verifies:
1. ✅ App shows initial markdown document
2. ✅ File → Open menu can be triggered
3. ✅ Native macOS Open File dialog appears
4. ✅ AppleScript can navigate to fixture directory
5. ✅ File selection works deterministically
6. ✅ App switches to selected file in current window
7. ✅ Document content updates without opening new window

## Quick Reference

| Task | Command |
|------|---------|
| Setup permissions | `./scripts/setup-e2e-permissions.sh` |
| Verify permissions | `tccutil dump Accessibility \| grep -i terminal` |
| Run all tests | `npm run build && npm test -- --run && npm run test:e2e` |
| Run just e2e | `npm run test:e2e -- --spec ./e2e/features/open-file.feature` |
| View test code | `e2e/steps/open-file.steps.ts` |
| Full permissions guide | `E2E_MACOS_PERMISSIONS.md` |
| Quick summary | `SOLUTION_SUMMARY.md` |

## Notes

- ✅ This permission is a **one-time setup** per development machine
- ✅ Permissions apply to **your user account**
- ✅ The e2e test is **fully deterministic** once permissions are granted
- ✅ No flaky mouse coordinates - uses AppleScript filename targeting
- ✅ Works on **all recent macOS versions** (11+)

---

**Estimated setup time:** 2-5 minutes depending on method chosen

**Estimated test run time:** 10-15 seconds on modern hardware

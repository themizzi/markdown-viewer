# macOS E2E Permissions Issue - Solution Summary

## Problem

The Open File e2e test fails with:
```
Open File dialog did not appear within 10 seconds
execution error: Not authorized to send Apple events to System Events (-2700)
```

This occurs because **osascript requires accessibility permissions** to interact with native macOS UI elements like file dialogs.

## Why This Happens

macOS enforces **Transparency, Consent, and Control (TCC)** security:
- Applications cannot automate other apps' UI without explicit permission
- AppleScript (`osascript`) needs accessibility access to send events
- This is a **system-level security feature**, not a bug

## The Solution: Grant Accessibility Permissions

### Quick Setup (< 2 minutes)

**Option A: Use the provided script**
```bash
./scripts/setup-e2e-permissions.sh
```
This script will:
1. Detect your Terminal/IDE
2. Ask for permission to grant accessibility via `tccutil`
3. Verify the permission was granted
4. Provide next steps

**Option B: Manual setup via System Settings**
1. Open **System Settings** → **Privacy & Security** → **Accessibility**
2. Click the **+** button
3. Select your **Terminal app** or **IDE** (VS Code, IntelliJ, etc.)
4. Click **Open**
5. Close and reopen your Terminal/IDE
6. Run tests again: `npm run test:e2e -- --spec ./e2e/features/open-file.feature`

### What Permissions Are Needed?

The test requires the process running `osascript` to have **accessibility permissions**. This is granted to:
- The **Terminal app** (if running tests from terminal)
- Your **IDE** (if running tests from IDE terminal)
- The **shell binary** directly (less common)

Most developers grant permissions to their Terminal or IDE, which is the simplest approach.

## Verification

After granting permissions, verify it worked:

```bash
# List all accessibility permissions
tccutil dump Accessibility | grep -i terminal

# Or run a simple osascript test
osascript -e 'tell application "System Events" to get processes' 2>&1
```

You should see a list of processes, not a permission error.

## Next Steps

1. **Grant permissions** using the script or manual instructions above
2. **Restart your Terminal/IDE** to reload permissions cache
3. **Run the test:**
   ```bash
   npm run test:e2e -- --spec ./e2e/features/open-file.feature
   ```

## Expected Test Flow

Once permissions are granted, the test will:
1. ✅ Show initial markdown document (`OPEN_FILE_INITIAL_FIXTURE`)
2. ✅ Click File → Open menu
3. ✅ Open dialog appears
4. ✅ AppleScript navigates to `e2e/fixtures/` directory
5. ✅ Select `open-dialog-target.md` file
6. ✅ App switches to target document (`OPEN_FILE_TARGET_FIXTURE`)
7. ✅ Test passes ✨

## Why AppleScript (osascript)?

The test uses AppleScript because it:
- **Deterministically** targets specific files by name (not screen coordinates)
- **Reliably** works with native macOS dialogs
- **Maintains** compatibility across macOS versions
- **Avoids** flaky mouse/keyboard simulation

See: `e2e/steps/open-file.steps.ts:35-102` for the implementation.

## References

- [E2E_MACOS_PERMISSIONS.md](E2E_MACOS_PERMISSIONS.md) - Full detailed guide
- [Apple Privacy & Security](https://support.apple.com/en-us/HT202491)
- [tccutil](https://www.dssw.co.uk/reference/tnctc.html) - Command-line tool for TCC management

## Still Having Issues?

See the **Troubleshooting** section in [E2E_MACOS_PERMISSIONS.md](E2E_MACOS_PERMISSIONS.md) for:
- Verifying permissions are actually granted
- Restarting Terminal/IDE properly
- Checking process names
- CI/automation environment setup

---

**TL;DR:** Grant accessibility to Terminal/IDE via System Settings or the setup script, restart Terminal, run tests.

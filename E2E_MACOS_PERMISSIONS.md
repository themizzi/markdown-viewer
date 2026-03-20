# macOS E2E Testing: AppleScript Accessibility Permissions

## Problem

The Open File e2e test uses AppleScript (`osascript`) to automate macOS native file dialogs. This requires accessibility permissions on macOS, which is a security feature protecting system-level UI automation.

When permissions are not granted, osascript fails with error `-2700` (not authorized):
```
Open File dialog did not appear within 10 seconds
execution error: Not authorized to send Apple events to System Events
```

## Root Cause

macOS requires explicit user consent before any application can:
- Interact with native system dialogs
- Control keyboard and mouse events
- Access UI elements in other applications

This is enforced through the **Transparency, Consent, and Control (TCC)** framework.

## Solution

The e2e test requires accessibility permissions for the process running `osascript`. Follow the appropriate solution for your environment:

### Option 1: Grant Full Disk Access (Easiest for Development)

1. **Open System Settings**
   - Go to: System Settings → Privacy & Security → Full Disk Access

2. **Add your Terminal/IDE**
   - Click the `+` button
   - Navigate to `/Applications/Utilities/Terminal.app` (or your IDE)
   - Click "Open"

3. **Verify permission is granted**
   - The app should now appear in the Full Disk Access list

4. **Restart your Terminal/IDE session**
   - Close and reopen Terminal or your IDE
   - Run the e2e tests again

**Why this works:** Full Disk Access includes accessibility permissions as a superset.

### Option 2: Grant Accessibility Permissions Only (Most Restrictive)

1. **Open System Settings**
   - Go to: System Settings → Privacy & Security → Accessibility

2. **Add your Terminal/IDE**
   - Click the `+` button
   - Navigate to `/Applications/Utilities/Terminal.app` (or your IDE)
   - Click "Open"

3. **Restart your Terminal/IDE session**

### Option 3: Using `tccutil` (For Automation/CI)

If you're setting up a CI environment or want to automate this:

```bash
# Grant accessibility to Terminal
sudo tccutil grant Accessibility /Applications/Utilities/Terminal.app

# Grant accessibility to specific IDE (example: VSCode)
sudo tccutil grant Accessibility /Applications/Visual\ Studio\ Code.app

# List current accessibility permissions
tccutil dump Accessibility
```

Note: This requires `sudo` and may prompt for your password.

### Option 4: Disable System Integrity Protection (Not Recommended)

This is mentioned for completeness but **should not be used** in normal development:
- Disabling SIP weakens system security
- It's intended only for kernel development, not application testing
- Granting specific permissions (Options 1-3) is always preferable

## Verification

After granting permissions, verify that osascript can access System Events:

```bash
osascript -e 'tell application "System Events" to get processes' 2>&1
```

You should see a list of running processes. If you get a permission error, the grant didn't work.

## Testing the Fix

Run the open-file e2e test:

```bash
npm run test:e2e -- --spec ./e2e/features/open-file.feature
```

Expected behavior:
1. App shows initial test markdown (`OPEN_FILE_INITIAL_FIXTURE`)
2. File Open menu is clicked
3. Open File dialog appears
4. AppleScript navigates to `e2e/fixtures/` directory
5. `open-dialog-target.md` is selected
6. App switches to target document (`OPEN_FILE_TARGET_FIXTURE`)

## Troubleshooting

### Still getting "Open File dialog did not appear"

**Check 1:** Verify permissions are actually granted
```bash
# View all accessibility grants
tccutil dump Accessibility

# Verify your Terminal/IDE is in the list
```

**Check 2:** Restart the Terminal/IDE
- Close all windows and reopen
- The system needs to reload permissions cache

**Check 3:** Check System Settings directly
- Go to: System Settings → Privacy & Security → Accessibility
- Look for your Terminal/IDE in the list
- If the toggle is OFF, click it to enable

**Check 4:** Check if Electron app process can be targeted
```bash
# While the markdown-viewer app is running:
osascript -e 'tell application "System Events" to get name of every process' | grep markdown
```

If you don't see `markdown-viewer` or `Electron`, the app might not be running or the process name might be different.

### Getting "not authorized to send Apple events"

This means AppleScript lacks the necessary permissions. Go back to System Settings and ensure the permission is granted and toggled ON.

### CI/Automation Environments

For GitHub Actions, GitLab CI, or other automated runners:

1. **macOS runners may not have UI access** - e2e tests might be skipped entirely
2. **Grant permissions via `tccutil` in the CI setup script:**
   ```bash
   sudo tccutil grant Accessibility /Applications/Utilities/Terminal.app
   ```
3. **Or skip e2e on non-macOS runners** - the test already has `@macos` tag for conditional execution

## Implementation Details

The e2e test uses AppleScript for these reasons:

- **Deterministic**: Uses file paths and filename entry, not screen coordinates
- **Reliable**: `System Events` is the macOS-standard way to automate native dialogs
- **Maintainable**: Script logic is readable and modifiable
- **Platform-appropriate**: Uses native macOS automation, not generic browser mocking

See `e2e/steps/open-file.steps.ts` lines 35-102 for the AppleScript implementation.

## References

- [Apple Security Frameworks](https://support.apple.com/en-us/HT202491)
- [Transparency, Consent, and Control (TCC)](https://www.dssw.co.uk/reference/tnctc.html)
- [macOS Accessibility API](https://developer.apple.com/accessibility/macos/)
- [osascript Man Page](https://ss64.com/osx/osascript.html)

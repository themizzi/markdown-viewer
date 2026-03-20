#!/bin/bash

# macOS E2E Test Permission Setup Script
# Grants accessibility permissions for e2e test automation
# This script helps set up the required permissions to run the open-file e2e test

set -e

echo "=========================================="
echo "macOS E2E Test Permission Setup"
echo "=========================================="
echo ""

# Detect current shell/terminal being used
CURRENT_SHELL=$(ps -o command= -p $$)
echo "Current shell: $CURRENT_SHELL"
echo ""

# Determine the app to grant permissions to
if [[ "$CURRENT_SHELL" == *"zsh"* ]]; then
    SHELL_APP="/bin/zsh"
    SHELL_NAME="Zsh"
elif [[ "$CURRENT_SHELL" == *"bash"* ]]; then
    SHELL_APP="/bin/bash"
    SHELL_NAME="Bash"
else
    SHELL_APP="/Applications/Utilities/Terminal.app"
    SHELL_NAME="Terminal"
fi

echo "Detected shell: $SHELL_NAME"
echo ""

# Check if running in an IDE
if [[ ! -z "$VSCODE_CWD" ]]; then
    TARGET_APP="/Applications/Visual Studio Code.app"
    APP_NAME="Visual Studio Code"
    echo "Detected IDE: VS Code"
elif [[ ! -z "$JETBRAINS_IDE_MPS_HOME" ]]; then
    TARGET_APP="/Applications/IntelliJ IDEA.app"
    APP_NAME="IntelliJ IDEA"
    echo "Detected IDE: IntelliJ IDEA"
else
    TARGET_APP="$SHELL_APP"
    APP_NAME="$SHELL_NAME"
fi

echo ""
echo "=========================================="
echo "Instructions for Manual Setup"
echo "=========================================="
echo ""
echo "1. Open System Settings"
echo "2. Go to: Privacy & Security → Accessibility"
echo "3. Click the '+' button"
echo "4. Find and select: $TARGET_APP"
echo "5. Click 'Open'"
echo "6. Verify it appears in the Accessibility list"
echo "7. Restart your Terminal/IDE"
echo "8. Run: npm run test:e2e -- --spec ./e2e/features/open-file.feature"
echo ""
echo "=========================================="
echo "Automatic Setup (Requires sudo)"
echo "=========================================="
echo ""

read -p "Would you like to grant accessibility permissions automatically? (requires sudo) (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Granting accessibility to $APP_NAME..."
    echo "You will be prompted for your password (sudo required)"
    echo ""
    
    # Use tccutil to grant permissions
    if command -v tccutil &> /dev/null; then
        sudo tccutil grant Accessibility "$TARGET_APP" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "✓ Successfully granted accessibility to $APP_NAME"
        else
            echo "✗ Failed to grant accessibility (tccutil not available or other error)"
            echo "Please grant permissions manually via System Settings"
        fi
    else
        echo "✗ tccutil not found - using manual System Settings method instead"
        echo "Please grant permissions manually via System Settings → Privacy & Security → Accessibility"
    fi
    
    echo ""
    echo "Verifying permissions..."
    if command -v tccutil &> /dev/null; then
        if tccutil dump Accessibility 2>/dev/null | grep -q "$TARGET_APP"; then
            echo "✓ Permissions verified successfully"
        else
            echo "✗ Permissions not verified - please check System Settings"
        fi
    fi
else
    echo "Skipped automatic setup. Please grant permissions manually via System Settings."
fi

echo ""
echo "=========================================="
echo "Next Steps"
echo "=========================================="
echo ""
echo "1. Close and reopen your Terminal/IDE to reload permissions"
echo "2. Run the e2e test:"
echo "   npm run test:e2e -- --spec ./e2e/features/open-file.feature"
echo ""
echo "For more information, see: E2E_MACOS_PERMISSIONS.md"
echo ""

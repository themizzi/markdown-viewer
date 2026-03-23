@macos @startup-no-args
Feature: Application startup without a file argument

  Scenario: Launching without startup args shows the Open File dialog
    Given the app is started with no file
    When the app launches without a startup file argument
    Then the standalone Open File dialog is present
    And the user dismisses the startup Open File dialog
    And the app remains open with no browser window

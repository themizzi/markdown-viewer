Feature: Open file dialog

  @macos @linux
  Scenario: File Open loads the selected markdown file into the current window
    Given the app is showing the initial test markdown document
    When the user clicks File Open
    And the user selects the deterministic target file in the Open File dialog
    Then the app shows the selected markdown document

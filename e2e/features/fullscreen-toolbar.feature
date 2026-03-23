@fullscreen
Feature: Fullscreen toolbar positioning on macOS

  Scenario: Toolbar button moves to left edge in fullscreen mode
    Given the app is started with the file "test.md"
    And the app is running on macOS
    When I enter fullscreen mode
    Then the toolbar button should move to the left edge of the window
    And there should be no visible gap between the button and the window edge

  Scenario: Toolbar button returns to normal position when exiting fullscreen
    Given the app is started with the file "test.md"
    And the app is in fullscreen mode on macOS
    When I exit fullscreen mode
    Then the toolbar button should return to its original position
    And there should be a gap accounting for the stoplight buttons

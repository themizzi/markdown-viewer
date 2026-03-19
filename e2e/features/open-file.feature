@macos
Feature: Open file dialog

  Scenario: File Open shows the native open dialog
    When the user clicks File Open
    And the user clicks Cancel on the Open File dialog
    Then the Open File dialog is not present


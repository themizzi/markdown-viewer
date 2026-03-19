@linux
Feature: Open file dialog on Linux

  Scenario: File Open shows the native open dialog in the Docker container
    When the user clicks File Open
    And the user dismisses the Open File dialog on Linux
    Then the Open File dialog is not present on Linux

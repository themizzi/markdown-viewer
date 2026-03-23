Feature: Relative image rendering

  Scenario: Application resolves image paths relative to the opened markdown file
    Given the app is started with the file "test.md"
    When the markdown file contains a relative image reference
    Then the relative image should be displayed
    And the image source should resolve from the markdown file directory

Feature: Relative image rendering

  Scenario: Application resolves image paths relative to the opened markdown file
    Given the markdown viewer application is running
    When the markdown file contains a relative image reference
    Then the relative image should be displayed
    And the image source should resolve from the markdown file directory

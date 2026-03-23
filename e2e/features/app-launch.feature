Feature: Application startup with a file argument

  Scenario: Launching with a startup file argument opens that file
    Given the app is started with the file "test.md"
    When the app launches with the startup file argument
    Then the user should see the markdown rendered as HTML
    And the heading "Test Markdown" should be visible
    And the bold text "test" should be visible
    And the list items "Item 1" and "Item 2" should be visible
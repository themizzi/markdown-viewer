Feature: Markdown Viewer Application

  Scenario: Application launches and displays markdown content
    Given the markdown viewer application is running
    When the page loads
    Then the user should see the markdown rendered as HTML
    And the heading "Test Markdown" should be visible
    And the bold text "test" should be visible
    And the list items "Item 1" and "Item 2" should be visible
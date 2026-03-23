Feature: File Watching After Replace

  Scenario: View updates when markdown file is replaced
    Given the app is started with the file "test.md"
    When the markdown file is replaced with new content
    Then the user should see the new content within 5 seconds

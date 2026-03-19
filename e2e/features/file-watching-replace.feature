Feature: File Watching After Replace

  Scenario: View updates when markdown file is replaced
    Given the markdown viewer application is running
    When the markdown file is replaced with new content
    Then the user should see the new content within 5 seconds

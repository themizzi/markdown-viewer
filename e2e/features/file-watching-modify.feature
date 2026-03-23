Feature: File Watching After Edit

  Scenario: View updates when markdown file is modified
    Given the app is started with the file "test.md"
    And the user sees the heading "Test Markdown"
    When the markdown file is modified to contain "Updated Content"
    Then the user should see the heading "Updated Content" within 5 seconds

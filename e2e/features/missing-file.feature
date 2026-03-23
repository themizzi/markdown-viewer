Feature: Error Handling

  Scenario: Application handles a deleted markdown file gracefully
    Given the app is started with the file "test.md"
    When the markdown file is deleted
    Then the user should see an error message indicating the file was not found

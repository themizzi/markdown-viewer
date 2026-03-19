Feature: Error Handling

  Scenario: Application handles a deleted markdown file gracefully
    Given the markdown viewer application is running
    When the markdown file is deleted
    Then the user should see an error message indicating the file was not found

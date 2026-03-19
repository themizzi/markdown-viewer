Feature: Open file menu

  Scenario: The File menu includes Open
    Given the markdown viewer application is running
    When the user opens the File menu
    Then the File menu should include Open


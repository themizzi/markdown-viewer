Feature: Table of contents sidebar visibility

  Scenario: The initial View menu item shows that the table of contents sidebar is hidden
    Given the app is showing the initial test markdown document
    Then the table of contents sidebar is hidden
    And the View menu item for table of contents is unchecked

  Scenario: Clicking the toolbar button when the sidebar is hidden shows the sidebar
    Given the app is showing the initial test markdown document
    And the table of contents sidebar is hidden
    When the user clicks the title bar table of contents toggle button
    Then the table of contents sidebar is visible

  Scenario: Clicking the toolbar button when the sidebar is visible hides the sidebar
    Given the app is showing the initial test markdown document
    And the table of contents sidebar is visible
    When the user clicks the title bar table of contents toggle button
    Then the table of contents sidebar is hidden

  Scenario: Clicking the View menu item when the sidebar is hidden shows the sidebar
    Given the app is showing the initial test markdown document
    And the table of contents sidebar is hidden
    When the user chooses View Show Table of Contents
    Then the table of contents sidebar is visible

  Scenario: Clicking the View menu item when the sidebar is visible hides the sidebar
    Given the app is showing the initial test markdown document
    And the table of contents sidebar is visible
    When the user chooses View Show Table of Contents
    Then the table of contents sidebar is hidden

  Scenario: Clicking the toolbar button when the sidebar is hidden checks the View menu item
    Given the app is showing the initial test markdown document
    And the table of contents sidebar is hidden
    When the user clicks the title bar table of contents toggle button
    Then the View menu item for table of contents is checked

  Scenario: Clicking the toolbar button when the sidebar is visible unchecks the View menu item
    Given the app is showing the initial test markdown document
    And the table of contents sidebar is visible
    When the user clicks the title bar table of contents toggle button
    Then the View menu item for table of contents is unchecked

  Scenario: Clicking the View menu item when the sidebar is hidden leaves the View menu item checked
    Given the app is showing the initial test markdown document
    And the table of contents sidebar is hidden
    When the user chooses View Show Table of Contents
    Then the View menu item for table of contents is checked

  Scenario: Clicking the View menu item when the sidebar is visible leaves the View menu item unchecked
    Given the app is showing the initial test markdown document
    And the table of contents sidebar is visible
    When the user chooses View Show Table of Contents
    Then the View menu item for table of contents is unchecked

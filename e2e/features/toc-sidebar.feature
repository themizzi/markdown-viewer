Feature: Table of contents sidebar visibility

  Scenario: The initial View menu item shows that the table of contents sidebar is hidden
    Given the app is started with the file "test.md"
    Then the table of contents sidebar should be hidden
    And the View menu item for table of contents is unchecked

  Scenario Outline: Toggling the sidebar visibility with the toolbar button
    Given the app is started with the file "test.md"
    And the table of contents sidebar is <initial_visibility>
    When the user clicks the title bar table of contents toggle button
    Then the table of contents sidebar should be <final_visibility>

    Examples:
      | initial_visibility | final_visibility |
      | hidden             | visible          |
      | visible            | hidden           |

  Scenario Outline: Toggling the sidebar visibility with the View menu
    Given the app is started with the file "test.md"
    And the table of contents sidebar is <initial_visibility>
    When the user chooses View Show Table of Contents
    Then the table of contents sidebar should be <final_visibility>

    Examples:
      | initial_visibility | final_visibility |
      | hidden             | visible          |
      | visible            | hidden           |

  Scenario Outline: Toolbar button toggle updates the View menu checked state
    Given the app is started with the file "test.md"
    And the table of contents sidebar is <initial_visibility>
    When the user clicks the title bar table of contents toggle button
    Then the View menu item for table of contents is <final_menu_state>

    Examples:
      | initial_visibility | final_menu_state |
      | hidden             | checked          |
      | visible            | unchecked        |

  Scenario Outline: View menu toggle reflects in the View menu checked state
    Given the app is started with the file "test.md"
    And the table of contents sidebar is <initial_visibility>
    When the user chooses View Show Table of Contents
    Then the View menu item for table of contents is <final_menu_state>

    Examples:
      | initial_visibility | final_menu_state |
      | hidden             | checked          |
      | visible            | unchecked        |

  Scenario: Sidebar displays TOC heading from markdown
    Given the app is started with the file "toc-test.md"
    And the table of contents sidebar is visible
    Then the table of contents should contain "TOC Test Document"

  Scenario: Sidebar displays all heading levels
    Given the app is started with the file "toc-test.md"
    And the table of contents sidebar is visible
    Then the table of contents should contain "TOC Test Document"
    And the table of contents should contain "First Heading"
    And the table of contents should contain "Second Heading"

  Scenario: Clicking TOC item scrolls to heading
    Given the app is started with the file "toc-test.md"
    And the table of contents sidebar is visible
    When the user clicks the TOC link for "First Heading"
    Then a heading should be visible

  Scenario: TOC updates when markdown file is modified
    Given the app is started with the file "toc-test.md"
    And the table of contents sidebar is visible
    When the markdown file "toc-test.md" is modified to add a new heading "Live TOC Auto-Refresh"
    Then the table of contents should contain "Live TOC Auto-Refresh"

  Scenario: Toolbar button tooltip shows keyboard shortcut
    Given the app is started with the file "test.md"
    When the user hovers over the table of contents toggle button
    Then the tooltip should contain "F6"

  Scenario: Pressing F6 opens the table of contents sidebar
    Given the app is started with the file "test.md"
    And the table of contents sidebar is hidden
    When the user presses F6
    Then the table of contents sidebar should be visible

  Scenario: Pressing F6 hides the table of contents sidebar
    Given the app is started with the file "test.md"
    And the table of contents sidebar is visible
    When the user presses F6
    Then the table of contents sidebar should be hidden

Feature: Table of contents sidebar visibility

  Scenario: The initial View menu item shows that the table of contents sidebar is hidden
    Given the app is showing the initial test markdown document
    Then the table of contents sidebar should be hidden
    And the View menu item for table of contents is unchecked

  Scenario Outline: Toggling the sidebar visibility with the toolbar button
    Given the app is showing the initial test markdown document
    And the table of contents sidebar is <initial_visibility>
    When the user clicks the title bar table of contents toggle button
    Then the table of contents sidebar should be <final_visibility>

    Examples:
      | initial_visibility | final_visibility |
      | hidden             | visible          |
      | visible            | hidden           |

  Scenario Outline: Toggling the sidebar visibility with the View menu
    Given the app is showing the initial test markdown document
    And the table of contents sidebar is <initial_visibility>
    When the user chooses View Show Table of Contents
    Then the table of contents sidebar should be <final_visibility>

    Examples:
      | initial_visibility | final_visibility |
      | hidden             | visible          |
      | visible            | hidden           |

  Scenario Outline: Toolbar button toggle updates the View menu checked state
    Given the app is showing the initial test markdown document
    And the table of contents sidebar is <initial_visibility>
    When the user clicks the title bar table of contents toggle button
    Then the View menu item for table of contents is <final_menu_state>

    Examples:
      | initial_visibility | final_menu_state |
      | hidden             | checked          |
      | visible            | unchecked        |

  Scenario Outline: View menu toggle reflects in the View menu checked state
    Given the app is showing the initial test markdown document
    And the table of contents sidebar is <initial_visibility>
    When the user chooses View Show Table of Contents
    Then the View menu item for table of contents is <final_menu_state>

    Examples:
      | initial_visibility | final_menu_state |
      | hidden             | checked          |
      | visible            | unchecked        |

  Scenario: Sidebar shows empty message when markdown has no headings
    Given the app is showing the initial test markdown document
    And the table of contents sidebar is visible
    Then the table of contents sidebar should show "No table of contents available."

  Scenario: Sidebar displays all heading levels from markdown
    Given the app is showing the "toc-test.md" markdown document
    And the table of contents sidebar is visible
    Then the table of contents should contain "TOC Test Document"
    And the table of contents should contain "First Heading"
    And the table of contents should contain "Second Heading"
    And the table of contents should contain "Third Heading"
    And the table of contents should contain "Nested Heading"
    And the table of contents should contain "Level 3"
    And the table of contents should contain "Level 4"

  Scenario: Clicking TOC item scrolls to heading
    Given the app is showing the "toc-test.md" markdown document
    And the table of contents sidebar is visible
    When the user clicks the TOC link for "First Heading"
    Then the "First Heading" heading should be visible

  Scenario: TOC updates when markdown file is modified
    Given the app is showing the "toc-test.md" markdown document
    And the table of contents sidebar is visible
    When the markdown file "toc-test.md" is modified to add a new heading "New Heading"
    Then the table of contents should contain "New Heading"

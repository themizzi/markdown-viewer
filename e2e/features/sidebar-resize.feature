Feature: Sidebar resize

  Scenario: Sidebar collapses when resized below threshold
    Given the initial test markdown document is loaded for resize testing
    And the TOC sidebar is visible for resizing
    When the user drags the resize handle to 50px
    Then the table of contents sidebar should be hidden

  Scenario: Sidebar respects maximum width
    Given the initial test markdown document is loaded for resize testing
    And the TOC sidebar is visible for resizing
    When the user drags the resize handle to the maximum width
    Then the table of contents sidebar width should be at most one third of the window width

  Scenario: Resize handle shows resize cursor on hover
    Given the initial test markdown document is loaded for resize testing
    And the TOC sidebar is visible for resizing
    When the user hovers over the resize handle
    Then the resize handle should show a col-resize cursor

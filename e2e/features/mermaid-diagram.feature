Feature: Mermaid Diagram Rendering

  Scenario: Mermaid code blocks render as diagrams
    Given the markdown viewer application is running
    When the markdown file contains a mermaid code block
    Then the user should see a rendered mermaid diagram
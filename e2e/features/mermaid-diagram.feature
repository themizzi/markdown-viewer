Feature: Mermaid Diagram Rendering

  Scenario: Mermaid code blocks render as diagrams
    Given the app is started with the file "test.md"
    When the markdown file contains a mermaid code block
    Then the user should see a rendered mermaid diagram
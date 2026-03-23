Feature: Syntax highlighting

  Scenario: Code blocks are syntax highlighted
    Given the app is started with the file "test.md"
    When the markdown file contains a code block with a language
    Then the code block should have syntax highlighting classes

  Scenario: Mermaid code blocks are not highlighted
    Given the app is started with the file "test.md"
    When the markdown file contains only a mermaid code block and no other code
    Then the mermaid code block should not have syntax highlighting classes
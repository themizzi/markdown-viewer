import hljs from 'highlight.js';

export interface SyntaxHighlighter {
  highlight(code: string, language?: string): string;
  highlightAuto(code: string): string;
}

export function createSyntaxHighlighter(): SyntaxHighlighter {
  return {
    highlight(code: string, language?: string): string {
      if (language && hljs.getLanguage(language)) {
        return hljs.highlight(code, { language }).value;
      }
      return hljs.highlightAuto(code).value;
    },
    highlightAuto(code: string): string {
      return hljs.highlightAuto(code).value;
    }
  };
}
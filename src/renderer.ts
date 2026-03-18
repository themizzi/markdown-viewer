export {};

declare global {
  interface Window {
    viewerApi: {
      getHtml: () => Promise<string>;
      onHtmlUpdated: (handler: (html: string) => void) => () => void;
    };
    mermaid: {
      initialize: (config: Record<string, unknown>) => void;
      run: (options?: Record<string, unknown>) => Promise<void> | void;
    };
  }
}

const root = document.getElementById("app");

if (!root) {
  throw new Error("Missing #app element");
}

const rootElement = root as HTMLElement;

window.mermaid.initialize({
  startOnLoad: false,
  securityLevel: "strict",
  theme: "default"
});

function hydrateMermaid(container: HTMLElement): void {
  const codeBlocks = container.querySelectorAll("pre > code.language-mermaid");

  codeBlocks.forEach((code) => {
    const pre = code.parentElement;
    if (!pre) return;

    const div = document.createElement("div");
    div.className = "mermaid";
    div.textContent = code.textContent ?? "";
    pre.replaceWith(div);
  });
}

async function render(html: string): Promise<void> {
  rootElement.innerHTML = html;
  hydrateMermaid(rootElement);
  await Promise.resolve(window.mermaid.run({ querySelector: ".mermaid" }));
}

async function bootstrap(): Promise<void> {
  const initialHtml = await window.viewerApi.getHtml();
  await render(initialHtml);

  window.viewerApi.onHtmlUpdated((nextHtml: string) => {
    void render(nextHtml);
  });
}

void bootstrap();
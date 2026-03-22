export class SidebarResize {
  private readonly sidebar: HTMLElement;
  private readonly resizeHandle: HTMLElement;
  private readonly onCollapse: (collapsed: boolean) => void;
  private isEnabled = false;
  private isCollapsed = false;
  private isDragging = false;
  private dragStartX = 0;
  private dragStartWidth = 0;
  private readonly boundMouseMove: (e: MouseEvent) => void;
  private readonly boundMouseUp: () => void;

  constructor(
    sidebar: HTMLElement,
    resizeHandle: HTMLElement,
    onCollapse: (collapsed: boolean) => void
  ) {
    this.sidebar = sidebar;
    this.resizeHandle = resizeHandle;
    this.onCollapse = onCollapse;
    this.boundMouseMove = this.handleMouseMove;
    this.boundMouseUp = this.handleMouseUp;
  }

  enable(): void {
    if (this.isEnabled) return;
    this.isEnabled = true;
    this.resizeHandle.addEventListener("mousedown", this.handleMouseDown);
  }

  disable(): void {
    if (!this.isEnabled) return;
    this.isEnabled = false;
    this.resizeHandle.removeEventListener("mousedown", this.handleMouseDown);
    this.stopDragging();
  }

  getWidth(): number {
    const inlineWidth = Number.parseFloat(this.sidebar.style.width);
    if (Number.isFinite(inlineWidth) && inlineWidth > 0) {
      return inlineWidth;
    }
    return this.sidebar.getBoundingClientRect().width;
  }

  setWidth(width: number): void {
    const constrainedWidth = this.constrainWidth(width);
    this.sidebar.style.width = `${constrainedWidth}px`;

    if (this.shouldCollapse(width) && !this.isCollapsed) {
      this.isCollapsed = true;
      this.onCollapse(true);
    } else if (!this.shouldCollapse(width) && this.isCollapsed) {
      this.isCollapsed = false;
      this.onCollapse(false);
    }
  }

  getMinWidth(): number {
    return 120;
  }

  getMaxWidth(): number {
    return window.innerWidth / 3;
  }

  shouldCollapse(width: number): boolean {
    return width < this.getMinWidth();
  }

  private constrainWidth(width: number): number {
    return Math.max(this.getMinWidth(), Math.min(width, this.getMaxWidth()));
  }

  private handleMouseDown = (event: MouseEvent): void => {
    if (event.button !== 0) return;

    event.preventDefault();
    event.stopPropagation();

    this.isDragging = true;
    this.dragStartX = event.clientX;
    this.dragStartWidth = this.getWidth();

    this.resizeHandle.classList.add("dragging");
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    window.addEventListener("mousemove", this.boundMouseMove);
    window.addEventListener("mouseup", this.boundMouseUp);
  };

  private handleMouseMove = (event: MouseEvent): void => {
    if (!this.isDragging) return;
    const delta = event.clientX - this.dragStartX;
    this.setWidth(this.dragStartWidth + delta);
  };

  private handleMouseUp = (): void => {
    this.stopDragging();
  };

  private stopDragging(): void {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.resizeHandle.classList.remove("dragging");
    document.body.style.cursor = "";
    document.body.style.userSelect = "";

    window.removeEventListener("mousemove", this.boundMouseMove);
    window.removeEventListener("mouseup", this.boundMouseUp);
  }
}

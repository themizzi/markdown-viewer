export type VisibilityChangeHandler = (visible: boolean) => void;

export class SidebarVisibility {
  private visible: boolean = false;
  private changeHandlers: VisibilityChangeHandler[] = [];

  toggle(): void {
    this.setVisible(!this.visible);
  }

  setVisible(visible: boolean): void {
    if (this.visible !== visible) {
      this.visible = visible;
      this.notifySubscribers();
    }
  }

  getCurrentVisibility(): boolean {
    return this.visible;
  }

  onVisibilityChange(handler: VisibilityChangeHandler): void {
    this.changeHandlers.push(handler);
  }

  private notifySubscribers(): void {
    this.changeHandlers.forEach((handler) => handler(this.visible));
  }
}

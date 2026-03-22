import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SidebarResize } from './sidebarResize';

describe('SidebarResize', () => {
  let sidebar: HTMLElement;
  let resizeHandle: HTMLElement;
  let onCollapse: (collapsed: boolean) => void;

  beforeEach(() => {
    document.body.innerHTML = '';

    sidebar = document.createElement('div');
    sidebar.style.width = '240px';
    document.body.appendChild(sidebar);

    resizeHandle = document.createElement('div');
    document.body.appendChild(resizeHandle);

    onCollapse = vi.fn();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('getMinWidth', () => {
    it('should return 120', () => {
      const resize = new SidebarResize(sidebar, resizeHandle, onCollapse);
      expect(resize.getMinWidth()).toBe(120);
    });
  });

  describe('getMaxWidth', () => {
    it('should return window width divided by 3', () => {
      const resize = new SidebarResize(sidebar, resizeHandle, onCollapse);
      const expectedMaxWidth = window.innerWidth / 3;
      expect(resize.getMaxWidth()).toBe(expectedMaxWidth);
    });
  });

  describe('shouldCollapse', () => {
    it('should return true when width is less than 120', () => {
      const resize = new SidebarResize(sidebar, resizeHandle, onCollapse);
      expect(resize.shouldCollapse(119)).toBe(true);
      expect(resize.shouldCollapse(50)).toBe(true);
      expect(resize.shouldCollapse(0)).toBe(true);
    });

    it('should return false when width is >= 120', () => {
      const resize = new SidebarResize(sidebar, resizeHandle, onCollapse);
      expect(resize.shouldCollapse(120)).toBe(false);
      expect(resize.shouldCollapse(200)).toBe(false);
      expect(resize.shouldCollapse(240)).toBe(false);
    });
  });

  describe('Maximum width constraint', () => {
    it('should return window.innerWidth / 3 for getMaxWidth()', () => {
      const resize = new SidebarResize(sidebar, resizeHandle, onCollapse);
      expect(resize.getMaxWidth()).toBe(window.innerWidth / 3);
    });

    it('should clamp width to max when width > getMaxWidth()', () => {
      const resize = new SidebarResize(sidebar, resizeHandle, onCollapse);
      const maxWidth = resize.getMaxWidth();
      const tooWide = maxWidth + 500;
      
      resize.setWidth(tooWide);
      
      const actualWidth = parseFloat(sidebar.style.width);
      expect(actualWidth).toBeLessThanOrEqual(maxWidth);
      expect(actualWidth).toBeGreaterThanOrEqual(maxWidth - 1);
    });

    it('should constrain width to minWidth when width < minWidth', () => {
      const resize = new SidebarResize(sidebar, resizeHandle, onCollapse);
      const minWidth = resize.getMinWidth();
      
      resize.setWidth(50);
      
      const actualWidth = parseFloat(sidebar.style.width);
      expect(actualWidth).toBeGreaterThanOrEqual(minWidth - 1);
      expect(actualWidth).toBeLessThanOrEqual(minWidth + 1);
    });

    it('should constrain width to getMaxWidth() when width > getMaxWidth()', () => {
      const resize = new SidebarResize(sidebar, resizeHandle, onCollapse);
      const maxWidth = resize.getMaxWidth();
      
      resize.setWidth(maxWidth + 1000);
      
      const actualWidth = parseFloat(sidebar.style.width);
      expect(actualWidth).toBeLessThanOrEqual(maxWidth);
      expect(actualWidth).toBeGreaterThanOrEqual(maxWidth - 1);
    });
  });
});

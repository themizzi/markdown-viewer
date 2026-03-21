import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dialog } from 'electron';

// Mock dialog module
vi.mock('electron', async () => {
  const actual = await vi.importActual('electron');
  return {
    ...actual,
    dialog: {
      showOpenDialog: vi.fn().mockResolvedValue({ canceled: true, filePaths: [] })
    }
  };
});

describe('openFileDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows open dialog with markdown file filters', async () => {
    const { showOpenFileDialog } = await import('./openFileDialog');

    await showOpenFileDialog();

    expect(dialog.showOpenDialog).toHaveBeenCalledWith({
      properties: ['openFile'],
      filters: [
        { name: 'Markdown', extensions: ['md', 'markdown', 'mdown', 'mkd', 'mkdn'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
  });

  it('returns the dialog result', async () => {
    const mockResult = { canceled: false, filePaths: ['/path/to/file.md'] };
    vi.mocked(dialog.showOpenDialog).mockResolvedValueOnce(mockResult);

    const { showOpenFileDialog } = await import('./openFileDialog');

    const result = await showOpenFileDialog();

    expect(result).toEqual(mockResult);
  });

  it('accepts a deterministic defaultPath input and forwards it to dialog.showOpenDialog', async () => {
    // GIVEN
    const defaultPath = '/home/user/documents';
    const mockResult = { canceled: true, filePaths: [] };
    vi.mocked(dialog.showOpenDialog).mockResolvedValueOnce(mockResult);

    // WHEN
    const { showOpenFileDialog } = await import('./openFileDialog');
    const result = await showOpenFileDialog(defaultPath);

    // THEN
    expect(dialog.showOpenDialog).toHaveBeenCalledWith({
      defaultPath: '/home/user/documents',
      properties: ['openFile'],
      filters: [
        { name: 'Markdown', extensions: ['md', 'markdown', 'mdown', 'mkd', 'mkdn'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    expect(result).toEqual(mockResult);
  });

  it('maintains filter order: markdown filters followed by all-files filter', async () => {
    // GIVEN
    const { showOpenFileDialog } = await import('./openFileDialog');

    // WHEN
    await showOpenFileDialog();

    // THEN
    const callOptions = vi.mocked(dialog.showOpenDialog).mock.calls[0][0];
    expect(callOptions.filters).toHaveLength(2);
    expect(callOptions.filters?.[0]).toEqual({
      name: 'Markdown',
      extensions: ['md', 'markdown', 'mdown', 'mkd', 'mkdn']
    });
    expect(callOptions.filters?.[1]).toEqual({
      name: 'All Files',
      extensions: ['*']
    });
  });

  it('returns the selected path payload unchanged', async () => {
    // GIVEN
    const selectedPath = '/home/user/documents/sample.md';
    const mockResult = { canceled: false, filePaths: [selectedPath] };
    vi.mocked(dialog.showOpenDialog).mockResolvedValueOnce(mockResult);

    // WHEN
    const { showOpenFileDialog } = await import('./openFileDialog');
    const result = await showOpenFileDialog();

    // THEN
    expect(result.filePaths).toEqual([selectedPath]);
    expect(result.canceled).toBe(false);
  });
});

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

  it('calls dialog.showOpenDialog with correct options', async () => {
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

  it('does not pass a window argument', async () => {
    const { showOpenFileDialog } = await import('./openFileDialog');

    await showOpenFileDialog();

    // Verify only one argument passed (options object, no window)
    expect(dialog.showOpenDialog).toHaveBeenCalledTimes(1);
    const callArgs = vi.mocked(dialog.showOpenDialog).mock.calls[0];
    expect(callArgs.length).toBe(1);
    expect(typeof callArgs[0]).toBe('object'); // options only
  });

  it('returns the dialog result', async () => {
    const mockResult = { canceled: false, filePaths: ['/path/to/file.md'] };
    vi.mocked(dialog.showOpenDialog).mockResolvedValueOnce(mockResult);

    const { showOpenFileDialog } = await import('./openFileDialog');

    const result = await showOpenFileDialog();

    expect(result).toEqual(mockResult);
  });
});

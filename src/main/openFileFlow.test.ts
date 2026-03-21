import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('openFileFlow', () => {
  let getCurrentFilePath: () => string;
  let showOpenFileDialog: (defaultPath?: string) => Promise<{ canceled: boolean; filePaths: string[] }>;
  let switchFile: (filePath: string) => Promise<void>;

  beforeEach(() => {
    // Setup mock functions that will be injected into openFileFlow
    getCurrentFilePath = vi.fn(() => '/current/file.md');
    showOpenFileDialog = vi.fn();
    switchFile = vi.fn();
  });

  it('canceling the dialog is a no-op: the current document remains unchanged and no controller switch method is called', async () => {
    // GIVEN
    const mockDialogResult = { canceled: true, filePaths: [] };
    vi.mocked(showOpenFileDialog).mockResolvedValueOnce(mockDialogResult);

    const { openFileFlow } = await import('./openFileFlow');

    // WHEN
    await openFileFlow(getCurrentFilePath, showOpenFileDialog, switchFile);

    // THEN
    expect(switchFile).not.toHaveBeenCalled();
  });

  it('selecting a path calls the controller switch method with the selected file', async () => {
    // GIVEN
    const selectedPath = '/new/file.md';
    const mockDialogResult = { canceled: false, filePaths: [selectedPath] };
    vi.mocked(showOpenFileDialog).mockResolvedValueOnce(mockDialogResult);

    const { openFileFlow } = await import('./openFileFlow');

    // WHEN
    await openFileFlow(getCurrentFilePath, showOpenFileDialog, switchFile);

    // THEN
    expect(switchFile).toHaveBeenCalledWith(selectedPath);
    expect(switchFile).toHaveBeenCalledTimes(1);
  });

  it('passes the current active file path into showOpenFileDialog as defaultPath', async () => {
    // GIVEN
    const currentPath = '/current/documents/file.md';
    vi.mocked(getCurrentFilePath).mockReturnValueOnce(currentPath);
    const mockDialogResult = { canceled: true, filePaths: [] };
    vi.mocked(showOpenFileDialog).mockResolvedValueOnce(mockDialogResult);

    const { openFileFlow } = await import('./openFileFlow');

    // WHEN
    await openFileFlow(getCurrentFilePath, showOpenFileDialog, switchFile);

     // THEN
    expect(showOpenFileDialog).toHaveBeenCalledWith(currentPath);
  });

  it('dialog errors surface to the caller so the existing main.ts error logging path still works', async () => {
    // GIVEN
    const dialogError = new Error('Dialog failed to open');
    vi.mocked(showOpenFileDialog).mockRejectedValueOnce(dialogError);

    const { openFileFlow } = await import('./openFileFlow');

    // WHEN & THEN
    await expect(openFileFlow(getCurrentFilePath, showOpenFileDialog, switchFile)).rejects.toThrow(dialogError);
  });
});

import { renderHook, act, waitFor } from '@testing-library/react';
import useFindWord from '../useFindWord';

describe('useFindWord', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      text: () => Promise.resolve('CAT\nDOG\nAPPLE'),
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should generate the hook without crashing', () => {
    const { result } = renderHook(() => useFindWord('CAT', '', true));
    expect(result.current).toBeDefined();
    expect(typeof result.current.clearFindWord).toBe('function');
  });

  describe('when isPlaying is false', () => {
    it('should not set loading or fetch dictionary', () => {
      const { result } = renderHook(() => useFindWord('CAT', '', false));
      expect(result.current.loading).toBe(false);
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('when isPlaying is true', () => {
    it('should find the best word from the rack', async () => {
      const { result } = renderHook(() => useFindWord('CAT', '', true));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.bestWord).toBe('CAT');
      expect(result.current.score).toBeGreaterThanOrEqual(0);
      expect(result.current.error).toBeNull();
    });

    it('should return error if no valid word is found', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        text: () => Promise.resolve('DOG\nAPPLE'),
      });
      const { result } = renderHook(() => useFindWord('ZZZ', '', true));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.bestWord).toBeNull();
      expect(result.current.error).toBe('No valid word found');
    });

    it('should handle fetch failure', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('fail'));
      const { result } = renderHook(() => useFindWord('CAT', '', true));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBe('Failed to load dictionary');
    });
  });

  describe('clearFindWord', () => {
    it('should reset the state', async () => {
      const { result } = renderHook(() => useFindWord('CAT', '', true));
      await waitFor(() => expect(result.current.loading).toBe(false));
      act(() => {
        result.current.clearFindWord();
      });
      expect(result.current.bestWord).toBeNull();
      expect(result.current.score).toBe(-1);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
});


import { renderHook, act } from '@testing-library/react';
import useValidation from '../useValidation';

describe('useValidation', () => {
  it('should generate the hook without crashing', () => {
    const { result } = renderHook(() => useValidation('CAT', '', true));
    expect(result.current).toBeDefined();
    expect(typeof result.current.clearValidation).toBe('function');
  });

  describe('when isPlaying is false', () => {
    it('should not validate or set errors', () => {
      const { result } = renderHook(() => useValidation('CAT', '', false));
      expect(result.current.isValid).toBeNull();
      expect(result.current.validationError).toBeNull();
    });
  });

  describe('validation logic', () => {
    it('should invalidate rack with numbers', () => {
      const { result } = renderHook(() => useValidation('C4T', '', true));
      expect(result.current.isValid).toBe(false);
      expect(result.current.validationError?.rack.length).toBeGreaterThan(0);
    });

    it('should invalidate word with numbers', () => {
      const { result } = renderHook(() => useValidation('CAT', 'D0G', true));
      expect(result.current.isValid).toBe(false);
      expect(result.current.validationError?.word.length).toBeGreaterThan(0);
    });

    it('should invalidate rack length < 1', () => {
      const { result } = renderHook(() => useValidation('', '', true));
      expect(result.current.isValid).toBe(false);
      expect(result.current.validationError?.rack.length).toBeGreaterThan(0);
    });

    it('should invalidate rack length > 7', () => {
      const { result } = renderHook(() => useValidation('ABCDEFGH', '', true));
      expect(result.current.isValid).toBe(false);
      expect(result.current.validationError?.rack.length).toBeGreaterThan(0);
    });

    it('should invalidate if more tiles are used than available', () => {
      // 'A' only has 2 tiles in letter_data.json
      const { result } = renderHook(() => useValidation('AAAA', 'AA', true));
      expect(result.current.isValid).toBe(false);
      expect(result.current.validationError?.game.length).toBeGreaterThan(0);
    });

    it('should validate a correct rack and word', () => {
      const { result } = renderHook(() => useValidation('CAT', 'DOG', true));
      expect(result.current.isValid).toBe(true);
      // Accept either null or an object with all empty arrays
      const err = result.current.validationError;
      const isEmptyErrorObj = err && Object.values(err).every(arr => Array.isArray(arr) && arr.length === 0);
      expect(err === null || isEmptyErrorObj).toBe(true);
    });
  });

  describe('clearValidation', () => {
    it('should reset the state', () => {
      const { result } = renderHook(() => useValidation('C4T', '', true));
      act(() => {
        result.current.clearValidation();
      });
      expect(result.current.isValid).toBeNull();
      expect(result.current.validationError).toBeNull();
    });
  });
});

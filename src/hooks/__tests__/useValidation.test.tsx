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
      expect(result.current.validationError?.field).toBe('rack');
    });

    it('should invalidate word with numbers', () => {
      const { result } = renderHook(() => useValidation('CAT', 'D0G', true));
      expect(result.current.isValid).toBe(false);
      expect(result.current.validationError?.field).toBe('word');
    });

    it('should invalidate rack length < 1', () => {
      const { result } = renderHook(() => useValidation('', '', true));
      expect(result.current.isValid).toBe(false);
      expect(result.current.validationError?.field).toBe('rack');
    });

    it('should invalidate rack length > 7', () => {
      const { result } = renderHook(() => useValidation('ABCDEFGH', '', true));
      expect(result.current.isValid).toBe(false);
      expect(result.current.validationError?.field).toBe('rack');
    });

    it('should invalidate if more tiles are used than available', () => {
      // 'A' only has 2 tiles in letter_data.json
      const { result } = renderHook(() => useValidation('AAAA', 'AA', true));
      expect(result.current.isValid).toBe(false);
      expect(result.current.validationError?.field).toBe('game');
    });

    it('should validate a correct rack and word', () => {
      const { result } = renderHook(() => useValidation('CAT', 'DOG', true));
      expect(result.current.isValid).toBe(true);
      expect(result.current.validationError).toBeNull();
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

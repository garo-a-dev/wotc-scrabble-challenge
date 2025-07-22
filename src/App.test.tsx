import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock the custom hooks
jest.mock('./hooks/useFindWord', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    bestWord: null,
    score: -1,
    loading: false,
    error: null,
    clearFindWord: jest.fn(),
  })),
}));

jest.mock('./hooks/useValidation', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    isValid: null,
    validationError: null,
    clearValidation: jest.fn(),
  })),
}));

describe('App Component', () => {
  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<App />);
      expect(container).toBeInTheDocument();
    });
  });

  // Additional describe blocks for grouped capabilities can be added here
}); 
// React import not needed with new JSX transform
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeProvider, useTheme } from '../ThemeContext';
import { THEMES } from '../../types/theme';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Test component that uses the theme context
const TestComponent = () => {
  const { currentTheme, toggleTheme, setTheme } = useTheme();
  
  return (
    <div>
      <div data-testid="current-theme">{currentTheme.name}</div>
      <div data-testid="theme-colors">{JSON.stringify(currentTheme.colors)}</div>
      <button data-testid="toggle-theme" onClick={toggleTheme}>
        Toggle Theme
      </button>
      <button 
        data-testid="set-cyber-amber" 
        onClick={() => setTheme('cyber-amber')}
      >
        Set Cyber Amber
      </button>
      <button 
        data-testid="set-zen-paper" 
        onClick={() => setTheme('zen-paper')}
      >
        Set Zen Paper
      </button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset document styles
    document.documentElement.style.cssText = '';
    document.body.className = '';
  });

  describe('ThemeProvider', () => {
    it('should provide default cyber-amber theme when no saved theme exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      expect(screen.getByTestId('current-theme')).toHaveTextContent('cyber-amber');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('notura-theme');
    });

    it('should load saved theme from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('zen-paper');
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      expect(screen.getByTestId('current-theme')).toHaveTextContent('zen-paper');
    });

    it('should apply theme colors to CSS custom properties', () => {
      mockLocalStorage.getItem.mockReturnValue('cyber-amber');
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      const root = document.documentElement;
      expect(root.style.getPropertyValue('--bg-primary')).toBe('#0f0f10');
      expect(root.style.getPropertyValue('--color-primary')).toBe('#F0A500');
      expect(root.style.getPropertyValue('--color-text')).toBe('#EEEEEE');
    });

    it('should add theme class to body element', () => {
      mockLocalStorage.getItem.mockReturnValue('zen-paper');
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      expect(document.body.classList.contains('theme-zen-paper')).toBe(true);
    });

    it('should throw error when useTheme is used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useTheme must be used within a ThemeProvider');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Theme switching functionality', () => {
    it('should toggle between cyber-amber and zen-paper themes', async () => {
      mockLocalStorage.getItem.mockReturnValue('cyber-amber');
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      expect(screen.getByTestId('current-theme')).toHaveTextContent('cyber-amber');
      
      fireEvent.click(screen.getByTestId('toggle-theme'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('zen-paper');
      });
      
      fireEvent.click(screen.getByTestId('toggle-theme'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('cyber-amber');
      });
    });

    it('should set specific theme using setTheme function', async () => {
      mockLocalStorage.getItem.mockReturnValue('cyber-amber');
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      fireEvent.click(screen.getByTestId('set-zen-paper'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('zen-paper');
      });
      
      fireEvent.click(screen.getByTestId('set-cyber-amber'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('cyber-amber');
      });
    });

    it('should persist theme changes to localStorage', async () => {
      mockLocalStorage.getItem.mockReturnValue('cyber-amber');
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      fireEvent.click(screen.getByTestId('toggle-theme'));
      
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('notura-theme', 'zen-paper');
      });
    });

    it('should update CSS custom properties when theme changes', async () => {
      mockLocalStorage.getItem.mockReturnValue('cyber-amber');
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      const root = document.documentElement;
      
      // Initial cyber-amber theme
      expect(root.style.getPropertyValue('--bg-primary')).toBe('#0f0f10');
      
      fireEvent.click(screen.getByTestId('toggle-theme'));
      
      await waitFor(() => {
        // Should now have zen-paper theme colors
        expect(root.style.getPropertyValue('--bg-primary')).toBe('#F9FAFB');
        expect(root.style.getPropertyValue('--color-primary')).toBe('#2563EB');
      });
    });

    it('should update body class when theme changes', async () => {
      mockLocalStorage.getItem.mockReturnValue('cyber-amber');
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      expect(document.body.classList.contains('theme-cyber-amber')).toBe(true);
      
      fireEvent.click(screen.getByTestId('toggle-theme'));
      
      await waitFor(() => {
        expect(document.body.classList.contains('theme-zen-paper')).toBe(true);
        expect(document.body.classList.contains('theme-cyber-amber')).toBe(false);
      });
    });
  });

  describe('Theme configuration', () => {
    it('should provide correct cyber-amber theme colors', () => {
      mockLocalStorage.getItem.mockReturnValue('cyber-amber');
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      const themeColors = JSON.parse(screen.getByTestId('theme-colors').textContent || '{}');
      expect(themeColors).toEqual(THEMES['cyber-amber'].colors);
    });

    it('should provide correct zen-paper theme colors', () => {
      mockLocalStorage.getItem.mockReturnValue('zen-paper');
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      const themeColors = JSON.parse(screen.getByTestId('theme-colors').textContent || '{}');
      expect(themeColors).toEqual(THEMES['zen-paper'].colors);
    });
  });

  describe('Transition handling', () => {
    it('should apply theme colors to CSS custom properties', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      // Check that CSS custom properties are set correctly
      const root = document.documentElement;
      expect(root.style.getPropertyValue('--bg-primary')).toBeTruthy();
      expect(root.style.getPropertyValue('--color-primary')).toBeTruthy();
    });
  });
});
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ThemeConfig, ThemeName, ThemeContextValue } from '../types';
import { THEMES, CSS_VARIABLES, THEME_TRANSITION_DURATION } from '../types/theme';

// Create the theme context
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Theme storage key
const THEME_STORAGE_KEY = 'notura-theme';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Initialize theme from localStorage or default to cyber-amber
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeName;
    return THEMES[savedTheme] || THEMES['cyber-amber'];
  });

  // Apply theme to CSS custom properties
  const applyTheme = (theme: ThemeConfig) => {
    const root = document.documentElement;
    
    // Update CSS custom properties
    Object.entries(CSS_VARIABLES).forEach(([cssVar, colorKey]) => {
      const colorValue = theme.colors[colorKey as keyof typeof theme.colors];
      root.style.setProperty(cssVar, colorValue);
    });

    // Update theme class on body for additional styling
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme.name}`);
  };

  // Toggle between themes
  const toggleTheme = () => {
    const newThemeName: ThemeName = currentTheme.name === 'cyber-amber' ? 'zen-paper' : 'cyber-amber';
    setTheme(newThemeName);
  };

  // Set specific theme
  const setTheme = (themeName: ThemeName) => {
    const newTheme = THEMES[themeName];
    setCurrentTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, themeName);
  };

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  // Initialize theme on mount
  useEffect(() => {
    // Ensure smooth transitions are enabled after initial load
    const timer = setTimeout(() => {
      document.body.style.setProperty('--theme-transition-duration', `${THEME_TRANSITION_DURATION}ms`);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const contextValue: ThemeContextValue = {
    currentTheme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use theme context
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Export context for testing purposes
export { ThemeContext };
import { ThemeConfig, ThemeName } from './index';

// Theme constants
export const CYBER_AMBER_THEME: ThemeConfig = {
  name: 'cyber-amber',
  colors: {
    background: '#0f0f10',
    surface: '#1a1b1e',
    primary: '#F0A500',
    secondary: '#FFD369',
    accent: '#00ADB5',
    text: '#EEEEEE',
    textMuted: '#A0A0A0',
  },
};

export const ZEN_PAPER_THEME: ThemeConfig = {
  name: 'zen-paper',
  colors: {
    background: '#F9FAFB',
    surface: '#FFFFFF',
    primary: '#2563EB',
    secondary: '#1E40AF',
    accent: '#38BDF8',
    text: '#111827',
    textMuted: '#6B7280',
  },
};

export const THEMES: Record<ThemeName, ThemeConfig> = {
  'cyber-amber': CYBER_AMBER_THEME,
  'zen-paper': ZEN_PAPER_THEME,
};

// CSS custom property mappings
export const CSS_VARIABLES = {
  '--bg-primary': 'background',
  '--bg-surface': 'surface',
  '--color-primary': 'primary',
  '--color-secondary': 'secondary',
  '--color-accent': 'accent',
  '--color-text': 'text',
  '--color-text-muted': 'textMuted',
} as const;

// Theme transition duration
export const THEME_TRANSITION_DURATION = 200; // milliseconds
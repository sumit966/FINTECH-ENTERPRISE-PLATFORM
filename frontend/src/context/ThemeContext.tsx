import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';
type Background = 'aurora' | 'off';
type Intensity = 'subtle' | 'normal' | 'bold';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  set: (t: Theme) => void;
  resolvedTheme: 'light' | 'dark';
  background: Background;
  setBackground: (b: Background) => void;
  intensity: Intensity;
  setIntensity: (i: Intensity) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'nexus.theme';
const STORAGE_BG = 'nexus.bg';
const STORAGE_INTENSITY = 'nexus.bg.intensity';

function readStored<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const v = localStorage.getItem(key) as T | null;
    if (v && allowed.includes(v)) return v;
  } catch { /* ignore */ }
  return fallback;
}

function systemPrefersDark(): boolean {
  try { return window.matchMedia('(prefers-color-scheme: dark)').matches; } catch { return true; }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => readStored(STORAGE_KEY, ['light','dark','system'] as const, 'dark'));
  const [background, setBackground] = useState<Background>(() => readStored(STORAGE_BG, ['aurora','off'] as const, 'aurora'));
  const [intensity, setIntensity] = useState<Intensity>(() => readStored(STORAGE_INTENSITY, ['subtle','normal','bold'] as const, 'normal'));
  const [systemDark, setSystemDark] = useState<boolean>(systemPrefersDark);

  // Track system preference
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemDark(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const resolvedTheme: 'light' | 'dark' = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* ignore */ }
  }, [theme, resolvedTheme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('nx-aurora-off','nx-aurora-subtle','nx-aurora-normal','nx-aurora-bold');
    root.classList.add('nx-aurora-' + (background === 'off' ? 'off' : intensity));
    try { localStorage.setItem(STORAGE_BG, background); } catch { /* ignore */ }
  }, [background, intensity]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_INTENSITY, intensity); } catch { /* ignore */ }
  }, [intensity]);

  const value: ThemeContextValue = {
    theme,
    toggle: () => setTheme((t) => {
      if (t === 'dark') return 'light';
      if (t === 'light') return 'dark';
      return 'dark';
    }),
    set: setTheme,
    resolvedTheme,
    background,
    setBackground,
    intensity,
    setIntensity,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}

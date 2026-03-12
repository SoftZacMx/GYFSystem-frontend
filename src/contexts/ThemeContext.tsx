import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { applyThemeToDocument } from '@/theme/palette';
import { getStoredTheme, setStoredTheme, getStoredAccent, setStoredAccent } from '@/theme/theme-storage';
import { fetchThemeConfig } from '@/services/company.service';

type ThemeContextValue = {
  primaryColor: string;
  accentColor: string;
  setPrimaryColor: (hex: string) => void;
  setAccentColor: (hex: string) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const DEFAULT_PRIMARY = '#136dec';
const DEFAULT_ACCENT = '#FBBF24';

function normalizeHex(hex: string): string {
  const t = (hex || '').trim();
  return t.startsWith('#') ? t : `#${t}`;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [primaryColor, setPrimaryState] = useState<string>(() => getStoredTheme() || DEFAULT_PRIMARY);
  const [accentColor, setAccentState] = useState<string>(() => getStoredAccent() || DEFAULT_ACCENT);

  const setPrimaryColor = useCallback((hex: string) => {
    const normalized = normalizeHex(hex);
    setStoredTheme(normalized);
    setPrimaryState(normalized);
    applyThemeToDocument(normalized, accentColor);
  }, [accentColor]);

  const setAccentColor = useCallback((hex: string) => {
    const normalized = normalizeHex(hex);
    setStoredAccent(normalized);
    setAccentState(normalized);
    applyThemeToDocument(primaryColor, normalized);
  }, [primaryColor]);

  useEffect(() => {
    applyThemeToDocument(primaryColor, accentColor);
  }, [primaryColor, accentColor]);

  useEffect(() => {
    fetchThemeConfig()
      .then((config) => {
        const primary = config.primaryColor ? normalizeHex(config.primaryColor) : null;
        const accent = config.accentColor ? normalizeHex(config.accentColor) : null;
        if (primary || accent) {
          const p = primary ?? getStoredTheme() ?? DEFAULT_PRIMARY;
          const a = accent ?? getStoredAccent() ?? DEFAULT_ACCENT;
          setStoredTheme(p);
          setStoredAccent(a);
          setPrimaryState(p);
          setAccentState(a);
          applyThemeToDocument(p, a);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <ThemeContext.Provider value={{ primaryColor, accentColor, setPrimaryColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

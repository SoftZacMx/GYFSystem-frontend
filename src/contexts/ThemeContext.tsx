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

type ThemeContextValue = {
  primaryColor: string;
  accentColor: string;
  setPrimaryColor: (hex: string) => void;
  setAccentColor: (hex: string) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const DEFAULT_PRIMARY = '#136dec';
const DEFAULT_ACCENT = '#FBBF24';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [primaryColor, setPrimaryState] = useState<string>(() => getStoredTheme() || DEFAULT_PRIMARY);
  const [accentColor, setAccentState] = useState<string>(() => getStoredAccent() || DEFAULT_ACCENT);

  const setPrimaryColor = useCallback((hex: string) => {
    const normalized = hex.startsWith('#') ? hex : `#${hex}`;
    setStoredTheme(normalized);
    setPrimaryState(normalized);
    applyThemeToDocument(normalized, accentColor);
  }, [accentColor]);

  const setAccentColor = useCallback((hex: string) => {
    const normalized = hex.startsWith('#') ? hex : `#${hex}`;
    setStoredAccent(normalized);
    setAccentState(normalized);
    applyThemeToDocument(primaryColor, normalized);
  }, [primaryColor]);

  useEffect(() => {
    applyThemeToDocument(primaryColor, accentColor);
  }, [primaryColor, accentColor]);

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

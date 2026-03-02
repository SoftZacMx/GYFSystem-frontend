import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { applyThemeToDocument } from '@/theme/palette';
import { getStoredTheme, setStoredTheme } from '@/theme/theme-storage';

type ThemeContextValue = {
  primaryColor: string;
  setPrimaryColor: (hex: string) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const DEFAULT_PRIMARY = '#1e3a5f';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [primaryColor, setPrimaryState] = useState<string>(() => {
    return getStoredTheme() || DEFAULT_PRIMARY;
  });

  const setPrimaryColor = useCallback((hex: string) => {
    const normalized = hex.startsWith('#') ? hex : `#${hex}`;
    setStoredTheme(normalized);
    applyThemeToDocument(normalized);
    setPrimaryState(normalized);
  }, []);

  useEffect(() => {
    applyThemeToDocument(primaryColor);
  }, [primaryColor]);

  return (
    <ThemeContext.Provider value={{ primaryColor, setPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

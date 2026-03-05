import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { fetchCompanyById } from '@/services/company.service';

const DEFAULT_COMPANY_ID = 1;

/**
 * When user is logged in, fetches company theme and applies it so all users
 * see the same theme (persistent across devices). Runs once per session.
 */
export function ThemeFromCompanyLoader() {
  const { user } = useAuth();
  const { setPrimaryColor, setAccentColor } = useTheme();
  const applied = useRef(false);

  useEffect(() => {
    if (!user || applied.current) return;
    applied.current = true;
    fetchCompanyById(DEFAULT_COMPANY_ID)
      .then((data) => {
        const tc = data.themeConfig;
        if (tc?.primaryColor) setPrimaryColor(tc.primaryColor);
        if (tc?.accentColor) setAccentColor(tc.accentColor);
      })
      .catch(() => {});
  }, [user, setPrimaryColor, setAccentColor]);

  return null;
}

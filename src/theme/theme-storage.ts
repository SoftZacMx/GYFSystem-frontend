const THEME_KEY = 'fm_theme_primary';

export function getStoredTheme(): string | null {
  return localStorage.getItem(THEME_KEY);
}

export function setStoredTheme(hex: string): void {
  localStorage.setItem(THEME_KEY, hex);
}

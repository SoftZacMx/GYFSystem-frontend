const THEME_PRIMARY_KEY = 'fm_theme_primary';
const THEME_ACCENT_KEY = 'fm_theme_accent';

export function getStoredTheme(): string | null {
  return localStorage.getItem(THEME_PRIMARY_KEY);
}

export function setStoredTheme(hex: string): void {
  localStorage.setItem(THEME_PRIMARY_KEY, hex);
}

export function getStoredAccent(): string | null {
  return localStorage.getItem(THEME_ACCENT_KEY);
}

export function setStoredAccent(hex: string): void {
  localStorage.setItem(THEME_ACCENT_KEY, hex);
}

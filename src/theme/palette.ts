import tinycolor from 'tinycolor2';

/** Normalize hex input (add # if missing) */
function normalizeHex(hex: string): string {
  const trimmed = (hex || '').trim();
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
}

/** Convert tinycolor to "H S% L%" for CSS var (Tailwind: hsl(var(--primary))) */
function toHslVar(tc: tinycolor.Instance): string {
  const { h, s, l } = tc.toHsl();
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/** Primary palette derived from base hex using tinycolor2 */
export interface PrimaryPalette {
  base: string;
  hover: string;
  active: string;
  muted: string;
  foreground: string;
  hslVar: string;
  hslVarHover: string;
  hslVarMuted: string;
  /** Bordes de inputs (tinte suave del primary) */
  hslVarBorder: string;
}

export function generatePrimaryPalette(primaryHex: string): PrimaryPalette {
  const hex = normalizeHex(primaryHex);
  const base = tinycolor(hex);
  const hover = base.clone().darken(8);
  const active = base.clone().darken(14);
  const muted = base.clone().lighten(45).saturate(-10);
  const borderTint = base.clone().lighten(32).saturate(-15);
  const foreground = base.isDark() ? tinycolor('#ffffff') : tinycolor('#0f172a');
  return {
    base: base.toHexString(),
    hover: hover.toHexString(),
    active: active.toHexString(),
    muted: muted.toHexString(),
    foreground: foreground.toHexString(),
    hslVar: toHslVar(base),
    hslVarHover: toHslVar(hover),
    hslVarMuted: toHslVar(muted),
    hslVarBorder: toHslVar(borderTint),
  };
}

/** Full theme palette including optional accent */
export interface ThemePalette {
  primary: PrimaryPalette;
  accent: {
    base: tinycolor.Instance;
    foreground: tinycolor.Instance;
    hslVar: string;
    hslVarForeground: string;
  };
}

export function generateThemePalette(
  primaryHex: string,
  accentHex?: string | null
): ThemePalette {
  const primary = generatePrimaryPalette(primaryHex);
  const primaryTc = tinycolor(normalizeHex(primaryHex));
  const accentBase =
    accentHex && accentHex.trim()
      ? tinycolor(normalizeHex(accentHex))
      : primaryTc.clone().lighten(40);
  const accentForeground = accentBase.isDark()
    ? tinycolor('#ffffff')
    : tinycolor('#0f172a');
  return {
    primary,
    accent: {
      base: accentBase,
      foreground: accentForeground,
      hslVar: toHslVar(accentBase),
      hslVarForeground: toHslVar(accentForeground),
    },
  };
}

/** Apply theme to document root (CSS variables) for Tailwind and direct use */
export function applyThemeToDocument(
  primaryHex: string,
  accentHex?: string | null
): void {
  const palette = generateThemePalette(primaryHex, accentHex);
  const root = document.documentElement;
  const { primary, accent } = palette;

  root.style.setProperty('--primary', primary.hslVar);
  root.style.setProperty('--primary-foreground', toHslVar(tinycolor(primary.foreground)));
  root.style.setProperty('--primary-hover', primary.hslVarHover);
  root.style.setProperty('--primary-muted', primary.hslVarMuted);

  root.style.setProperty('--secondary', primary.hslVarMuted);
  root.style.setProperty('--secondary-foreground', primary.hslVar);

  root.style.setProperty('--accent', accent.hslVar);
  root.style.setProperty('--accent-foreground', accent.hslVarForeground);

  root.style.setProperty('--muted', '210 40% 96.1%');
  root.style.setProperty('--muted-foreground', '215.4 16.3% 46.9%');

  root.style.setProperty('--input', primary.hslVarBorder);
  root.style.setProperty('--border', primary.hslVarBorder);
  root.style.setProperty('--ring', primary.hslVar);
}

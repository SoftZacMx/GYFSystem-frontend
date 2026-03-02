import { darken, lighten } from 'color2k';

/** Parse "hsl(H, S%, L%)" or "hsla(...)" to "H S% L%" for CSS var */
function hslToVar(hsl: string): string {
  const m = hsl.match(/hsla?\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)%,\s*(\d+(?:\.\d+)?)%/);
  if (!m) return '222.2 47.4% 11.2%';
  return `${m[1]} ${m[2]}% ${m[3]}%`;
}

/** Convert hex or hsl string to "H S% L%" for CSS var */
function hexToHslVar(hex: string): string {
  if (hex.startsWith('hsl')) return hslToVar(hex);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '222.2 47.4% 11.2%';
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h2 = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h2 = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h2 = ((b - r) / d + 2) / 6;
    else h2 = ((r - g) / d + 4) / 6;
  }
  return `${Math.round(h2 * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function generatePalette(hexBase: string): Record<number, string> {
  const result: Record<number, string> = {};
  const hex = hexBase.startsWith('#') ? hexBase : `#${hexBase}`;
  for (let i = 0; i <= 10; i++) {
    const step = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950][i];
    const t = i / 10;
    const amt = t <= 0.5 ? (0.5 - t) * 1.2 : (t - 0.5) * 1.2;
    const c = t <= 0.5 ? lighten(hex, amt) : darken(hex, amt);
    result[step] = hslToVar(c);
  }
  return result;
}

export function applyThemeToDocument(primaryHex: string, accentHex?: string | null): void {
  const hex = primaryHex.startsWith('#') ? primaryHex : `#${primaryHex}`;
  const root = document.documentElement;
  const light = lighten(hex, 0.85);
  const dark = darken(hex, 0.4);
  root.style.setProperty('--primary', hexToHslVar(hex));
  root.style.setProperty('--primary-foreground', '210 40% 98%');
  root.style.setProperty('--secondary', light.startsWith('#') ? hexToHslVar(light) : hslToVar(light));
  root.style.setProperty('--secondary-foreground', dark.startsWith('#') ? hexToHslVar(dark) : hslToVar(dark));
  const accent = accentHex && accentHex.trim()
    ? (accentHex.startsWith('#') ? accentHex : `#${accentHex}`)
    : light;
  const accentDark = accentHex && accentHex.trim() ? darken(accent, 0.3) : dark;
  root.style.setProperty('--accent', accent.startsWith('#') ? hexToHslVar(accent) : hslToVar(accent));
  root.style.setProperty('--accent-foreground', accentDark.startsWith('#') ? hexToHslVar(accentDark) : hslToVar(accentDark));
  root.style.setProperty('--muted', '210 40% 96.1%');
  root.style.setProperty('--muted-foreground', '215.4 16.3% 46.9%');
}

import { useTheme } from '@/contexts/ThemeContext';

export function ThemePicker() {
  const { primaryColor, setPrimaryColor } = useTheme();
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="theme-color" className="text-sm text-muted-foreground">Tema</label>
      <input
        id="theme-color"
        type="color"
        value={primaryColor}
        onChange={(e) => setPrimaryColor(e.target.value)}
        className="h-8 w-12 cursor-pointer rounded border border-input"
      />
    </div>
  );
}

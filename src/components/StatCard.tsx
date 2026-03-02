export interface StatCardConfig {
  /** Nombre del icono Material Symbols */
  icon: string;
  /** Color de fondo del contenedor del icono (hex o CSS color) */
  iconBg: string;
}

export interface StatCardProps {
  /** Etiqueta de la métrica (ej. "Estudiantes") */
  label: string;
  /** Valor a mostrar (número o texto) */
  value: string | number;
  /** Texto de tendencia opcional (ej. "+3%") */
  trend?: string;
  /** Si la tendencia es positiva (verde) o negativa (rojo) */
  trendUp?: boolean;
  /** Badge opcional (ej. "Alto") */
  badge?: string;
  /** Configuración visual: icono y color */
  config: StatCardConfig;
}

export function StatCard({ label, value, trend, trendUp, badge, config }: StatCardProps) {
  const { icon, iconBg } = config;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div
          className="flex size-12 items-center justify-center rounded-xl text-slate-600"
          style={{ backgroundColor: iconBg }}
        >
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        {badge && <span className="text-xs font-medium text-red-600">{badge}</span>}
      </div>
      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
      {trend != null && (
        <p className={`mt-1 text-sm font-medium ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}>{trend}</p>
      )}
    </div>
  );
}

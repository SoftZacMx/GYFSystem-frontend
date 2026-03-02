import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

const APP_PRIMARY = '#136dec';
const APP_BG = '#f6f7f8';

export interface ListScreenLayoutProps {
  title: string;
  icon?: string;
  addLabel?: string;
  onAdd?: () => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: ReactNode;
  fab?: boolean;
  onFabClick?: () => void;
  children: ReactNode;
}

export function ListScreenLayout({
  title,
  icon = 'folder',
  addLabel,
  onAdd,
  searchPlaceholder,
  searchValue = '',
  onSearchChange,
  filters,
  fab,
  onFabClick,
  children,
}: ListScreenLayoutProps) {
  return (
    <div className="min-h-full font-display" style={{ backgroundColor: APP_BG }}>
      {/* Header */}
      <div className="relative flex items-center justify-center px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: `${APP_PRIMARY}20` }}
          >
            <span className="material-symbols-outlined text-2xl" style={{ color: APP_PRIMARY }}>
              {icon}
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">{title}</h1>
        </div>
        {onAdd && addLabel && (
          <button
            type="button"
            onClick={onAdd}
            className="absolute right-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-white transition hover:opacity-90"
            style={{ backgroundColor: `${APP_PRIMARY}20` }}
            aria-label={addLabel}
          >
            <span className="material-symbols-outlined text-2xl" style={{ color: APP_PRIMARY }}>
              person_add
            </span>
          </button>
        )}
      </div>

      {/* Search */}
      {onSearchChange && searchPlaceholder != null && (
        <div className="px-4 pb-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
              search
            </span>
            <input
              type="search"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-slate-800 placeholder:text-slate-400 focus:outline-0 focus:ring-2 focus:ring-[#136dec]/30"
            />
          </div>
        </div>
      )}

      {/* Filters */}
      {filters && <div className="px-4 pb-3">{filters}</div>}

      {/* List content */}
      <div className="px-4 pb-24">{children}</div>

      {/* FAB */}
      {fab && onFabClick && (
        <button
          type="button"
          onClick={onFabClick}
          className="fixed bottom-20 right-4 flex size-14 items-center justify-center rounded-full text-white shadow-lg transition hover:opacity-90 active:scale-95"
          style={{ backgroundColor: APP_PRIMARY }}
          aria-label="Añadir"
        >
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      )}
    </div>
  );
}

/** Pills for filters - pass activeId to highlight one */
export function FilterPills<T extends string>({
  options,
  activeId,
  onChange,
  labelAll = 'Todos',
}: {
  options: { id: T; label: string }[];
  activeId: T | 'all';
  onChange: (id: T | 'all') => void;
  labelAll?: string;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <button
        type="button"
        onClick={() => onChange('all')}
        className="shrink-0 rounded-full px-4 py-2 text-sm font-medium transition"
        style={
          activeId === 'all'
            ? { backgroundColor: '#136dec', color: 'white' }
            : { backgroundColor: '#e2e8f0', color: '#475569' }
        }
      >
        {labelAll}
      </button>
      {options.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className="shrink-0 rounded-full px-4 py-2 text-sm font-medium transition"
          style={
            activeId === id
              ? { backgroundColor: '#136dec', color: 'white' }
              : { backgroundColor: '#e2e8f0', color: '#475569' }
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/** Single list card - avatar left, main content, menu right */
export function ListCard({
  to,
  avatar,
  title,
  subtitle,
  meta,
  onMenuClick,
}: {
  to?: string;
  avatar: ReactNode;
  title: string;
  subtitle?: ReactNode;
  meta?: ReactNode;
  onMenuClick?: () => void;
}) {
  const content = (
    <>
      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-slate-600">
        {avatar}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-800 truncate">{title}</p>
        {subtitle != null && <div className="mt-0.5">{subtitle}</div>}
        {meta != null && <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">{meta}</div>}
      </div>
      {onMenuClick && (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMenuClick(); }}
          className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Más opciones"
        >
          <span className="material-symbols-outlined text-xl">more_vert</span>
        </button>
      )}
    </>
  );

  const cardClass = "flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm";

  if (to) {
    return (
      <Link to={to} className={`block ${cardClass} transition hover:shadow-md`}>
        {content}
      </Link>
    );
  }
  return <div className={cardClass}>{content}</div>;
}


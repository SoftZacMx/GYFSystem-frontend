import type { DocumentDto } from '@/types/entities';

export interface DocumentCardProps {
  document: DocumentDto;
  categoryName: string;
  /** Línea bajo el título (ej. "Subido 3/3/2026" o "Subido ... · Nombre alumno") */
  subtitle?: string;
  onDownload: (doc: DocumentDto) => void;
  onDelete: (doc: DocumentDto) => void;
  downloadingId: number | null;
  /** Clase del contenedor (ej. para variar espaciado en lista agrupada) */
  className?: string;
}

export function DocumentCard({
  document: d,
  categoryName,
  subtitle,
  onDownload,
  onDelete,
  downloadingId,
  className = '',
}: DocumentCardProps) {
  return (
    <li
      className={`flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm ${className}`}
    >
      <span className="material-symbols-outlined text-2xl text-amber-500 shrink-0">description</span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-slate-800">{categoryName}</p>
        {subtitle != null && <p className="text-xs text-slate-500">{subtitle}</p>}
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onDownload(d)}
            disabled={downloadingId === d.id}
            className="flex size-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-60"
            title="Descargar"
            aria-label="Descargar"
          >
            <span className="material-symbols-outlined text-xl">
              {downloadingId === d.id ? 'hourglass_empty' : 'download'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onDelete(d)}
            className="flex size-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
            title="Eliminar"
            aria-label="Eliminar"
          >
            <span className="material-symbols-outlined text-xl">delete</span>
          </button>
        </div>
      </div>
      <span
        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${d.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
      >
        {d.verified ? 'Archivo verificado' : 'Pendiente'}
      </span>
    </li>
  );
}

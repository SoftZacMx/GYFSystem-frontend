export interface PaginationBarProps {
  /** Página actual (1-based) */
  page: number;
  /** Cantidad de ítems por página */
  pageSize: number;
  /** Total de ítems */
  total: number;
  /** Se llama al cambiar de página (nueva página 1-based) */
  onPageChange: (page: number) => void;
  /** Opcional: si se pasa, se muestra el selector "Filas por página" */
  onPageSizeChange?: (pageSize: number) => void;
  /** Opciones para el selector de filas (por defecto [10, 20, 50]) */
  pageSizeOptions?: number[];
}

function getPageNumbers(current: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 1) return [1];
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const result: (number | 'ellipsis')[] = [1];
  const midStart = Math.max(2, current - 1);
  const midEnd = Math.min(totalPages - 1, current + 1);
  if (midStart > 2) result.push('ellipsis');
  for (let p = midStart; p <= midEnd; p++) result.push(p);
  if (midEnd < totalPages - 1) result.push('ellipsis');
  if (totalPages > 1) result.push(totalPages);
  return result;
}

export function PaginationBar({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
}: PaginationBarProps) {
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4">
      {/* Fila: Filas por página | Items X-Y de Z */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {onPageSizeChange ? (
          <div className="flex items-center gap-2">
            <label htmlFor="pagination-rows" className="text-sm font-medium text-slate-600">
              Filas:
            </label>
            <select
              id="pagination-rows"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-lg border border-input bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-primary focus:outline-0 focus:ring-1 focus:ring-primary"
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        ) : (
          <span />
        )}
        <p className="text-sm text-slate-600">
          {total === 0 ? 'Sin resultados' : `Items ${from}-${to} de ${total}`}
        </p>
      </div>

      {/* Navegación: Prev | 1 2 3 ... 25 | Next */}
      <div className="flex flex-wrap items-center justify-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded px-2 py-1.5 text-sm font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-100 hover:text-slate-800 disabled:hover:bg-transparent disabled:hover:text-slate-600"
        >
          ‹ Prev
        </button>
        <div className="flex items-center gap-0.5">
          {pageNumbers.map((n, i) =>
            n === 'ellipsis' ? (
              <span key={`ellipsis-${i}`} className="px-2 text-slate-400">
                ...
              </span>
            ) : (
              <button
                key={n}
                type="button"
                onClick={() => onPageChange(n)}
                className={`min-w-[2rem] rounded px-2 py-1.5 text-sm font-medium transition ${
                  n === page
                    ? 'bg-primary text-primary-foreground'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {n}
              </button>
            )
          )}
        </div>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded px-2 py-1.5 text-sm font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-100 hover:text-slate-800 disabled:hover:bg-transparent disabled:hover:text-slate-600"
        >
          Next ›
        </button>
      </div>
    </div>
  );
}

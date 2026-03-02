import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { UserDto } from '@/types/entities';
import { ApiError } from '@/types/api';
import type { ListMeta } from '@/types/api';
import { fetchUsers } from '@/services/users.service';
import { ListScreenLayout, ListCard } from '@/components/ListScreenLayout';
import { PaginationBar } from '@/components/PaginationBar';

const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = [10, 20, 50];

export function UsersPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<UserDto[]>([]);
  const [meta, setMeta] = useState<ListMeta | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchUsers({ page, limit: pageSize })
      .then((res) => {
        if (cancelled) return;
        setData(res.data);
        setMeta(res.meta ?? null);
        setPage(res.meta?.page ?? 1);
      })
      .catch((err) => {
        if (!cancelled) toast.error(err instanceof ApiError ? err.message : 'Error al cargar');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [page, pageSize]);

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.trim().toLowerCase();
    return data.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [data, search]);

  const total = meta?.total ?? 0;

  return (
    <ListScreenLayout
      title="Usuarios"
      icon="group"
      searchPlaceholder="Buscar usuarios..."
      searchValue={search}
      onSearchChange={setSearch}
      fab
      onFabClick={() => navigate('/users/new')}
    >
      {loading ? (
        <p className="py-8 text-center text-slate-500">Cargando...</p>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-slate-500">No hay usuarios</p>
      ) : (
        <>
          <div className="space-y-3">
            {filtered.map((u) => (
              <ListCard
                key={u.id}
                to={`/users/${u.id}`}
                avatar={<span className="text-lg font-semibold text-slate-600">{u.name.slice(0, 1)}</span>}
                title={u.name}
                subtitle={u.email}
                meta={
                  <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {u.status}
                  </span>
                }
              />
            ))}
          </div>
          {total > 0 && (
            <PaginationBar
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={(p) => setPage(Math.max(1, Math.min(meta?.totalPages ?? 1, p)))}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
            />
          )}
        </>
      )}
    </ListScreenLayout>
  );
}

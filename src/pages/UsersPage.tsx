import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import type { UserDto } from '@/types/entities';
import { ApiError } from '@/types/api';
import { fetchUsers } from '@/services/users.service';
import { ListScreenLayout, ListCard } from '@/components/ListScreenLayout';

export function UsersPage() {
  const [data, setData] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    fetchUsers({ page: 1, limit: 200 })
      .then((res) => setData(res.data))
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Error al cargar'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.trim().toLowerCase();
    return data.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [data, search]);

  return (
    <ListScreenLayout
      title="Usuarios"
      icon="group"
      searchPlaceholder="Buscar usuarios..."
      searchValue={search}
      onSearchChange={setSearch}
    >
      {loading ? (
        <p className="py-8 text-center text-slate-500">Cargando...</p>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-slate-500">No hay usuarios</p>
      ) : (
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
      )}
    </ListScreenLayout>
  );
}

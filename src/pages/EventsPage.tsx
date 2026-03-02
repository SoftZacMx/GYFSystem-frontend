import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import type { EventDto } from '@/types/entities';
import { ApiError } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import { isStaffRole } from '@/types/auth';
import { fetchEvents, createEvent, updateEvent, deleteEvent } from '@/services/events.service';
import { ListScreenLayout, ListCard } from '@/components/ListScreenLayout';

export function EventsPage() {
  const { user } = useAuth();
  const staff = user ? isStaffRole(user.roleId) : false;
  const [data, setData] = useState<EventDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    fetchEvents({ page: 1, limit: 100 })
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
    return data.filter((ev) => ev.title.toLowerCase().includes(q));
  }, [data, search]);

  const openCreate = () => {
    setTitle('');
    setDescription('');
    setEventDate(new Date().toISOString().slice(0, 16));
    setEditingId(null);
    setShowCreate(true);
  };

  const openEdit = (ev: EventDto) => {
    setEditingId(ev.id);
    setTitle(ev.title);
    setDescription(ev.description ?? '');
    setEventDate(ev.eventDate.slice(0, 16));
    setShowCreate(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate) return;
    setSaving(true);
    const body = { title: title.trim(), description: description.trim() || null, eventDate };
    (editingId == null ? createEvent(body) : updateEvent(editingId, body))
      .then(() => {
        toast.success(editingId == null ? 'Evento creado' : 'Evento actualizado');
        setShowCreate(false);
        load();
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Error al guardar'))
      .finally(() => setSaving(false));
  };

  const handleDelete = (ev: EventDto) => {
    if (!window.confirm('¿Eliminar este evento?')) return;
    setDeletingId(ev.id);
    deleteEvent(ev.id)
      .then(() => {
        toast.success('Evento eliminado');
        load();
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Error al eliminar'))
      .finally(() => setDeletingId(null));
  };

  return (
    <ListScreenLayout
      title="Eventos"
      icon="event"
      addLabel={staff ? 'Nuevo evento' : undefined}
      onAdd={staff ? openCreate : undefined}
      searchPlaceholder="Buscar eventos..."
      searchValue={search}
      onSearchChange={setSearch}
      fab={staff}
      onFabClick={staff ? openCreate : undefined}
    >
      {loading ? (
        <p className="py-8 text-center text-slate-500">Cargando...</p>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-slate-500">No hay eventos</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((ev) => (
            <ListCard
              key={ev.id}
              avatar={<span className="material-symbols-outlined text-slate-500">event</span>}
              title={ev.title}
              subtitle={new Date(ev.eventDate).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' })}
              meta={ev.description ? <span className="line-clamp-1">{ev.description}</span> : null}
              onMenuClick={staff ? () => openEdit(ev) : undefined}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-bold text-slate-800">{editingId == null ? 'Nuevo evento' : 'Editar evento'}</h3>
            <form onSubmit={handleSubmit}>
              <label className="mb-2 block text-sm font-medium text-slate-700">Título</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="mb-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800" required />
              <label className="mb-2 block text-sm font-medium text-slate-700">Descripción</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mb-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800" rows={3} />
              <label className="mb-2 block text-sm font-medium text-slate-700">Fecha</label>
              <input type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="mb-6 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800" required />
              <div className="flex justify-end gap-2">
                {editingId != null && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('¿Eliminar este evento?')) {
                        deleteEvent(editingId).then(() => { setShowCreate(false); load(); }).catch((err) => toast.error(err instanceof ApiError ? err.message : 'Error'));
                      }
                    }}
                    className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600"
                  >
                    Eliminar
                  </button>
                )}
                <button type="button" onClick={() => setShowCreate(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600">Cancelar</button>
                <button type="submit" disabled={saving} className="rounded-xl bg-[#136dec] px-4 py-2 text-sm font-medium text-white disabled:opacity-70">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ListScreenLayout>
  );
}

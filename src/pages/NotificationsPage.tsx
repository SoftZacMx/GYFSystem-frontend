import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import type { NotificationDto } from '@/types/entities';
import { ApiError } from '@/types/api';
import { fetchMyNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/services/notifications.service';
import { ListScreenLayout, ListCard } from '@/components/ListScreenLayout';

export function NotificationsPage() {
  const [list, setList] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [markingAll, setMarkingAll] = useState(false);

  const load = () => {
    setLoading(true);
    fetchMyNotifications()
      .then(setList)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Error al cargar'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();
    return list.filter((n) => n.message.toLowerCase().includes(q) || n.type.toLowerCase().includes(q));
  }, [list, search]);

  const handleMarkRead = (id: number) => {
    markNotificationAsRead(id)
      .then((updated) => setList((prev) => prev.map((n) => (n.id === id ? updated : n))))
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Error'));
  };

  const handleMarkAllRead = () => {
    setMarkingAll(true);
    markAllNotificationsAsRead()
      .then((res) => {
        toast.success(res.updated + ' marcadas como leídas');
        load();
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Error'))
      .finally(() => setMarkingAll(false));
  };

  const unreadCount = list.filter((n) => !n.isRead).length;

  return (
    <ListScreenLayout
      title="Notificaciones"
      icon="notifications"
      searchPlaceholder="Buscar notificaciones..."
      searchValue={search}
      onSearchChange={setSearch}
    >
      {unreadCount > 0 && (
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            disabled={markingAll}
            onClick={handleMarkAllRead}
            className="rounded-full bg-[#136dec] px-4 py-2 text-sm font-medium text-white disabled:opacity-70"
          >
            Marcar todas como leídas
          </button>
        </div>
      )}
      {loading ? (
        <p className="py-8 text-center text-slate-500">Cargando...</p>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-slate-500">No hay notificaciones.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <ListCard
              key={n.id}
              avatar={
                <span className={`material-symbols-outlined ${n.isRead ? 'text-slate-400' : 'text-[#136dec]'}`}>
                  notifications
                </span>
              }
              title={n.message}
              subtitle={`${n.type} · ${new Date(n.createdAt).toLocaleString('es')}`}
              meta={
                !n.isRead ? (
                  <button
                    type="button"
                    onClick={() => handleMarkRead(n.id)}
                    className="rounded-lg border border-[#136dec]/30 bg-[#136dec]/10 px-2 py-1 text-xs font-medium text-[#136dec]"
                  >
                    Marcar leída
                  </button>
                ) : null
              }
            />
          ))}
        </div>
      )}
    </ListScreenLayout>
  );
}

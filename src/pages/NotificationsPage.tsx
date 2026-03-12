import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import type { NotificationDto } from '@/types/entities';
import { ApiError } from '@/types/api';
import { fetchMyNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/services/notifications.service';


type TabId = 'all' | 'unread' | 'admin';

type TabItem = { id: TabId; label: string; badge?: number };

const TYPE_TITLES: Record<string, string> = {
  document: 'Nuevo documento',
  event: 'Recordatorio de evento',
  warning: 'Aviso',
  info: 'Aviso del sistema',
  admin: 'Mensaje de administración',
};

function getNotificationIcon(type: string): { icon: string; bg: string; color: string } {
  const t = type.toLowerCase();
  if (t === 'document') return { icon: 'upload_file', bg: 'bg-primary', color: 'text-primary-foreground' };
  if (t === 'event') return { icon: 'event', bg: 'bg-accent', color: 'text-accent-foreground' };
  if (t === 'warning') return { icon: 'warning', bg: 'bg-amber-500', color: 'text-white' };
  return { icon: 'campaign', bg: 'bg-slate-400', color: 'text-white' };
}

function getNotificationTitle(type: string): string {
  return TYPE_TITLES[type.toLowerCase()] ?? type;
}

function formatTimeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffM = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);
  if (diffM < 1) return 'Ahora';
  if (diffM < 60) return `${diffM}m`;
  if (diffH < 24) return `${diffH}h`;
  if (diffD === 1) return '1d';
  if (diffD < 7) return `${diffD}d`;
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short' });
}

function getGroupLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const notifDay = new Date(d);
  notifDay.setHours(0, 0, 0, 0);
  if (notifDay.getTime() === today.getTime()) return 'HOY';
  if (notifDay.getTime() === yesterday.getTime()) return 'AYER';
  const diffD = Math.floor((today.getTime() - notifDay.getTime()) / 86400000);
  if (diffD < 7) return 'ESTA SEMANA';
  return 'ANTES';
}

export function NotificationsPage() {
  const [list, setList] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabId>('all');
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
    let items = list;
    if (tab === 'unread') items = items.filter((n) => !n.isRead);
    if (tab === 'admin') items = items.filter((n) => n.type.toLowerCase().includes('admin') || n.type === 'info');
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [list, tab]);

  const grouped = useMemo(() => {
    const groups: { label: string; items: NotificationDto[] }[] = [];
    let currentLabel = '';
    filtered.forEach((n) => {
      const label = getGroupLabel(n.createdAt);
      if (label !== currentLabel) {
        currentLabel = label;
        groups.push({ label, items: [n] });
      } else {
        groups[groups.length - 1].items.push(n);
      }
    });
    return groups;
  }, [filtered]);

  const handleMarkRead = (id: number) => {
    markNotificationAsRead(id)
      .then((updated) => {
        setList((prev) => prev.map((n) => (n.id === id ? updated : n)));
        window.dispatchEvent(new CustomEvent('fm:notifications-updated'));
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Error'));
  };

  const handleMarkAllRead = () => {
    setMarkingAll(true);
    markAllNotificationsAsRead()
      .then((res) => {
        toast.success(res.updated + ' marcadas como leídas');
        load();
        window.dispatchEvent(new CustomEvent('fm:notifications-updated'));
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Error'))
      .finally(() => setMarkingAll(false));
  };

  const unreadCount = list.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-full bg-muted font-display">
      {/* Header: centrado título + Mark all derecha */}
      <header className="relative flex items-center justify-center px-4 pt-4 pb-3">
        <h1 className="text-xl font-bold tracking-tight text-slate-800">Mis notificaciones</h1>
        {unreadCount > 0 && (
          <button
            type="button"
            disabled={markingAll}
            onClick={handleMarkAllRead}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium disabled:opacity-70"
            className="text-primary"
          >
            Marcar todas
          </button>
        )}
      </header>

      {/* Tabs */}
      <div className="border-b border-slate-200 px-4">
        <div className="flex gap-6">
          {(
            [
              { id: 'all' as TabId, label: 'Todas', badge: unreadCount },
              { id: 'unread' as TabId, label: 'No leídas' },
              { id: 'admin' as TabId, label: 'Admin' },
            ] as TabItem[]
          ).map((tabItem) => {
            const { id, label, badge } = tabItem;
            return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className="relative pb-3 pt-2 text-sm font-medium transition"
              className={tab === id ? 'text-primary' : 'text-slate-500'}
            >
              {label}
              {badge != null && badge > 0 && id === 'all' && (
                <span
                  className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-xs font-semibold text-primary-foreground"
                >
                  {badge} NEW
                </span>
              )}
              {tab === id && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ backgroundColor: APP_PRIMARY }}
                />
              )}
            </button>
            );
          })}
        </div>
      </div>

      {/* List - scrollable, responsive */}
      <div className="px-4 pb-24 pt-4 md:mx-auto md:max-w-2xl lg:max-w-3xl">
        {loading ? (
          <p className="py-8 text-center text-slate-500">Cargando...</p>
        ) : grouped.length === 0 ? (
          <p className="py-8 text-center text-slate-500">No hay notificaciones.</p>
        ) : (
          <div className="space-y-6">
            {grouped.map(({ label, items }) => (
              <section key={label}>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</h2>
                <div className="space-y-1 md:space-y-2">
                  {items.map((n) => {
                    const { icon, bg, color } = getNotificationIcon(n.type);
                    return (
                      <div
                        key={n.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => !n.isRead && handleMarkRead(n.id)}
                        onKeyDown={(e) => e.key === 'Enter' && !n.isRead && handleMarkRead(n.id)}
                        className="relative flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md md:gap-4 md:p-4"
                      >
                        {!n.isRead && (
                          <span className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-primary" />
                        )}
                        <div
                          className={`flex size-10 shrink-0 items-center justify-center rounded-lg md:size-12 ${bg} ${color}`}
                        >
                          <span className="material-symbols-outlined text-xl md:text-2xl">{icon}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-slate-800">{getNotificationTitle(n.type)}</h3>
                            <span className="shrink-0 text-xs text-slate-400">{formatTimeAgo(n.createdAt)}</span>
                          </div>
                          <p className="mt-0.5 text-sm leading-snug text-slate-600 line-clamp-3">{n.message}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

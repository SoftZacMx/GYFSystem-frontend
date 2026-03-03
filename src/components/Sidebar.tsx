import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isStaffRole } from '@/types/auth';
import { ThemePicker } from '@/components/ThemePicker';
import { SidebarUserInfo } from '@/components/SidebarUserInfo';
import { fetchMyNotifications } from '@/services/notifications.service';

const navItems: { to: string; label: string; icon: string; staffOnly: boolean }[] = [
  { to: '/', label: 'Inicio', icon: 'home', staffOnly: false },
  { to: '/users', label: 'Usuarios', icon: 'group', staffOnly: true },
  { to: '/students', label: 'Estudiantes', icon: 'school', staffOnly: false },
  { to: '/documents', label: 'Documentos', icon: 'description', staffOnly: false },
  { to: '/document-categories', label: 'Categorías de documentos', icon: 'folder', staffOnly: true },
  { to: '/events', label: 'Eventos', icon: 'event', staffOnly: false },
  { to: '/company', label: 'Empresa', icon: 'business', staffOnly: true },
];

export function Sidebar({
  onClose,
  collapsed = false,
  onToggleCollapse,
  collapsible = true,
}: {
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  collapsible?: boolean;
}) {
  const { user, logout } = useAuth();
  const staff = user ? isStaffRole(user.roleId) : false;
  const items = staff ? navItems : navItems.filter((item) => !item.staffOnly);
  const isNarrow = collapsible && collapsed;
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = () => {
    fetchMyNotifications()
      .then((list) => setUnreadCount(list.filter((n) => !n.isRead).length))
      .catch(() => {});
  };

  useEffect(() => {
    refreshUnreadCount();
  }, []);

  useEffect(() => {
    const handler = () => refreshUnreadCount();
    window.addEventListener('fm:notifications-updated', handler);
    return () => window.removeEventListener('fm:notifications-updated', handler);
  }, []);

  return (
    <aside
      className={`flex h-full flex-col border-r border-slate-200 bg-white transition-[width] duration-200 ${
        isNarrow ? 'w-[5.5rem]' : 'w-64'
      }`}
    >
      <div className="flex  h-14 shrink-0 items-center gap-2 border-b border-slate-200 px-3">
        <SidebarUserInfo user={user} collapsed={isNarrow} />
        {collapsible && onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex shrink-0 items-center justify-end rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
          >
            <span className="material-symbols-outlined text-2xl">
              {collapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>
        )}
      </div>
      <div className="shrink-0 border-b border-slate-200 px-3 py-2">
        <Link
          to="/notifications"
          onClick={onClose}
          title={isNarrow ? (unreadCount > 0 ? `${unreadCount} nuevas notificaciones` : 'Notificaciones') : undefined}
          className={`flex items-center rounded-lg py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-800 ${isNarrow ? 'justify-center px-0' : 'gap-3 px-3'}`}
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          {!isNarrow && (
            <span className="min-w-0 flex-1 truncate">
              {unreadCount > 0 ? `${unreadCount} nuevas notificaciones` : 'Notificaciones'}
            </span>
          )}
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto py-3">
        <ul className={`space-y-0.5 ${isNarrow ? 'px-2' : 'px-2'}`}>
          {items.map(({ to, label, icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                onClick={onClose}
                title={isNarrow ? label : undefined}
                className={({ isActive }) =>
                  'flex items-center rounded-lg py-2.5 text-sm font-medium transition ' +
                  (isNarrow ? 'justify-center px-0' : 'gap-3 px-3') +
                  (isActive
                    ? ' bg-[#136dec]/10 text-[#136dec]'
                    : ' text-slate-600 hover:bg-slate-100 hover:text-slate-800')
                }
              >
                <span className="material-symbols-outlined text-[22px]">{icon}</span>
                {!isNarrow && <span className="truncate">{label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className={`shrink-0 border-t border-slate-200 ${isNarrow ? 'p-2' : 'p-3'}`}>
        {/* Tema oculto por ahora
        {!isNarrow && (
          <div className="mb-2 flex items-center justify-between px-2">
            <span className="text-xs font-medium text-slate-500">Tema</span>
            <ThemePicker />
          </div>
        )}
        {isNarrow && (
          <div className="flex justify-center">
            <ThemePicker />
          </div>
        )}
        */}
        <button
          type="button"
          onClick={() => {
            onClose?.();
            logout();
          }}
          title={isNarrow ? 'Salir' : undefined}
          className={`flex w-full items-center rounded-lg py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-800 ${
            isNarrow ? 'justify-center px-0' : 'gap-3 px-3'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">logout</span>
          {!isNarrow && <span>Salir</span>}
        </button>
      </div>
    </aside>
  );
}

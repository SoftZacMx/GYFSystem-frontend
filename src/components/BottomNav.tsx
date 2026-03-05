import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isStaffRole } from '@/types/auth';

const allItems = [
  { to: '/', label: 'Inicio', icon: 'home', staffOnly: false },
  { to: '/users', label: 'Usuarios', icon: 'group', staffOnly: true },
  { to: '/students', label: 'Estudiantes', icon: 'school', staffOnly: false },
  { to: '/documents', label: 'Documentos', icon: 'description', staffOnly: false },
  { to: '/events', label: 'Eventos', icon: 'event', staffOnly: false },
  { to: '/more', label: 'Más', icon: 'apps', staffOnly: true },
];

export function BottomNav() {
  const { user } = useAuth();
  const staff = user ? isStaffRole(user.roleId) : false;
  const items = staff ? allItems : allItems.filter((item) => !item.staffOnly);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around border-t border-slate-200 bg-white py-2 font-display">
      {items.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            'flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium transition ' +
            (isActive ? 'text-primary' : 'text-slate-500 hover:text-slate-700')
          }
        >
          <span className="material-symbols-outlined text-[26px]">{icon}</span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

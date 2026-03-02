import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ThemePicker } from '@/components/ThemePicker';
import { BottomNav } from '@/components/BottomNav';

export function Layout() {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-[#f6f7f8] font-display">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-slate-50 px-4">
        <div className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-amber-100">
          <span className="material-symbols-outlined text-amber-600 text-xl">person</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemePicker />
          <Link to="/notifications" className="flex size-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-200" aria-label="Notificaciones">
            <span className="material-symbols-outlined">notifications</span>
          </Link>
          <button type="button" onClick={logout} className="hidden text-sm font-medium text-slate-600 hover:text-slate-800 sm:block">
            Salir
          </button>
        </div>
      </header>
      <main className="pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

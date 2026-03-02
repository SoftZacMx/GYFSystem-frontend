import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';

const SIDEBAR_COLLAPSED_KEY = 'sidebar-collapsed';

function getStoredCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(getStoredCollapsed);

  const handleToggleCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {}
      return next;
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f7f8] font-display">
      {/* Sidebar: ocupa todo el alto de la vista */}
      <div
        className={`hidden h-full shrink-0 md:block ${
          sidebarCollapsed ? 'md:w-[5.5rem]' : 'md:w-64'
        }`}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
          collapsible
        />
      </div>
      {/* Mobile: drawer */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
          <div className="fixed inset-y-0 left-0 z-50 h-full w-64 md:hidden">
            <Sidebar onClose={() => setSidebarOpen(false)} collapsible={false} />
          </div>
        </>
      )}
      {/* Área de contenido: se actualiza con cada ruta (Outlet) */}
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="z-10 flex h-14 shrink-0 items-center border-b border-slate-200 bg-white px-4 md:border-l">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex size-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Abrir menú"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
          <div className="flex-1 md:flex-none" />
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

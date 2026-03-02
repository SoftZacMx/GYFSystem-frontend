import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isStaffRole } from '@/types/auth';
import { fetchStudents } from '@/services/students.service';
import { fetchUsers } from '@/services/users.service';
import { fetchEvents } from '@/services/events.service';
import { fetchDocuments } from '@/services/documents.service';
import { StatCard } from '@/components/StatCard';

const PRIMARY = '#136dec';

function fileNameFromUrl(url: string): string {
  try {
    const segment = url.split('/').filter(Boolean).pop();
    return segment ? decodeURIComponent(segment) : 'Documento';
  } catch {
    return 'Documento';
  }
}

export function DashboardPage() {
  const { user } = useAuth();
  const staff = user ? isStaffRole(user.roleId) : false;
  const [stats, setStats] = useState({ students: 0, users: 0, events: 0 });
  const [recentDocs, setRecentDocs] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const basePromises = [
      fetchEvents({ page: 1, limit: 1 }),
      fetchDocuments({ page: 1, limit: 5, order: 'desc' }),
    ];
    const promises = staff
      ? [fetchStudents({ page: 1, limit: 1 }), fetchUsers({ page: 1, limit: 1 }), ...basePromises]
      : basePromises;
    Promise.all(promises)
      .then((results) => {
        if (cancelled) return;
        const eventsRes = results[staff ? 2 : 0] as { data: unknown[]; meta?: { total?: number } };
        const docsRes = results[staff ? 3 : 1] as { data: { id: number; fileUrl: string }[] };
        setStats({
          students: staff ? (results[0] as { meta?: { total?: number }; data?: unknown[] }).meta?.total ?? (results[0] as { data?: unknown[] }).data?.length ?? 0 : 0,
          users: staff ? (results[1] as { meta?: { total?: number }; data?: unknown[] }).meta?.total ?? (results[1] as { data?: unknown[] }).data?.length ?? 0 : 0,
          events: eventsRes.meta?.total ?? eventsRes.data?.length ?? 0,
        });
        setRecentDocs(
          (docsRes.data ?? []).map((doc) => ({
            id: doc.id,
            name: fileNameFromUrl(doc.fileUrl),
          }))
        );
      })
      .catch(() => {
        if (!cancelled) setRecentDocs([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [staff]);

  const chartData = [40, 75, 60, 85, 50];

  const statCards = useMemo(() => {
    const cards: Array<{
      label: string;
      value: string | number;
      trend?: string;
      trendUp?: boolean;
      config: { icon: string; iconBg: string };
    }> = [];
    if (staff) {
      cards.push(
        {
          label: 'Estudiantes',
          value: loading ? '...' : stats.students,
          trend: '+3%',
          trendUp: true,
          config: { icon: 'group', iconBg: '#dbeafe' },
        },
        {
          label: 'Usuarios activos',
          value: loading ? '...' : stats.users,
          config: { icon: 'person_check', iconBg: '#d1fae5' },
        },
      );
    }
    cards.push({
      label: 'Eventos',
      value: loading ? '...' : String(stats.events).padStart(2, '0'),
      config: { icon: 'event', iconBg: '#e9d5ff' },
    });
    return cards;
  }, [staff, loading, stats.students, stats.users, stats.events]);

  return (
    <div className="min-h-full bg-[#f6f7f8] font-display">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-slate-600">
          Gestiona documentos y registros escolares
        </p>

        <div className={`mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 ${staff ? 'lg:grid-cols-4' : 'lg:grid-cols-1'}`}>
          {statCards.map((card) => (
            <StatCard
              key={card.label}
              label={card.label}
              value={card.value}
              trend={card.trend}
              trendUp={card.trendUp}
              config={card.config}
            />
          ))}
        </div>

        <section className="mt-8">
          <h2 className="text-lg font-bold text-slate-800">Acciones rápidas</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            {staff && (
              <Link
                to="/students"
                className="flex items-center gap-2 rounded-xl px-5 py-3 text-white font-medium shadow-sm transition hover:opacity-90"
                style={{ backgroundColor: PRIMARY }}
              >
                <span className="material-symbols-outlined">person_add</span>
                Añadir estudiante
              </Link>
            )}
            <Link
              to="/documents"
              className="flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-3 font-medium text-white shadow-sm transition hover:opacity-90"
            >
              <span className="material-symbols-outlined">upload_file</span>
              Subir archivo
            </Link>
            <Link
              to="/notifications"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <span className="material-symbols-outlined">mail</span>
              Notificaciones
            </Link>
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Estado de verificación</h2>
            <span className="text-sm text-slate-500">Esta semana</span>
          </div>
          <div className="mt-6 flex items-end justify-between gap-2">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie'].map((day, i) => (
              <div key={day} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full max-w-[48px] rounded-t transition"
                  style={{
                    height: chartData[i] ? `${chartData[i]}%` : '20%',
                    minHeight: 24,
                    backgroundColor: i % 2 === 0 ? '#93c5fd' : PRIMARY,
                  }}
                />
                <span className="text-xs text-slate-500">{day}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Subidas recientes</h2>
            <Link to="/documents" className="text-sm font-medium" style={{ color: PRIMARY }}>
              Ver todo
            </Link>
          </div>
          <ul className="mt-4 max-h-48 space-y-2 overflow-y-auto">
            {loading ? (
              <li className="text-sm text-slate-500">Cargando...</li>
            ) : recentDocs.length === 0 ? (
              <li className="text-sm text-slate-500">No hay subidas recientes</li>
            ) : (
              recentDocs.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center gap-3 rounded-lg border border-slate-100 py-2 px-3"
                >
                  <span className="material-symbols-outlined text-2xl text-amber-500">description</span>
                  <span className="truncate text-sm font-medium text-slate-800">{doc.name}</span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

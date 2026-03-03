import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isStaffRole } from '@/types/auth';
import { fetchDashboard } from '@/services/dashboard.service';
import { fetchMyStudents } from '@/services/students.service';
import { StatCard } from '@/components/StatCard';

const PRIMARY = '#136dec';

export function DashboardPage() {
  const { user } = useAuth();
  const staff = user ? isStaffRole(user.roleId) : false;
  const isAdmin = user?.roleId === 1;
  const [stats, setStats] = useState({ students: 0, users: 0, events: 0 });
  const [recentDocs, setRecentDocs] = useState<{ id: number; name: string }[]>([]);
  const [chartData, setChartData] = useState<{ grade: string; totalStudents: number; studentsWithAllCategories: number }[]>([]);
  const [myStudents, setMyStudents] = useState<{ id: number; fullName: string; grade?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMyStudents, setLoadingMyStudents] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchDashboard()
      .then((data) => {
        if (cancelled) return;
        setStats(data.stats);
        setRecentDocs(data.recentDocs);
        setChartData(data.chartData);
      })
      .catch(() => {
        if (!cancelled) {
          setRecentDocs([]);
          setChartData([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!user || isAdmin) return;
    let cancelled = false;
    setLoadingMyStudents(true);
    fetchMyStudents()
      .then((list) => {
        if (cancelled) return;
        setMyStudents(list.map((s) => ({ id: s.id, fullName: s.fullName, grade: s.grade })));
      })
      .catch(() => {
        if (!cancelled) setMyStudents([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingMyStudents(false);
      });
    return () => { cancelled = true; };
  }, [user, isAdmin]);

  const chartMax = useMemo(() => {
    if (chartData.length === 0) return 1;
    return Math.max(...chartData.map((d) => d.studentsWithAllCategories), 1);
  }, [chartData]);

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

        <div className={`mt-8 grid gap-4 ${staff ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 lg:grid-cols-2'}`}>
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
          {!isAdmin && (
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:min-h-0">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Alumnos asignados</h2>
                <Link to="/students" className="text-sm font-medium" style={{ color: PRIMARY }}>
                  Ver todos
                </Link>
              </div>
              <ul className="mt-4 max-h-56 space-y-2 overflow-y-auto">
                {loadingMyStudents ? (
                  <li className="py-4 text-center text-sm text-slate-500">Cargando...</li>
                ) : myStudents.length === 0 ? (
                  <li className="py-4 text-center text-sm text-slate-500">No tienes alumnos asignados</li>
                ) : (
                  myStudents.map((s) => (
                    <li key={s.id}>
                      <Link
                        to={`/students/${s.id}`}
                        className="flex items-center gap-3 rounded-lg border border-slate-100 py-2.5 px-3 transition hover:bg-slate-50"
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 font-semibold">
                          {s.fullName.trim().slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-slate-800">{s.fullName}</p>
                          {s.grade && <p className="text-xs text-slate-500">{s.grade}</p>}
                        </div>
                        <span className="material-symbols-outlined text-slate-400 text-xl">chevron_right</span>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </section>
          )}
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

        {isAdmin && (
          <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Alumnos con todos los documentos por grupo</h2>
              <span className="text-sm text-slate-500">Por categoría</span>
            </div>
            <div className="mt-6 flex items-end justify-between gap-2">
              {loading ? (
                <p className="py-4 text-center text-sm text-slate-500 w-full">Cargando...</p>
              ) : chartData.length === 0 ? (
                <p className="py-4 text-center text-sm text-slate-500 w-full">No hay datos por grupo</p>
              ) : (
                chartData.map((d, i) => (
                  <div key={d.grade} className="flex flex-1 flex-col items-center gap-1 min-w-0">
                    <div
                      className="w-full max-w-[48px] rounded-t transition"
                      style={{
                        height: `${(d.studentsWithAllCategories / chartMax) * 100}%`,
                        minHeight: d.studentsWithAllCategories > 0 ? 24 : 4,
                        backgroundColor: i % 2 === 0 ? '#93c5fd' : PRIMARY,
                      }}
                    />
                    <span className="text-xs text-slate-500 truncate w-full text-center" title={d.grade}>
                      {d.grade}
                    </span>
                    <span className="text-xs font-medium text-slate-600">
                      {d.studentsWithAllCategories}/{d.totalStudents}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {isAdmin && (
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
        )}
      </div>
    </div>
  );
}

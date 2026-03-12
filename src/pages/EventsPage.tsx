import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { confirmDelete } from '@/lib/confirmDelete';
import type { EventDto } from '@/types/entities';
import { ApiError } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import { fetchEvents, createEvent, updateEvent, deleteEvent } from '@/services/events.service';

const WEEKDAYS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

type ViewTab = 'calendar' | 'list' | 'pending';

function formatEventDate(d: string): string {
  const date = new Date(d);
  const day = date.getDate().toString().padStart(2, '0');
  const month = MONTHS[date.getMonth()].slice(0, 3).toUpperCase();
  return `${day} ${month}`;
}

function formatEventTime(d: string): string {
  return new Date(d).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getDaysInMonth(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = first.getDay();
  const days: (number | null)[] = Array(startPad).fill(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(d);
  return days;
}

/** Bar color for event cards: primary, accent (tema), then amber */
function getEventBarColorClass(index: number): string {
  const classes = ['bg-primary', 'bg-accent', 'bg-amber-500'];
  return classes[index % 3];
}

export function EventsPage() {
  const { user } = useAuth();
  const canManageEvents = user?.roleId === 1;
  const [data, setData] = useState<EventDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<ViewTab>('calendar');
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [saving, setSaving] = useState(false);

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

  const todayKey = useMemo(() => toDateKey(new Date()), []);
  const selectedKey = useMemo(() => toDateKey(selectedDate), [selectedDate]);

  const datesWithEvents = useMemo(() => {
    const set = new Set<string>();
    data.forEach((ev) => set.add(toDateKey(new Date(ev.eventDate))));
    return set;
  }, [data]);

  const eventsForSelectedDay = useMemo(() => {
    return data
      .filter((ev) => toDateKey(new Date(ev.eventDate)) === selectedKey)
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  }, [data, selectedKey]);

  const pendingEvents = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return data
      .filter((ev) => new Date(ev.eventDate) >= start)
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  }, [data]);

  const prevMonth = () => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1));
  const nextMonth = () => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1));

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

  const displayEvents = tab === 'calendar' ? eventsForSelectedDay : tab === 'pending' ? pendingEvents : data;
  const displayTitle =
    tab === 'calendar' ? `Eventos del ${selectedDate.getDate()} de ${MONTHS[selectedDate.getMonth()]}` : tab === 'pending' ? 'Eventos pendientes' : 'Todos los eventos';

  return (
    <div className="min-h-full bg-muted font-display">
      <div className="border-b border-slate-200 bg-white px-4 pb-3 pt-4">
        <h1 className="text-center text-xl font-bold tracking-tight text-slate-800">Gestión de eventos</h1>
        <div className="mt-3 flex gap-6 border-b border-slate-200">
          {(
            [
              { id: 'calendar' as ViewTab, label: 'Calendario' },
              { id: 'list' as ViewTab, label: 'Vista lista' },
              { id: 'pending' as ViewTab, label: 'Pendientes' },
            ] as const
<<<<<<< HEAD
          ).map((item) => {
            const { id, label } = item;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className="relative pb-3 pt-1 text-sm font-medium transition"
                style={{ color: tab === id ? APP_PRIMARY : '#64748b' }}
              >
                {label}
                {tab === id && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ backgroundColor: APP_PRIMARY }}
                  />
                )}
              </button>
            );
          })}
=======
          ).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`relative pb-3 pt-1 text-sm font-medium transition ${tab === id ? 'text-primary' : 'text-slate-500'}`}
            >
              {label}
              {tab === id && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary"
                />
              )}
            </button>
          ))}
>>>>>>> b4633f12d8e7a7fdca264343ea910c37926967c1
        </div>
      </div>

      <div className="p-4 md:mx-auto md:max-w-4xl md:p-6 lg:max-w-5xl">
        {tab === 'calendar' && (
          <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={prevMonth}
                className="flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined text-xl">chevron_left</span>
              </button>
              <span className="text-sm font-semibold text-slate-800">
                {MONTHS[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {WEEKDAYS.map((wd) => (
                <div key={wd} className="py-1 text-xs font-medium text-slate-500">
                  {wd}
                </div>
              ))}
              {getDaysInMonth(calendarMonth.getFullYear(), calendarMonth.getMonth()).map((day, i) => {
                if (day === null)
                  return <div key={`pad-${i}`} />;
                const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                const key = toDateKey(date);
                const isSelected = key === selectedKey;
                const isToday = key === todayKey;
                const hasEvents = datesWithEvents.has(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedDate(date);
                      setCalendarMonth(date);
                    }}
                    className="flex flex-col items-center gap-0.5 py-2 text-sm"
                  >
                    <span
                      className={`flex size-8 items-center justify-center rounded-full ${
                        isSelected ? 'bg-primary text-primary-foreground' : isToday ? 'bg-primary/20 font-semibold text-primary' : 'text-slate-700'
                      }`}
                    >
                      {day}
                    </span>
                    {hasEvents && (
                      <span className="size-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">{displayTitle}</h2>
            <span className="text-sm font-medium text-primary">
              {displayEvents.length} activos
            </span>
          </div>

          {loading ? (
            <p className="py-8 text-center text-slate-500">Cargando...</p>
          ) : displayEvents.length === 0 ? (
            <p className="py-8 text-center text-slate-500">No hay eventos</p>
          ) : (
            <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-2">
              {displayEvents.map((ev, index) => {
                const barClass = getEventBarColorClass(index);
                return (
                  <div
                    key={ev.id}
                    className="flex rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                  >
                    <div className={`w-1 shrink-0 ${barClass}`} />
                    <div className="min-w-0 flex-1 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`text-xs font-semibold uppercase ${barClass.replace('bg-', 'text-')}`}>
                            {formatEventDate(ev.eventDate)}
                          </p>
                          <h3 className="mt-0.5 font-semibold text-slate-800">{ev.title}</h3>
                        </div>
                        {canManageEvents && (
                          <button
                            type="button"
                            onClick={() => openEdit(ev)}
                            className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            aria-label="Opciones"
                          >
                            <span className="material-symbols-outlined text-xl">more_vert</span>
                          </button>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-lg">schedule</span>
                          {formatEventTime(ev.eventDate)}
                        </span>
                      </div>
                      {ev.description && (
                        <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">{ev.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {canManageEvents && (
        <button
          type="button"
          onClick={openCreate}
          className="fixed bottom-20 right-4 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:opacity-90 active:scale-95 md:bottom-8"
          aria-label="Nuevo evento"
        >
          <span className="material-symbols-outlined text-3xl">edit_calendar</span>
        </button>
      )}

      {canManageEvents && showCreate && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowCreate(false)}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-bold text-slate-800">{editingId == null ? 'Nuevo evento' : 'Editar evento'}</h3>
            <form onSubmit={handleSubmit}>
              <label className="mb-2 block text-sm font-medium text-slate-700">Título</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mb-4 w-full rounded-xl border border-input bg-white px-3 py-2 text-slate-800 focus:outline-0 focus:ring-2 focus:ring-primary/30"
                required
              />
              <label className="mb-2 block text-sm font-medium text-slate-700">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mb-4 w-full rounded-xl border border-input bg-white px-3 py-2 text-slate-800 focus:outline-0 focus:ring-2 focus:ring-primary/30"
                rows={3}
              />
              <label className="mb-2 block text-sm font-medium text-slate-700">Fecha y hora</label>
              <input
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="mb-6 w-full rounded-xl border border-input bg-white px-3 py-2 text-slate-800 focus:outline-0 focus:ring-2 focus:ring-primary/30"
                required
              />
              <div className="flex justify-end gap-2">
                {editingId != null && (
                  <button
                    type="button"
                    onClick={() => {
                      confirmDelete({
                        message: '¿Eliminar este evento?',
                        execute: () =>
                          deleteEvent(editingId).then(() => {
                            setShowCreate(false);
                            load();
                          }),
                        successMessage: 'Evento eliminado',
                        errorMessage: 'Error al eliminar',
                      });
                    }}
                    className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600"
                  >
                    Eliminar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl px-4 py-2 text-sm font-medium bg-primary text-primary-foreground disabled:opacity-70"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

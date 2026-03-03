import { useEffect, useState, useMemo } from 'react';
import type { StudentDto, UserDto } from '@/types/entities';
import { fetchStudents, fetchMyStudents } from '@/services/students.service';
import { fetchUsers } from '@/services/users.service';
import { FilterPills } from '@/components/ListScreenLayout';

const GRADE_COLORS: Record<string, string> = {
  '1': 'bg-blue-100 text-blue-800',
  '2': 'bg-emerald-100 text-emerald-800',
  '3': 'bg-amber-100 text-amber-800',
  '4': 'bg-violet-100 text-violet-800',
  '5': 'bg-rose-100 text-rose-800',
  '6': 'bg-cyan-100 text-cyan-800',
};
const defaultGradeStyle = 'bg-slate-100 text-slate-700';

function getGradeStyle(grade: string): string {
  const num = grade.replace(/\D/g, '').slice(0, 1);
  return GRADE_COLORS[num] ?? defaultGradeStyle;
}

export type SelectEntityKind = 'student' | 'user';

export interface SelectEntityDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (id: number, item: StudentDto | UserDto) => void;
  title: string;
  /** 'student' = selector de alumnos, 'user' = selector de usuarios */
  entity: SelectEntityKind;
  /** Si es admin se consulta listado completo; si no, solo entidades asociadas al usuario (solo aplica a student) */
  isAdmin: boolean;
  /** IDs a excluir de la lista (ej. ya vinculados) */
  excludeIds?: number[];
}

export function SelectEntityDialog({
  open,
  onClose,
  onSelect,
  title,
  entity,
  isAdmin,
  excludeIds = [],
}: SelectEntityDialogProps) {
  const [list, setList] = useState<StudentDto[] | UserDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string | 'all'>('all');

  useEffect(() => {
    if (!open) return;
    setSearch('');
    setGradeFilter('all');
    setLoading(true);
    if (entity === 'student') {
      if (isAdmin) {
        fetchStudents({ page: 1, limit: 100 })
          .then((r) => setList(r.data))
          .catch(() => setList([]))
          .finally(() => setLoading(false));
      } else {
        fetchMyStudents()
          .then(setList)
          .catch(() => setList([]))
          .finally(() => setLoading(false));
      }
    } else {
      fetchUsers({ limit: 500 })
        .then((r) => setList(r.data))
        .catch(() => setList([]))
        .finally(() => setLoading(false));
    }
  }, [open, entity, isAdmin]);

  const excludeSet = useMemo(() => new Set(excludeIds), [excludeIds]);

  const filtered = useMemo(() => {
    let items = list.filter((item) => !excludeSet.has(item.id));
    if (entity === 'student') {
      const students = items as StudentDto[];
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        items = students.filter(
          (s) =>
            s.fullName.toLowerCase().includes(q) ||
            (s.curp && s.curp.toLowerCase().includes(q))
        ) as StudentDto[];
      }
      if (gradeFilter !== 'all') {
        items = (items as StudentDto[]).filter((s) => s.grade === gradeFilter) as StudentDto[];
      }
      return items as StudentDto[];
    }
    const users = items as UserDto[];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      ) as UserDto[];
    }
    return users as UserDto[];
  }, [list, excludeSet, entity, search, gradeFilter]);

  const grades = useMemo(() => {
    if (entity !== 'student') return [];
    const set = new Set((list as StudentDto[]).map((s) => s.grade).filter(Boolean));
    return Array.from(set).sort().map((g) => ({ id: g, label: g }));
  }, [entity, list]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-md flex-col rounded-2xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
        <div className="flex flex-col overflow-hidden p-4">
          <div className="relative mb-3">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
              search
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                entity === 'student'
                  ? 'Buscar por nombre o CURP...'
                  : 'Buscar por nombre o email...'
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-slate-800 placeholder:text-slate-400 focus:outline-0 focus:ring-2 focus:ring-[#136dec]/30"
            />
          </div>
          {entity === 'student' && grades.length > 0 && (
            <div className="mb-3">
              <FilterPills
                options={grades}
                activeId={gradeFilter === 'all' ? 'all' : gradeFilter}
                onChange={(id) => setGradeFilter(id === 'all' ? 'all' : id)}
                labelAll="Todos los grados"
              />
            </div>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-slate-200">
            {loading ? (
              <p className="py-8 text-center text-sm text-slate-500">Cargando...</p>
            ) : filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                {entity === 'student' ? 'No hay estudiantes' : 'No hay usuarios'}
              </p>
            ) : entity === 'student' ? (
              <ul className="divide-y divide-slate-100">
                {(filtered as StudentDto[]).map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(s.id, s);
                        onClose();
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 font-semibold">
                        {s.fullName.slice(0, 1)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-800">{s.fullName}</p>
                        <p className="text-xs text-slate-500">
                          {s.curp} · {s.grade}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${getGradeStyle(s.grade)}`}
                      >
                        {s.grade}
                      </span>
                      <span className="material-symbols-outlined text-slate-400 text-xl">
                        chevron_right
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="divide-y divide-slate-100">
                {(filtered as UserDto[]).map((u) => (
                  <li key={u.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(u.id, u);
                        onClose();
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 font-semibold">
                        {u.name.trim().slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="font-medium text-slate-800">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                      <span className="material-symbols-outlined text-slate-400 text-xl">
                        chevron_right
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { confirmDelete } from '@/lib/confirmDelete';
import type { StudentDto } from '@/types/entities';
import { ApiError } from '@/types/api';
import { fetchStudents, fetchMyStudents, fetchStudentById, deleteStudent } from '@/services/students.service';
import { ListScreenLayout, FilterPills, ListCard } from '@/components/ListScreenLayout';
import { PaginationBar } from '@/components/PaginationBar';
import type { ListMeta } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';

const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = [10, 20, 50];
const GRADE_COLORS: Record<string, string> = {
  '1': 'bg-blue-100 text-blue-800',
  '2': 'bg-emerald-100 text-emerald-800',
  '3': 'bg-amber-100 text-amber-800',
  '4': 'bg-violet-100 text-violet-800',
  '5': 'bg-rose-100 text-rose-800',
  '6': 'bg-cyan-100 text-cyan-800',
};
const defaultGradeStyle = 'bg-slate-100 text-slate-700';

export function StudentsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.roleId === 1;
  const [data, setData] = useState<StudentDto[]>([]);
  const [meta, setMeta] = useState<ListMeta | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string | 'all'>('all');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [filesDialogStudent, setFilesDialogStudent] = useState<StudentDto | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    if (isAdmin) {
      fetchStudents({ page, limit: pageSize })
        .then((res) => {
          if (cancelled) return;
          setData(res.data);
          setMeta(res.meta ?? null);
          setPage(res.meta?.page ?? 1);
        })
        .catch((err) => {
          if (!cancelled) toast.error(err instanceof ApiError ? err.message : 'Error al cargar');
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else {
      fetchMyStudents()
        .then((list) => {
          if (cancelled) return;
          setData(list);
          setMeta(null);
          const needsEnrich =
            list.length > 0 &&
            (list[0].totalUploadFiles == null || !Array.isArray(list[0].files));
          if (needsEnrich) {
            Promise.all(list.map((s) => fetchStudentById(s.id)))
              .then((fullList) => {
                if (cancelled) return;
                setData(fullList);
              })
              .catch((err) => {
                if (!cancelled) toast.error(err instanceof ApiError ? err.message : 'Error al cargar detalle');
              });
          }
        })
        .catch((err) => {
          if (!cancelled) toast.error(err instanceof ApiError ? err.message : 'Error al cargar');
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }
    return () => { cancelled = true; };
  }, [isAdmin, page, pageSize]);

  const grades = useMemo(() => {
    const set = new Set(data.map((s) => s.grade).filter(Boolean));
    return Array.from(set).sort().map((g) => ({ id: g, label: g }));
  }, [data]);

  const filtered = useMemo(() => {
    let list = data;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((s) => s.fullName.toLowerCase().includes(q) || s.curp?.toLowerCase().includes(q));
    }
    if (gradeFilter !== 'all') list = list.filter((s) => s.grade === gradeFilter);
    return list;
  }, [data, search, gradeFilter]);

  const total = meta?.total ?? (isAdmin ? 0 : data.length);

  const handleDelete = (s: StudentDto) => {
    confirmDelete({
      message: `¿Eliminar a ${s.fullName}?`,
      execute: () => {
        setDeletingId(s.id);
        return deleteStudent(s.id)
          .then(() => {
            if (isAdmin) {
              return fetchStudents({ page, limit: pageSize }).then((res) => {
                setData(res.data);
                setMeta(res.meta ?? null);
                setPage(res.meta?.page ?? 1);
              });
            }
            return fetchMyStudents().then(setData);
          })
          .finally(() => setDeletingId(null));
      },
      successMessage: 'Estudiante eliminado',
      errorMessage: 'Error al eliminar',
    });
  };

  const getGradeStyle = (g: string) => {
    const num = g.replace(/\D/g, '').slice(0, 1);
    return GRADE_COLORS[num] ?? defaultGradeStyle;
  };

  return (
    <ListScreenLayout
      title="Estudiantes"
      icon="school"
      searchPlaceholder="Buscar estudiantes..."
      searchValue={search}
      onSearchChange={setSearch}
      filters={
        <FilterPills
          options={grades}
          activeId={gradeFilter === 'all' ? 'all' : gradeFilter}
          onChange={(id) => setGradeFilter(id === 'all' ? 'all' : id)}
          labelAll="Todos los grados"
        />
      }
      fab={isAdmin}
      onFabClick={isAdmin ? () => navigate('/students/new') : undefined}
    >
      {loading ? (
        <p className="py-8 text-center text-slate-500">Cargando...</p>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-slate-500">No hay estudiantes</p>
      ) : (
        <>
          <div className="space-y-3">
            {filtered.map((s) => (
              <ListCard
                key={s.id}
                to={`/students/${s.id}`}
                avatar={<span className="text-lg font-semibold">{s.fullName.slice(0, 1)}</span>}
                title={s.fullName}
                subtitle={
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getGradeStyle(s.grade)}`}>
                    {s.grade}
                  </span>
                }
                meta={
                  <>
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">badge</span>
                      {s.curp}
                      {s.status?.toLowerCase() === 'active' || s.status?.toLowerCase() === 'activo' ? (
                        <span className="flex size-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600" title="Activo">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                        </span>
                      ) : (
                        <span className="flex size-5 items-center justify-center rounded-full bg-slate-200 text-slate-500" title="Inactivo">
                          <span className="material-symbols-outlined text-sm">cancel</span>
                        </span>
                      )}
                    </span>
                    {s.totalUploadFiles != null && s.totalPendingFiles != null && (
                      <span className="flex items-center gap-1.5">
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700" title="Archivos cargados">
                          {s.totalUploadFiles} cargados
                        </span>
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700" title="Archivos pendientes">
                          {s.totalPendingFiles} pendientes
                        </span>
                      </span>
                    )}
                    {Array.isArray(s.files) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setFilesDialogStudent(s);
                        }}
                        className="flex size-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                        title="Ver archivos cargados"
                        aria-label="Ver archivos"
                      >
                        <span className="material-symbols-outlined text-lg">folder_open</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(`/documents?studentId=${s.id}`);
                      }}
                      className="flex items-center gap-1 font-medium text-primary hover:underline"
                    >
                      <span className="material-symbols-outlined text-base">upload_file</span>
                      Subir documento
                    </button>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(s);
                        }}
                        className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                        title="Eliminar"
                        aria-label="Eliminar"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    )}
                  </>
                }
              />
            ))}
          </div>
          {isAdmin && total > 0 && meta && (
            <PaginationBar
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={(p) => setPage(Math.max(1, Math.min(meta?.totalPages ?? 1, p)))}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
            />
          )}
        </>
      )}

      {filesDialogStudent && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setFilesDialogStudent(null)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-md flex-col rounded-2xl border border-slate-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <h3 className="text-lg font-bold text-slate-800">
                Archivos · {filesDialogStudent.fullName}
              </h3>
              <button
                type="button"
                onClick={() => setFilesDialogStudent(null)}
                className="flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Cerrar"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <ul className="min-h-0 flex-1 overflow-y-auto p-4">
              {filesDialogStudent.files.length === 0 ? (
                <li className="py-4 text-center text-sm text-slate-500">Sin categorías definidas</li>
              ) : (
                filesDialogStudent.files.map((f) => (
                  <li
                    key={f.category}
                    className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-0"
                  >
                    <span className="font-medium text-slate-800">{f.category}</span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        f.isUpload ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {f.isUpload ? 'Cargado' : 'Pendiente'}
                    </span>
                  </li>
                ))
              )}
            </ul>
            <div className="border-t border-slate-200 p-3 text-center text-xs text-slate-500">
              {filesDialogStudent.totalUploadFiles} cargados · {filesDialogStudent.totalPendingFiles} pendientes
            </div>
          </div>
        </div>
      )}
    </ListScreenLayout>
  );
}

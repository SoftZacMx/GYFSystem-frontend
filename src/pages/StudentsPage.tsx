import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { StudentDto } from '@/types/entities';
import { ApiError } from '@/types/api';
import { fetchStudents, deleteStudent } from '@/services/students.service';
import { ListScreenLayout, FilterPills, ListCard } from '@/components/ListScreenLayout';
import { PaginationBar } from '@/components/PaginationBar';
import type { ListMeta } from '@/types/api';

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
  const [data, setData] = useState<StudentDto[]>([]);
  const [meta, setMeta] = useState<ListMeta | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string | 'all'>('all');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
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
    return () => { cancelled = true; };
  }, [page, pageSize]);

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

  const total = meta?.total ?? 0;

  const handleDelete = (s: StudentDto) => {
    if (!window.confirm(`¿Eliminar a ${s.fullName}?`)) return;
    setDeletingId(s.id);
    deleteStudent(s.id)
      .then(() => {
        toast.success('Estudiante eliminado');
        return fetchStudents({ page, limit: pageSize });
      })
      .then((res) => {
        setData(res.data);
        setMeta(res.meta ?? null);
        setPage(res.meta?.page ?? 1);
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Error al eliminar'))
      .finally(() => setDeletingId(null));
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
      fab
      onFabClick={() => navigate('/students/new')}
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
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">badge</span>
                      {s.curp}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(`/documents?studentId=${s.id}`);
                      }}
                      className="flex items-center gap-1 font-medium text-[#136dec] hover:underline"
                    >
                      <span className="material-symbols-outlined text-base">upload_file</span>
                      Subir documento
                    </button>
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
                  </>
                }
              />
            ))}
          </div>
          {total > 0 && (
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
    </ListScreenLayout>
  );
}

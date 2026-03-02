import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import type { StudentDto, ParentOfStudentDto, DocumentDto, DocumentCategoryDto } from '@/types/entities';
import { ApiError } from '@/types/api';
import { fetchStudentById, updateStudent, deleteStudent } from '@/services/students.service';
import { fetchParentsByStudentId, associateParentStudent, disassociateParentStudent } from '@/services/parent-students.service';
import { fetchUsers } from '@/services/users.service';
import { fetchDocuments, deleteDocument, downloadDocument } from '@/services/documents.service';
import { fetchDocumentCategories } from '@/services/document-categories.service';
import type { UserDto } from '@/types/entities';

const PRIMARY = '#136dec';

function fileNameFromUrl(url: string): string {
  try {
    const segment = url.split('/').filter(Boolean).pop();
    return segment ? decodeURIComponent(segment) : 'Documento';
  } catch {
    return 'Documento';
  }
}

export function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentDto | null>(null);
  const [parents, setParents] = useState<ParentOfStudentDto[]>([]);
  const [documents, setDocuments] = useState<DocumentDto[]>([]);
  const [categories, setCategories] = useState<DocumentCategoryDto[]>([]);
  const [allUsers, setAllUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [curp, setCurp] = useState('');
  const [grade, setGrade] = useState('');
  const [status, setStatus] = useState('active');
  const [saving, setSaving] = useState(false);
  const [showAssociate, setShowAssociate] = useState(false);
  const [associateUserId, setAssociateUserId] = useState<number | ''>('');
  const [associating, setAssociating] = useState(false);
  const [disassociatingId, setDisassociatingId] = useState<number | null>(null);
  const [downloadingDocId, setDownloadingDocId] = useState<number | null>(null);

  const studentId = id != null ? parseInt(id, 10) : NaN;

  useEffect(() => {
    if (Number.isNaN(studentId)) return;
    setLoading(true);
    Promise.all([
      fetchStudentById(studentId),
      fetchParentsByStudentId(studentId),
      fetchDocuments({ studentId, limit: 50 }),
      fetchDocumentCategories(),
    ])
      .then(([s, p, docRes, cat]) => {
        setStudent(s);
        setParents(p);
        setDocuments(docRes.data);
        setCategories(cat);
        setFullName(s.fullName);
        setCurp(s.curp);
        setGrade(s.grade);
        setStatus(s.status);
      })
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : 'Error al cargar');
        navigate('/students');
      })
      .finally(() => setLoading(false));
  }, [studentId, navigate]);

  useEffect(() => {
    fetchUsers({ limit: 500 }).then((r) => setAllUsers(r.data)).catch(() => {});
  }, []);

  const getCategoryName = (categoryId: number) =>
    categories.find((c) => c.id === categoryId)?.name ?? 'Documento';

  const loadDocuments = () => {
    fetchDocuments({ studentId, limit: 50 }).then((res) => setDocuments(res.data)).catch(() => {});
  };

  const handleDownloadDocument = (doc: DocumentDto) => {
    setDownloadingDocId(doc.id);
    downloadDocument(doc.id, fileNameFromUrl(doc.fileUrl))
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Error al descargar'))
      .finally(() => setDownloadingDocId(null));
  };

  const handleDeleteDocument = (doc: DocumentDto) => {
    if (!window.confirm('¿Eliminar este documento?')) return;
    deleteDocument(doc.id)
      .then(() => {
        toast.success('Documento eliminado');
        loadDocuments();
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Error al eliminar'));
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number.isNaN(studentId) || !fullName.trim() || !curp.trim() || !grade.trim()) return;
    setSaving(true);
    updateStudent(studentId, { fullName: fullName.trim(), curp: curp.trim(), grade: grade.trim(), status })
      .then((s) => {
        setStudent(s);
        setEditing(false);
        toast.success('Estudiante actualizado');
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Error al guardar'))
      .finally(() => setSaving(false));
  };

  const handleDelete = () => {
    if (Number.isNaN(studentId) || !window.confirm('¿Eliminar este estudiante?')) return;
    deleteStudent(studentId)
      .then(() => {
        toast.success('Estudiante eliminado');
        navigate('/students');
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Error al eliminar'));
  };

  const handleAssociate = (e: React.FormEvent) => {
    e.preventDefault();
    if (associateUserId === '') return;
    setAssociating(true);
    associateParentStudent({ userId: associateUserId, studentId })
      .then(() => {
        toast.success('Padre/tutor asociado');
        setShowAssociate(false);
        setAssociateUserId('');
        fetchParentsByStudentId(studentId).then(setParents);
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Error al asociar'))
      .finally(() => setAssociating(false));
  };

  const handleDisassociate = (userId: number) => {
    if (!window.confirm('¿Desasociar este padre/tutor?')) return;
    setDisassociatingId(userId);
    disassociateParentStudent(userId, studentId)
      .then(() => {
        toast.success('Desasociado');
        fetchParentsByStudentId(studentId).then(setParents);
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Error'))
      .finally(() => setDisassociatingId(null));
  };

  if (loading || !student) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-slate-500">Cargando...</p>
      </div>
    );
  }

  const alreadyLinked = parents.map((p) => p.userId);
  const availableUsers = allUsers.filter((u) => !alreadyLinked.includes(u.id));

  return (
    <div className="mx-auto max-w-2xl px-4 pb-8">
      {/* Header: back + title + menu */}
      <div className="flex items-center justify-between py-4">
        <button
          type="button"
          onClick={() => navigate('/students')}
          className="flex size-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-200"
          aria-label="Volver"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-slate-800">Perfil del estudiante</h1>
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-200"
          aria-label="Más opciones"
        >
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </div>

      {/* Card: avatar, name, grade, ID (CURP), Edit / Delete */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="flex size-20 items-center justify-center rounded-full bg-sky-100 text-2xl font-bold text-slate-600">
              {student.fullName.trim().slice(0, 1).toUpperCase()}
            </div>
            <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-emerald-500" title="Activo" />
          </div>
          {!editing ? (
            <>
              <h2 className="mt-3 text-xl font-bold text-slate-800">{student.fullName}</h2>
              <p className="mt-1 text-sm text-slate-600">Grado {student.grade}</p>
              <p className="mt-1 text-sm font-medium" style={{ color: PRIMARY }}>ID: {student.curp}</p>
              <div className="mt-4 flex w-full max-w-xs gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-white"
                  style={{ backgroundColor: PRIMARY }}
                >
                  <span className="material-symbols-outlined text-lg">edit</span>
                  Editar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                  Eliminar
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleUpdate} className="mt-3 w-full max-w-sm space-y-3 text-left">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Nombre completo</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">CURP</label>
                <input type="text" value={curp} onChange={(e) => setCurp(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Grado</label>
                <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800" required placeholder="ej. 3A" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Estado</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800">
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditing(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600">Cancelar</button>
                <button type="submit" disabled={saving} className="rounded-xl px-4 py-2 text-sm font-medium text-white disabled:opacity-70" style={{ backgroundColor: PRIMARY }}>Guardar</button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Uploaded Documents */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Documentos subidos</h2>
          <Link to={`/documents?studentId=${studentId}`} className="text-sm font-medium" style={{ color: PRIMARY }}>Añadir nuevo</Link>
        </div>
        <ul className="mt-4 space-y-3">
          {documents.length === 0 ? (
            <li className="text-sm text-slate-500">No hay documentos subidos</li>
          ) : (
            documents.map((doc) => (
              <li key={doc.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                <span className="material-symbols-outlined text-2xl text-amber-500">description</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{getCategoryName(doc.categoryId)}</p>
                  <p className="text-xs text-slate-500">{fileNameFromUrl(doc.fileUrl)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadDocument(doc)}
                      disabled={downloadingDocId === doc.id}
                      className="flex size-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-60"
                      title="Descargar"
                      aria-label="Descargar"
                    >
                      <span className="material-symbols-outlined text-xl">
                        {downloadingDocId === doc.id ? 'hourglass_empty' : 'download'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDocument(doc)}
                      className="flex size-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                      title="Eliminar"
                      aria-label="Eliminar"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${doc.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {doc.verified ? 'Archivo verificado' : 'Pendiente'}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>

      {/* Parents / Tutors */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Padres / Tutores</h2>
          <button type="button" onClick={() => setShowAssociate(true)} className="text-sm font-medium" style={{ color: PRIMARY }}>Añadir</button>
        </div>
        <ul className="mt-4 space-y-3">
          {parents.length === 0 ? (
            <li className="text-sm text-slate-500">Ningún padre/tutor vinculado</li>
          ) : (
            parents.map((p) => (
              <li key={p.userId} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">{p.name.slice(0, 1)}</div>
                <div className="min-w-0 flex-1">
                  <Link to={`/users/${p.userId}`} className="font-medium text-slate-800 hover:underline">{p.name}</Link>
                  <p className="text-xs text-slate-500">{p.email}</p>
                </div>
                <button type="button" disabled={disassociatingId === p.userId} onClick={() => handleDisassociate(p.userId)} className="text-sm text-red-600 hover:underline disabled:opacity-50">Desasociar</button>
              </li>
            ))
          )}
        </ul>
      </section>

      {showAssociate && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAssociate(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-bold text-slate-800">Asociar padre/tutor</h3>
            <form onSubmit={handleAssociate}>
              <label className="mb-2 block text-sm font-medium text-slate-700">Usuario</label>
              <select value={associateUserId === '' ? '' : associateUserId} onChange={(e) => setAssociateUserId(e.target.value === '' ? '' : Number(e.target.value))} className="mb-4 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800" required>
                <option value="">Seleccionar</option>
                {availableUsers.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
              </select>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAssociate(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600">Cancelar</button>
                <button type="submit" disabled={associating || availableUsers.length === 0} className="rounded-xl px-4 py-2 text-sm font-medium text-white disabled:opacity-70" style={{ backgroundColor: PRIMARY }}>Asociar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

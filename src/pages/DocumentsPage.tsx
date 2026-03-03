import { useEffect, useState, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { confirmDelete } from '@/lib/confirmDelete';
import type { DocumentDto, DocumentCategoryDto, StudentDto } from '@/types/entities';
import { ApiError } from '@/types/api';
import {
  fetchDocuments,
  fetchDocumentsGroupedByMyStudents,
  uploadDocument,
  deleteDocument,
  downloadDocument,
} from '@/services/documents.service';
import type { DocumentsGroupedByStudent } from '@/services/documents.service';
import { fetchDocumentCategories } from '@/services/document-categories.service';
import { fetchStudents, fetchStudentById } from '@/services/students.service';
import { useAuth } from '@/contexts/AuthContext';
import { SelectEntityDialog } from '@/components/SelectEntityDialog';
import { DocumentCard } from '@/components/DocumentCard';
import { StudentDocumentsSection } from '@/components/StudentDocumentsSection';

const PRIMARY = '#136dec';
const MAX_SIZE_MB = 10;
const ACCEPT = '.pdf,.jpg,.jpeg,.png';

function fileNameFromUrl(url: string): string {
  try {
    const segment = url.split('/').filter(Boolean).pop();
    return segment ? decodeURIComponent(segment) : 'Documento';
  } catch {
    return 'Documento';
  }
}

export function DocumentsPage() {
  const { user } = useAuth();
  const isAdmin = user?.roleId === 1;
  const [searchParams] = useSearchParams();
  const studentIdParam = searchParams.get('studentId');
  const studentIdFromUrl = studentIdParam ? parseInt(studentIdParam, 10) : null;
  const validStudentId = studentIdFromUrl != null && !Number.isNaN(studentIdFromUrl) ? studentIdFromUrl : null;

  const [student, setStudent] = useState<StudentDto | null>(null);
  const [documents, setDocuments] = useState<DocumentDto[]>([]);
  const [groupedByStudent, setGroupedByStudent] = useState<DocumentsGroupedByStudent[]>([]);
  const [categories, setCategories] = useState<DocumentCategoryDto[]>([]);
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStudentId, setUploadStudentId] = useState<number | ''>(validStudentId ?? '');
  const [uploadCategoryId, setUploadCategoryId] = useState<number | ''>('');
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [selectedStudentName, setSelectedStudentName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUploadStudentId(validStudentId ?? '');
    if (!validStudentId) setSelectedStudentName(null);
  }, [validStudentId]);

  useEffect(() => {
    if (validStudentId) {
      fetchStudentById(validStudentId)
        .then((s) => {
          setStudent(s);
          setSelectedStudentName(s.fullName);
        })
        .catch(() => {
          setStudent(null);
          setSelectedStudentName(null);
        });
    } else {
      setStudent(null);
    }
  }, [validStudentId]);

  const loadDocuments = () => {
    setLoading(true);
    const q: { page: number; limit: number; studentId?: number } = { page: 1, limit: 50 };
    if (validStudentId) q.studentId = validStudentId;
    fetchDocuments(q)
      .then((res) => setDocuments(res.data))
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Error al cargar'))
      .finally(() => setLoading(false));
  };

  const loadGroupedByMyStudents = () => {
    setLoading(true);
    fetchDocumentsGroupedByMyStudents()
      .then(setGroupedByStudent)
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : 'Error al cargar');
        setGroupedByStudent([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isAdmin) loadDocuments();
    else loadGroupedByMyStudents();
  }, [isAdmin, validStudentId]);

  useEffect(() => {
    fetchDocumentCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchStudents({ page: 1, limit: 100 }).then((r) => setStudents(r.data)).catch(() => {});
    }
  }, [isAdmin]);

  const getCategoryName = (id: number) => categories.find((c) => c.id === id)?.name ?? 'Documento';
  const getStudentName = (id: number) =>
    selectedStudentName && uploadStudentId === id ? selectedStudentName : students.find((s) => s.id === id)?.fullName ?? 'Estudiante #' + id;

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`El archivo no debe superar ${MAX_SIZE_MB} MB`);
      return;
    }
    setUploadFile(file);
    e.target.value = '';
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const sid = validStudentId ?? uploadStudentId;
    if (!uploadFile || sid === '' || uploadCategoryId === '') {
      toast.error('Selecciona archivo, estudiante y categoría');
      return;
    }
    setUploading(true);
    uploadDocument(uploadFile, sid, uploadCategoryId, true)
      .then(() => {
        toast.success('Documento subido');
        setUploadFile(null);
        setUploadCategoryId('');
        if (isAdmin) loadDocuments();
        else loadGroupedByMyStudents();
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Error al subir'))
      .finally(() => setUploading(false));
  };

  const handleDownload = (d: DocumentDto) => {
    setDownloadingId(d.id);
    downloadDocument(d.id, fileNameFromUrl(d.fileUrl))
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Error al descargar'))
      .finally(() => setDownloadingId(null));
  };

  const handleDelete = (d: DocumentDto) => {
    confirmDelete({
      message: '¿Eliminar este documento?',
      execute: () =>
        deleteDocument(d.id).then(() => {
          if (isAdmin) loadDocuments();
          else loadGroupedByMyStudents();
        }),
      successMessage: 'Documento eliminado',
      errorMessage: 'Error al eliminar',
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24">
      <div className="flex items-center justify-between py-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-800">Repositorio</h1>
      </div>

      {/* Student context when coming from list */}
      {student && (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Subiendo para</p>
          <p className="mt-1 font-semibold text-slate-800">{student.fullName}</p>
          <p className="text-sm text-slate-600">{student.curp} · Grado {student.grade}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:min-h-[calc(100vh-12rem)] lg:items-stretch">
        {/* Upload area — izquierda en desktop (centrado en medio de la vista), arriba en móvil */}
        <div className="flex flex-col justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-6">
        <form onSubmit={handleUpload} className="flex flex-col items-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
            <span className="material-symbols-outlined text-4xl">cloud_upload</span>
          </div>
          <h2 className="mt-3 text-lg font-semibold text-slate-800">Subir nuevo documento</h2>
          <p className="mt-1 text-sm text-slate-500">PDF, JPG o PNG hasta {MAX_SIZE_MB} MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            onChange={handleSelectFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 rounded-xl px-6 py-3 text-sm font-medium text-white"
            style={{ backgroundColor: PRIMARY }}
          >
            Seleccionar archivos
          </button>
          {uploadFile && (
            <p className="mt-2 text-sm text-slate-600">{uploadFile.name}</p>
          )}

          {uploadFile && (
            <div className="mt-4 w-full max-w-xs space-y-3">
              {!validStudentId && (
                <div>
                  <label className="mb-1 block text-left text-sm font-medium text-slate-700">Estudiante</label>
                  <button
                    type="button"
                    onClick={() => setShowStudentDialog(true)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-slate-800 transition hover:bg-slate-50 focus:outline-0 focus:ring-2 focus:ring-[#136dec]/30"
                  >
                    {uploadStudentId !== '' ? (
                      <span className="flex items-center justify-between gap-2">
                        {selectedStudentName ?? getStudentName(uploadStudentId)}
                        <span className="material-symbols-outlined text-slate-400 text-xl">expand_more</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-between gap-2 text-slate-500">
                        Seleccionar alumno
                        <span className="material-symbols-outlined text-xl">person_search</span>
                      </span>
                    )}
                  </button>
                  {uploadStudentId !== '' && (
                    <button
                      type="button"
                      onClick={() => { setUploadStudentId(''); setSelectedStudentName(null); }}
                      className="mt-1 text-xs font-medium text-slate-500 hover:text-slate-700"
                    >
                      Cambiar alumno
                    </button>
                  )}
                </div>
              )}
              <div>
                <label className="mb-1 block text-left text-sm font-medium text-slate-700">Categoría</label>
                <button
                  type="button"
                  onClick={() => setShowCategoryDialog(true)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-slate-800 transition hover:bg-slate-50 focus:outline-0 focus:ring-2 focus:ring-[#136dec]/30"
                >
                  {uploadCategoryId !== '' ? (
                    <span className="flex items-center justify-between gap-2">
                      {getCategoryName(uploadCategoryId)}
                      <span className="material-symbols-outlined text-slate-400 text-xl">expand_more</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-between gap-2 text-slate-500">
                      Seleccionar categoría
                      <span className="material-symbols-outlined text-xl">folder</span>
                    </span>
                  )}
                </button>
                {uploadCategoryId !== '' && (
                  <button
                    type="button"
                    onClick={() => setUploadCategoryId('')}
                    className="mt-1 text-xs font-medium text-slate-500 hover:text-slate-700"
                  >
                    Cambiar categoría
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={uploading}
                className="w-full rounded-xl py-2.5 text-sm font-medium text-white disabled:opacity-70"
                style={{ backgroundColor: PRIMARY }}
              >
                {uploading ? 'Subiendo...' : 'Subir'}
              </button>
            </div>
          )}
        </form>
        </div>

        {/* Archivos cargados — derecha en desktop, abajo en móvil */}
        <section>
        <h2 className="text-lg font-bold text-slate-800">
          {isAdmin
            ? (validStudentId ? 'Documentos del alumno' : 'Documentos recientes')
            : 'Documentos de mis alumnos'}
        </h2>
        {loading ? (
          <p className="py-6 text-center text-sm text-slate-500">Cargando...</p>
        ) : isAdmin ? (
          documents.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No hay documentos</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {documents.map((d) => (
                <DocumentCard
                  key={d.id}
                  document={d}
                  categoryName={getCategoryName(d.categoryId)}
                  subtitle={`Subido ${new Date(d.uploadedAt).toLocaleDateString('es')}${!validStudentId ? ` · ${getStudentName(d.studentId)}` : ''}`}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                  downloadingId={downloadingId}
                />
              ))}
            </ul>
          )
        ) : groupedByStudent.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">No hay documentos</p>
        ) : (
          <div className="mt-3 space-y-6">
            {groupedByStudent.map((group) => (
              <StudentDocumentsSection
                key={group.student.studentId}
                student={{
                  fullName: group.student.fullName,
                  curp: group.student.curp,
                  grade: group.student.grade,
                }}
                documents={group.documents}
                getCategoryName={getCategoryName}
                onDownload={handleDownload}
                onDelete={handleDelete}
                downloadingId={downloadingId}
              />
            ))}
          </div>
        )}
        </section>
      </div>

      <SelectEntityDialog
        open={showStudentDialog}
        onClose={() => setShowStudentDialog(false)}
        onSelect={(id, item) => {
          setUploadStudentId(id);
          setSelectedStudentName((item as StudentDto).fullName);
        }}
        title="Seleccionar alumno"
        entity="student"
        isAdmin={isAdmin}
      />

      {/* Dialog selección de categoría */}
      {showCategoryDialog && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowCategoryDialog(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-md flex-col rounded-2xl border border-slate-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <h3 className="text-lg font-bold text-slate-800">Seleccionar categoría</h3>
              <button
                type="button"
                onClick={() => setShowCategoryDialog(false)}
                className="flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Cerrar"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {categories.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">No hay categorías</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {categories.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadCategoryId(c.id);
                          setShowCategoryDialog(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                      >
                        <span className="material-symbols-outlined text-slate-500 text-xl">folder</span>
                        <div className="min-w-0 flex-1 text-left">
                          <p className="font-medium text-slate-800">{c.name}</p>
                          {c.description && (
                            <p className="text-xs text-slate-500">{c.description}</p>
                          )}
                        </div>
                        <span className="material-symbols-outlined text-slate-400 text-xl">chevron_right</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

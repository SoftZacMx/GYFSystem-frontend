import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import type { DocumentDto, DocumentCategoryDto, StudentDto } from '@/types/entities';
import { ApiError } from '@/types/api';
import { fetchDocuments, uploadDocument, deleteDocument, downloadDocument } from '@/services/documents.service';
import { fetchDocumentCategories } from '@/services/document-categories.service';
import { fetchStudents, fetchStudentById } from '@/services/students.service';

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
  const [searchParams] = useSearchParams();
  const studentIdParam = searchParams.get('studentId');
  const studentIdFromUrl = studentIdParam ? parseInt(studentIdParam, 10) : null;
  const validStudentId = studentIdFromUrl != null && !Number.isNaN(studentIdFromUrl) ? studentIdFromUrl : null;

  const [student, setStudent] = useState<StudentDto | null>(null);
  const [documents, setDocuments] = useState<DocumentDto[]>([]);
  const [categories, setCategories] = useState<DocumentCategoryDto[]>([]);
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStudentId, setUploadStudentId] = useState<number | ''>(validStudentId ?? '');
  const [uploadCategoryId, setUploadCategoryId] = useState<number | ''>('');
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUploadStudentId(validStudentId ?? '');
  }, [validStudentId]);

  useEffect(() => {
    if (validStudentId) {
      fetchStudentById(validStudentId)
        .then(setStudent)
        .catch(() => setStudent(null));
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

  useEffect(() => {
    loadDocuments();
  }, [validStudentId]);

  useEffect(() => {
    fetchDocumentCategories().then(setCategories).catch(() => {});
    if (!validStudentId) fetchStudents({ limit: 100 }).then((r) => setStudents(r.data)).catch(() => {});
  }, [validStudentId]);

  const getCategoryName = (id: number) => categories.find((c) => c.id === id)?.name ?? 'Documento';
  const getStudentName = (id: number) => students.find((s) => s.id === id)?.fullName ?? 'Estudiante #' + id;

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
        loadDocuments();
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
    if (!window.confirm('¿Eliminar este documento?')) return;
    deleteDocument(d.id)
      .then(() => {
        toast.success('Documento eliminado');
        loadDocuments();
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Error al eliminar'));
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24">
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

      {/* Upload area */}
      <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-6">
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
                  <select
                    value={uploadStudentId === '' ? '' : uploadStudentId}
                    onChange={(e) => setUploadStudentId(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800"
                    required
                  >
                    <option value="">Seleccionar</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>{s.fullName}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="mb-1 block text-left text-sm font-medium text-slate-700">Categoría</label>
                <select
                  value={uploadCategoryId === '' ? '' : uploadCategoryId}
                  onChange={(e) => setUploadCategoryId(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800"
                  required
                >
                  <option value="">Seleccionar</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
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

      {/* Documents list (for this student or recent) */}
      <section className="mt-6">
        <h2 className="text-lg font-bold text-slate-800">
          {validStudentId ? 'Documentos del alumno' : 'Documentos recientes'}
        </h2>
        {loading ? (
          <p className="py-6 text-center text-sm text-slate-500">Cargando...</p>
        ) : documents.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">No hay documentos</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {documents.map((d) => (
              <li
                key={d.id}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
              >
                <span className="material-symbols-outlined text-2xl text-amber-500">description</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-800">{getCategoryName(d.categoryId)}</p>
                  <p className="text-xs text-slate-500">
                    Subido {new Date(d.uploadedAt).toLocaleDateString('es')}
                    {!validStudentId && ` · ${getStudentName(d.studentId)}`}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownload(d)}
                      disabled={downloadingId === d.id}
                      className="flex size-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-60"
                      title="Descargar"
                      aria-label="Descargar"
                    >
                      <span className="material-symbols-outlined text-xl">
                        {downloadingId === d.id ? 'hourglass_empty' : 'download'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(d)}
                      className="flex size-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                      title="Eliminar"
                      aria-label="Eliminar"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${d.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
                >
                  {d.verified ? 'Archivo verificado' : 'Pendiente'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

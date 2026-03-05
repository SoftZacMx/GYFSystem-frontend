import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ApiError } from '@/types/api';
import { createStudent } from '@/services/students.service';

export function StudentCreatePage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [curp, setCurp] = useState('');
  const [grade, setGrade] = useState('');
  const [status, setStatus] = useState('active');
  const [saving, setSaving] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !curp.trim() || !grade.trim()) return;
    setSaving(true);
    createStudent({ fullName: fullName.trim(), curp: curp.trim(), grade: grade.trim(), status })
      .then((s) => {
        toast.success('Estudiante creado');
        navigate(`/students/${s.id}`);
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Error al crear'))
      .finally(() => setSaving(false));
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-8">
      <div className="flex items-center justify-between py-4">
        <button
          type="button"
          onClick={() => navigate('/students')}
          className="flex size-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-200"
          aria-label="Volver"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-slate-800">Nuevo estudiante</h1>
        <div className="size-10" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-slate-100 text-2xl font-bold text-slate-400">
            <span className="material-symbols-outlined text-4xl">person_add</span>
          </div>
          <p className="mt-3 text-sm text-slate-500">Completa los datos del estudiante</p>
          <form onSubmit={handleCreate} className="mt-4 w-full max-w-sm space-y-3 text-left">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Nombre completo</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-xl border border-input px-3 py-2 text-slate-800 focus:outline-0 focus:ring-2 focus:ring-primary/30" required placeholder="Ej. Alex Johnson" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">CURP</label>
              <input type="text" value={curp} onChange={(e) => setCurp(e.target.value)} className="w-full rounded-xl border border-input px-3 py-2 text-slate-800 focus:outline-0 focus:ring-2 focus:ring-primary/30" required placeholder="Clave única de registro" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Grado - Sección</label>
              <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full rounded-xl border border-input px-3 py-2 text-slate-800 focus:outline-0 focus:ring-2 focus:ring-primary/30" required placeholder="Ej. 10B, 3A" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Estado</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-xl border border-input px-3 py-2 text-slate-800 focus:outline-0 focus:ring-2 focus:ring-primary/30">
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
            <div className="flex gap-2 pt-4">
              <button type="button" onClick={() => navigate('/students')} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600">Cancelar</button>
              <button type="submit" disabled={saving} className="flex-1 rounded-xl px-4 py-2 text-sm font-medium bg-primary text-primary-foreground disabled:opacity-70">Crear estudiante</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import type { UserDto, CatalogItem, StudentOfParentDto } from '@/types/entities';
import { ApiError } from '@/types/api';
import { fetchUserById, updateUser, deleteUser } from '@/services/users.service';
import { fetchUserTypes, fetchRoles } from '@/services/catalogs.service';
import { fetchStudentsByUserId, associateParentStudent } from '@/services/parent-students.service';
import { fetchStudents } from '@/services/students.service';

const PRIMARY = '#136dec';

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = id != null ? parseInt(id, 10) : NaN;
  const [user, setUser] = useState<UserDto | null>(null);
  const [students, setStudents] = useState<StudentOfParentDto[]>([]);
  const [allStudents, setAllStudents] = useState<{ id: number; fullName: string }[]>([]);
  const [userTypes, setUserTypes] = useState<CatalogItem[]>([]);
  const [roles, setRoles] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userTypeId, setUserTypeId] = useState<number | ''>('');
  const [roleId, setRoleId] = useState<number | ''>('');
  const [status, setStatus] = useState('active');
  const [saving, setSaving] = useState(false);
  const [showAssociate, setShowAssociate] = useState(false);
  const [associateStudentId, setAssociateStudentId] = useState<number | ''>('');
  const [associating, setAssociating] = useState(false);

  useEffect(() => {
    if (Number.isNaN(userId)) return;
    setLoading(true);
    Promise.all([fetchUserById(userId), fetchStudentsByUserId(userId), fetchUserTypes(), fetchRoles()])
      .then(([u, st, ut, r]) => {
        setUser(u);
        setStudents(st);
        setUserTypes(ut);
        setRoles(r);
        setName(u.name);
        setEmail(u.email);
        setPassword('');
        setUserTypeId(u.userTypeId);
        setRoleId(u.roleId);
        setStatus(u.status);
      })
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : 'Error al cargar');
        navigate('/users');
      })
      .finally(() => setLoading(false));
  }, [userId, navigate]);

  useEffect(() => {
    fetchStudents({ limit: 100 }).then((r) => setAllStudents(r.data)).catch(() => {});
  }, []);

  const userTypeName = userTypes.find((t) => t.id === user?.userTypeId)?.name ?? '';
  const roleName = roles.find((r) => r.id === user?.roleId)?.name ?? '';

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number.isNaN(userId) || userTypeId === '' || roleId === '' || !name.trim() || !email.trim()) return;
    if (password.trim().length > 0 && password.trim().length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setSaving(true);
    const body: { name: string; email: string; userTypeId: number; roleId: number; status: string; password?: string } = { name: name.trim(), email: email.trim(), userTypeId, roleId, status };
    if (password.trim()) body.password = password.trim();
    updateUser(userId, body)
      .then((u) => {
        setUser(u);
        setEditing(false);
        toast.success('Usuario actualizado');
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Error al guardar'))
      .finally(() => setSaving(false));
  };

  const handleDelete = () => {
    if (Number.isNaN(userId) || !window.confirm('¿Eliminar este usuario?')) return;
    deleteUser(userId)
      .then(() => {
        toast.success('Usuario eliminado');
        navigate('/users');
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Error al eliminar'));
  };

  const handleAssociate = (e: React.FormEvent) => {
    e.preventDefault();
    if (associateStudentId === '') return;
    setAssociating(true);
    associateParentStudent({ userId, studentId: associateStudentId })
      .then(() => {
        toast.success('Estudiante asociado');
        setShowAssociate(false);
        setAssociateStudentId('');
        fetchStudentsByUserId(userId).then(setStudents);
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Error al asociar'))
      .finally(() => setAssociating(false));
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-slate-500">Cargando...</p>
      </div>
    );
  }

  const alreadyLinked = students.map((s) => s.studentId);
  const availableStudents = allStudents.filter((s) => !alreadyLinked.includes(s.id));

  return (
    <div className="mx-auto max-w-2xl px-4 pb-8">
      <div className="flex items-center justify-between py-4">
        <button
          type="button"
          onClick={() => navigate('/users')}
          className="flex size-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-200"
          aria-label="Volver"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-slate-800">Perfil del usuario</h1>
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-200"
          aria-label="Más opciones"
        >
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="flex size-20 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-slate-600">
              {user.name.trim().slice(0, 1).toUpperCase()}
            </div>
            <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-emerald-500" title="Activo" />
          </div>
          {!editing ? (
            <>
              <h2 className="mt-3 text-xl font-bold text-slate-800">{user.name}</h2>
              <p className="mt-1 text-sm text-slate-600">{userTypeName} · {roleName}</p>
              <p className="mt-1 text-sm font-medium" style={{ color: PRIMARY }}>ID: #USR-{user.id}</p>
              <p className="mt-1 text-xs text-slate-500">{user.email}</p>
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
                <label className="mb-1 block text-sm font-medium text-slate-700">Nombre</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Nueva contraseña (vacío = no cambiar)</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800" minLength={6} placeholder="Mínimo 6 caracteres" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Tipo</label>
                <select value={userTypeId} onChange={(e) => setUserTypeId(Number(e.target.value))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800">
                  {userTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Rol</label>
                <select value={roleId} onChange={(e) => setRoleId(Number(e.target.value))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800">
                  {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
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

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Estudiantes vinculados</h2>
          <button type="button" onClick={() => setShowAssociate(true)} className="text-sm font-medium" style={{ color: PRIMARY }}>Añadir</button>
        </div>
        <ul className="mt-4 space-y-3">
          {students.length === 0 ? (
            <li className="text-sm text-slate-500">Ningún estudiante vinculado</li>
          ) : (
            students.map((s) => (
              <li key={s.studentId} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-slate-600">{s.fullName.slice(0, 1)}</div>
                <div className="min-w-0 flex-1">
                  <Link to={`/students/${s.studentId}`} className="font-medium text-slate-800 hover:underline">{s.fullName}</Link>
                  <p className="text-xs text-slate-500">{s.curp} · {s.grade}</p>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      {showAssociate && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAssociate(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-bold text-slate-800">Asociar estudiante</h3>
            <form onSubmit={handleAssociate}>
              <label className="mb-2 block text-sm font-medium text-slate-700">Estudiante</label>
              <select value={associateStudentId === '' ? '' : associateStudentId} onChange={(e) => setAssociateStudentId(e.target.value === '' ? '' : Number(e.target.value))} className="mb-4 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800" required>
                <option value="">Seleccionar</option>
                {availableStudents.map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
              </select>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAssociate(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600">Cancelar</button>
                <button type="submit" disabled={associating || availableStudents.length === 0} className="rounded-xl px-4 py-2 text-sm font-medium text-white disabled:opacity-70" style={{ backgroundColor: PRIMARY }}>Asociar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

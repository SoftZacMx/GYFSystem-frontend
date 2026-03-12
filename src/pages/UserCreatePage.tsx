import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { CatalogItem } from '@/types/entities';
import { ApiError } from '@/types/api';
import { createUser } from '@/services/users.service';
import { fetchUserTypes, fetchRoles } from '@/services/catalogs.service';
import { getRoleOptions } from '@/constants/roles';

export function UserCreatePage() {
  const navigate = useNavigate();
  const [userTypes, setUserTypes] = useState<CatalogItem[]>([]);
  const [roles, setRoles] = useState<CatalogItem[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userTypeId, setUserTypeId] = useState<number | ''>('');
  const [roleId, setRoleId] = useState<number | ''>('');
  const [status, setStatus] = useState('active');
  const [activateAccount, setActivateAccount] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([fetchUserTypes(), fetchRoles()]).then(([ut, r]) => {
      setUserTypes(ut);
      setRoles(r);
      if (ut[0]) setUserTypeId(ut[0].id);
      if (r[0]) setRoleId(r[0].id);
    }).catch(() => {});
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (userTypeId === '' || roleId === '' || !name.trim() || !email.trim() || !password.trim()) return;
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setSaving(true);
    createUser({ name: name.trim(), email: email.trim(), password, userTypeId, roleId, status, activateAccount })
      .then((u) => {
        toast.success('Usuario creado');
        navigate(`/users/${u.id}`);
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Error al crear'))
      .finally(() => setSaving(false));
  };

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
        <h1 className="text-lg font-bold text-slate-800">Nuevo usuario</h1>
        <div className="size-10" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-slate-100 text-2xl font-bold text-slate-400">
            <span className="material-symbols-outlined text-4xl">person_add</span>
          </div>
          <p className="mt-3 text-sm text-slate-500">Completa los datos del usuario</p>
          <form onSubmit={handleCreate} className="mt-4 w-full max-w-sm space-y-3 text-left">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Nombre</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-input px-3 py-2 text-slate-800 focus:outline-0 focus:ring-2 focus:ring-primary/30" required placeholder="Ej. María García" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-input px-3 py-2 text-slate-800 focus:outline-0 focus:ring-2 focus:ring-primary/30" required placeholder="correo@ejemplo.com" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-input px-3 py-2 text-slate-800 focus:outline-0 focus:ring-2 focus:ring-primary/30" required minLength={6} placeholder="Mínimo 6 caracteres" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Tipo de usuario</label>
              <select value={userTypeId === '' ? '' : userTypeId} onChange={(e) => setUserTypeId(e.target.value === '' ? '' : Number(e.target.value))} className="w-full rounded-xl border border-input px-3 py-2 text-slate-800 focus:outline-0 focus:ring-2 focus:ring-primary/30" required>
                <option value="">Seleccionar</option>
                {userTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Rol</label>
              <select value={roleId === '' ? '' : roleId} onChange={(e) => setRoleId(e.target.value === '' ? '' : Number(e.target.value))} className="w-full rounded-xl border border-input px-3 py-2 text-slate-800 focus:outline-0 focus:ring-2 focus:ring-primary/30" required>
                <option value="">Seleccionar</option>
                {getRoleOptions(roles).map((o) => (
                  <option key={o.key} value={o.key}>{o.value}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Estado</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-xl border border-input px-3 py-2 text-slate-800 focus:outline-0 focus:ring-2 focus:ring-primary/30">
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="activateAccount"
                checked={activateAccount}
                onChange={(e) => setActivateAccount(e.target.checked)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary/30"
              />
              <label htmlFor="activateAccount" className="text-sm font-medium text-slate-700">
                Activar cuenta al crear (no enviar correo de verificación)
              </label>
            </div>
            <div className="flex gap-2 pt-4">
              <button type="button" onClick={() => navigate('/users')} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600">Cancelar</button>
              <button type="submit" disabled={saving} className="flex-1 rounded-xl px-4 py-2 text-sm font-medium bg-primary text-primary-foreground disabled:opacity-70">Crear usuario</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

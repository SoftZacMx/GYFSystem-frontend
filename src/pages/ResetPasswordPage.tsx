import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/AuthLayout';
import { resetPassword } from '@/services/auth.service';
import { ApiError } from '@/types/api';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (!token) {
      toast.error('Enlace inválido. Solicita uno nuevo.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      toast.success('Contraseña actualizada. Inicia sesión con tu nueva contraseña.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <AuthLayout>
        <div className="px-4 md:px-6 lg:px-8 pt-4 md:pt-6 lg:pt-8 pb-4 md:pb-6 lg:pb-8 text-center">
          <h2 className="text-[26px] md:text-3xl font-bold text-slate-800">Enlace inválido</h2>
          <p className="mt-2 text-slate-600">
            Este enlace ha expirado o no es válido. Solicita uno nuevo desde{' '}
            <Link to="/auth/forgot-password" className="font-bold text-primary hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="px-4 md:px-6 lg:px-8 pt-4 md:pt-6 lg:pt-8 text-center">
        <h2 className="text-[26px] md:text-3xl lg:text-[2rem] font-bold leading-tight tracking-tight text-slate-800">
          Nueva contraseña
        </h2>
        <p className="mt-1 md:mt-2 text-base md:text-lg font-normal leading-normal text-slate-600">
          Ingresa y confirma tu nueva contraseña
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 md:space-y-5 px-4 md:px-6 lg:px-8 pt-4 md:pt-6 lg:pt-8 pb-4 md:pb-6 lg:pb-8 max-w-[480px] md:max-w-none md:mx-0 mx-auto"
      >
        <div className="flex w-full flex-col">
          <label className="pb-2 text-sm md:text-base font-medium text-slate-800">Nueva contraseña</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
              <span className="material-symbols-outlined text-xl">lock</span>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              className="h-14 md:h-[3.25rem] w-full rounded-xl border border-primary/20 bg-white pl-11 pr-12 text-base text-slate-900 placeholder:text-slate-400 focus:outline-0 focus:ring-2 focus:ring-primary/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 cursor-pointer"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              <span className="material-symbols-outlined text-xl">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        <div className="flex w-full flex-col">
          <label className="pb-2 text-sm md:text-base font-medium text-slate-800">Confirmar contraseña</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
              <span className="material-symbols-outlined text-xl">lock</span>
            </div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Repite la contraseña"
              className="h-14 md:h-[3.25rem] w-full rounded-xl border border-primary/20 bg-white pl-11 pr-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-0 focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex h-14 md:h-16 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-bold text-primary-foreground shadow-md shadow-primary/25 transition hover:bg-primary-hover active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 md:text-base"
        >
          <span>{loading ? 'Guardando...' : 'Guardar contraseña'}</span>
          <span className="material-symbols-outlined">check_circle</span>
        </button>

        <p className="pt-4 md:pt-6 text-center text-sm md:text-base text-slate-600">
          <Link to="/login" className="font-bold text-primary hover:underline">
            Volver al inicio de sesión
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

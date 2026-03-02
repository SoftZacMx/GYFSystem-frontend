import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { login as loginApi } from '@/services/auth.service';
import { ApiError } from '@/types/api';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { from?: { pathname: string } } | null;
  const from = state?.from?.pathname ?? '/';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await loginApi({ email, password });
      login(result.user, result.token);
      toast.success('Sesión iniciada');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-200 p-4 font-display md:bg-[#f6f7f8] md:p-8 lg:p-12">
      <div className="w-full max-w-[390px] sm:max-w-[420px] md:max-w-xl lg:max-w-2xl md:bg-transparent md:shadow-none overflow-hidden rounded-2xl md:rounded-none bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 md:p-0 md:pb-4 lg:pb-6 pb-2">
          <div className="flex size-12 md:size-14 shrink-0 items-center justify-center rounded-xl bg-[#136dec]/10 text-login-primary">
            <span className="material-symbols-outlined text-3xl md:text-4xl">school</span>
          </div>
          <h2 className="flex-1 text-center text-lg md:text-xl font-bold leading-tight tracking-tight text-slate-800 pr-12 md:pr-14">
            Files Manager
          </h2>
        </div>

        {/* Hero */}
        <div
          className="h-[200px] md:h-[260px] lg:h-[300px] w-full bg-cover bg-center bg-no-repeat rounded-xl md:rounded-xl"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80")',
          }}
          aria-hidden
        />

        {/* Welcome */}
        <div className="px-4 md:px-0 pt-6 md:pt-8 lg:pt-10 text-center">
          <h2 className="text-[26px] md:text-3xl lg:text-[2rem] font-bold leading-tight tracking-tight text-slate-800">
            Bienvenido
          </h2>
          <p className="mt-1 md:mt-2 text-base md:text-lg font-normal leading-normal text-slate-600">
            Inicia sesión para gestionar documentos, estudiantes y eventos
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5 px-4 md:px-0 pt-6 md:pt-8 lg:pt-10 pb-4 md:pb-6 max-w-[480px] md:mx-auto">
          <div className="flex w-full flex-col">
            <label className="pb-2 text-sm md:text-base font-medium text-slate-800">Correo electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                <span className="material-symbols-outlined text-xl">mail</span>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Correo del centro"
                className="h-14 md:h-[3.25rem] w-full rounded-xl border border-[#136dec]/20 bg-white pl-11 pr-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-0 focus:ring-2 focus:ring-[#136dec]/50"
              />
            </div>
          </div>

          <div className="flex w-full flex-col">
            <label className="pb-2 text-sm md:text-base font-medium text-slate-800">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                <span className="material-symbols-outlined text-xl">lock</span>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Tu contraseña"
                className="h-14 md:h-[3.25rem] w-full rounded-xl border border-[#136dec]/20 bg-white pl-11 pr-12 text-base text-slate-900 placeholder:text-slate-400 focus:outline-0 focus:ring-2 focus:ring-[#136dec]/50"
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

          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-5 w-5 rounded border-[#136dec]/30 bg-white text-login-primary focus:ring-login-primary"
              />
              <span className="text-sm font-medium text-slate-600">Recordarme</span>
            </label>
            <a href="#" className="text-sm font-semibold text-[#136dec] hover:underline">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-14 md:h-16 w-full items-center justify-center gap-2 rounded-xl bg-[#136dec] px-6 py-4 font-bold text-white shadow-md shadow-[#136dec]/25 transition hover:bg-[#136dec]/90 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 md:text-base"
          >
            <span>{loading ? 'Entrando...' : 'Iniciar sesión'}</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>

          <p className="pt-4 md:pt-6 text-center text-sm md:text-base text-slate-600">
            ¿No tienes cuenta?{' '}
            <a href="#" className="font-bold text-[#136dec] hover:underline">
              Contacta al administrador
            </a>
          </p>
        </form>

        {/* Footer */}
        <div className="border-t border-slate-200 px-4 md:px-0 py-4 md:pt-8 md:pb-0 text-center text-xs md:text-sm text-slate-500">
          © {new Date().getFullYear()} Files Manager
        </div>
      </div>
    </div>
  );
}

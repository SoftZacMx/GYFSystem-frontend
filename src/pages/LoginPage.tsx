import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { login as loginApi } from '@/services/auth.service';
import { ApiError } from '@/types/api';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      <div className="flex w-full max-w-[390px] sm:max-w-[420px] md:max-w-5xl md:min-h-[600px] lg:min-h-[640px] overflow-hidden rounded-2xl bg-white shadow-lg md:flex-row flex-col">
        {/* Columna izquierda (md+): solo logo con protagonismo */}
        <div className="hidden md:flex md:flex-[0_0_42%] lg:flex-[0_0_40%] flex-col items-center justify-center p-8 lg:p-12 bg-slate-50/70">
          <div className="h-[380px] w-[320px] shrink-0 lg:h-[460px] lg:w-[380px]">
            <img
              src="/Logo.png"
              alt="Get Your Files"
              className="h-full w-full object-contain object-center rounded-2xl shadow-lg"
            />
          </div>
        </div>

        {/* Separador vertical (md+) */}
        <div className="hidden md:block w-px shrink-0 bg-slate-200/90" aria-hidden />

        {/* Columna derecha: login e info */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* En móvil: logo compacto arriba */}
          <div className="flex flex-col items-center p-4 md:hidden">
            <img src="/Logo.png" alt="Get Your Files" className="h-32 w-auto object-contain rounded-xl shadow-md" />
          </div>

          {/* Hero */}
          <div
            className="h-[200px] md:h-[260px] lg:h-[300px] w-full shrink-0 bg-cover bg-center bg-no-repeat rounded-xl md:rounded-none"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1300&q=80")',
            }}
            aria-hidden
          />

          {/* Welcome */}
          <div className="px-4 md:px-6 lg:px-8 pt-4 md:pt-6 lg:pt-8 text-center">
            <h2 className="text-[26px] md:text-3xl lg:text-[2rem] font-bold leading-tight tracking-tight text-slate-800">
              Bienvenido
            </h2>
            <p className="mt-1 md:mt-2 text-base md:text-lg font-normal leading-normal text-slate-600">
              Inicia sesión para gestionar documentos, estudiantes y eventos
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5 px-4 md:px-6 lg:px-8 pt-4 md:pt-6 lg:pt-8 pb-4 md:pb-6 lg:pb-8 max-w-[480px] md:max-w-none md:mx-0 mx-auto">
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
                className="h-14 md:h-[3.25rem] w-full rounded-xl border border-primary/20 bg-white pl-11 pr-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-0 focus:ring-2 focus:ring-primary/50"
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

          <div className="flex justify-end">
            <Link to="/auth/forgot-password" className="text-sm font-semibold text-primary hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-14 md:h-16 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-bold text-primary-foreground shadow-md shadow-primary/25 transition hover:bg-primary-hover active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 md:text-base"
          >
            <span>{loading ? 'Entrando...' : 'Iniciar sesión'}</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>

        </form>

          {/* Footer */}
          <div className="mt-auto border-t border-slate-200 px-4 md:px-6 lg:px-8 py-4 text-center text-xs md:text-sm text-slate-500">
            © {new Date().getFullYear()} Get Your Files
          </div>
        </div>
      </div>
    </div>
  );
}

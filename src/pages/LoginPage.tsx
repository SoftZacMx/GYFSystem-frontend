import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { login as loginApi } from '@/services/auth.service';
import { ApiError } from '@/types/api';

const APP_NAME = 'Get Your Files';
const APP_TAGLINE = 'Gestión documental y académica';

/** Credenciales por defecto para entorno demo (admin del seed) */
const DEMO_ADMIN_EMAIL = 'admin@filesmanager.com';
const DEMO_ADMIN_PASSWORD = 'password123';

/** Logo: icono School (Material Symbols) en círculo blanco con sombra */
function LoginLogo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const isSm = size === 'sm';
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-black/5 ${isSm ? 'size-16' : 'size-24 lg:size-28'}`}
      aria-hidden
    >
      <span
        className={`material-symbols-outlined text-primary ${isSm ? 'text-4xl' : 'text-5xl lg:text-6xl'}`}
        aria-hidden
      >
        school
      </span>
    </div>
  );
}

export function LoginPage() {
  const [email, setEmail] = useState(DEMO_ADMIN_EMAIL);
  const [password, setPassword] = useState(DEMO_ADMIN_PASSWORD);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(false);
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
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-200 p-4 font-display md:bg-slate-300/80 md:p-8 lg:p-12">
      <div className="flex w-full max-w-[420px] sm:max-w-[480px] md:max-w-5xl md:min-h-[580px] lg:min-h-[600px] overflow-hidden rounded-2xl bg-white shadow-xl md:flex-row flex-col">
        {/* Columna izquierda: logo (birrete) + branding + animación de fondo sutil */}
        <div className="login-panel-animated hidden md:flex md:flex-[0_0_38%] lg:flex-[0_0_36%] flex-col items-center justify-center bg-slate-50/90 p-8 lg:p-12">
          <div className="login-brand-content flex flex-col items-center text-center">
            <LoginLogo />
            <h1 className="mt-6 text-xl font-bold tracking-tight text-slate-800 lg:text-2xl">
              {APP_NAME}
            </h1>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-500 lg:text-sm">
              {APP_TAGLINE}
            </p>
          </div>
        </div>

        <div className="hidden md:block w-px shrink-0 bg-slate-200/80" aria-hidden />

        {/* Columna derecha: formulario */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* Móvil: logo + nombre de la app arriba */}
          <div className="flex flex-col items-center pt-6 pb-2 md:hidden">
            <LoginLogo size="sm" />
            <p className="mt-3 text-sm font-bold text-slate-800">{APP_NAME}</p>
            <p className="mt-0.5 text-xs uppercase tracking-widest text-slate-500">{APP_TAGLINE}</p>
          </div>

          <div className="flex flex-1 flex-col justify-center px-6 py-6 sm:px-10 sm:py-8 lg:px-12 lg:py-10">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
                Bienvenido
              </h2>
              <p className="mt-1.5 text-sm text-slate-500 sm:text-base">
                Ingresa tus credenciales para acceder al panel
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Correo electrónico
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <span className="material-symbols-outlined text-xl">mail</span>
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="nombre@centro.edu"
                    className="h-12 w-full rounded-xl border border-input bg-slate-50/80 pl-11 pr-3 text-slate-900 placeholder:text-slate-400 focus:border-primary/40 focus:bg-white focus:outline-0 focus:ring-2 focus:ring-primary/30 sm:h-[3.25rem]"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="login-password" className="text-sm font-medium text-slate-700">
                    Contraseña
                  </label>
                  <Link
                    to="/auth/forgot-password"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <span className="material-symbols-outlined text-xl">lock</span>
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="h-12 w-full rounded-xl border border-input bg-slate-50/80 pl-11 pr-12 text-slate-900 placeholder:text-slate-400 focus:border-primary/40 focus:bg-white focus:outline-0 focus:ring-2 focus:ring-primary/30 sm:h-[3.25rem]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={staySignedIn}
                  onChange={(e) => setStaySignedIn(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50"
                />
                <span className="text-sm text-slate-600">Mantener sesión iniciada</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary-hover active:scale-[0.99] disabled:opacity-70 sm:h-[3.25rem] sm:text-base"
              >
                {loading ? 'Entrando...' : 'Iniciar sesión'}
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              ¿No tienes cuenta?{' '}
              <span className="font-medium text-slate-600">Contacta al administrador</span>
            </p>
          </div>

          <div className="border-t border-slate-100 px-6 py-3 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} {APP_NAME}
          </div>
        </div>
      </div>
    </div>
  );
}

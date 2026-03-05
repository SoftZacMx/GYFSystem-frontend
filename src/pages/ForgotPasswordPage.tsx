import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/AuthLayout';
import { forgotPassword } from '@/services/auth.service';
import { ApiError } from '@/types/api';

const REDIRECT_DELAY_MS = 1500;

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success('Si el correo existe, recibirás un enlace para restablecer tu contraseña.');
      setTimeout(() => navigate('/login', { replace: true }), REDIRECT_DELAY_MS);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Error al enviar el enlace');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="px-4 md:px-6 lg:px-8 pt-4 md:pt-6 lg:pt-8 text-center">
        <h2 className="text-[26px] md:text-3xl lg:text-[2rem] font-bold leading-tight tracking-tight text-slate-800">
          ¿Olvidaste tu contraseña?
        </h2>
        <p className="mt-1 md:mt-2 text-base md:text-lg font-normal leading-normal text-slate-600">
          Ingresa tu correo y te enviaremos un enlace para restablecerla
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 md:space-y-5 px-4 md:px-6 lg:px-8 pt-4 md:pt-6 lg:pt-8 pb-4 md:pb-6 lg:pb-8 max-w-[480px] md:max-w-none md:mx-0 mx-auto"
      >
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

        <button
          type="submit"
          disabled={loading}
          className="flex h-14 md:h-16 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-bold text-primary-foreground shadow-md shadow-primary/25 transition hover:bg-primary-hover active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 md:text-base"
        >
          <span>{loading ? 'Enviando...' : 'Enviar enlace'}</span>
          <span className="material-symbols-outlined">send</span>
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

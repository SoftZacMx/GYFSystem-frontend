import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/AuthLayout';
import { verifyAccount } from '@/services/auth.service';
import { ApiError } from '@/types/api';

const REDIRECT_DELAY_MS = 1500;

export function VerifyAccountPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const navigate = useNavigate();
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function scheduleRedirect() {
      redirectTimeoutRef.current = setTimeout(() => {
        navigate('/login', { replace: true });
      }, REDIRECT_DELAY_MS);
    }

    if (!token) {
      setStatus('error');
      toast.error('Enlace inválido. Falta el token.');
      scheduleRedirect();
      return () => {
        if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
      };
    }

    let cancelled = false;
    verifyAccount(token)
      .then(() => {
        if (cancelled) return;
        setStatus('success');
        toast.success('Cuenta verificada. Redirigiendo al inicio de sesión…');
        scheduleRedirect();
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus('error');
        toast.error(err instanceof ApiError ? err.message : 'Enlace inválido o expirado.');
        scheduleRedirect();
      });

    return () => {
      cancelled = true;
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
    };
  }, [token, navigate]);

  return (
    <AuthLayout>
      <div className="px-4 md:px-6 lg:px-8 pt-4 md:pt-6 lg:pt-8 pb-4 md:pb-6 lg:pb-8 text-center">
        <h2 className="text-[26px] md:text-3xl lg:text-[2rem] font-bold leading-tight tracking-tight text-slate-800">
          {status === 'loading' && 'Verificando cuenta…'}
          {status === 'success' && 'Cuenta verificada'}
          {status === 'error' && 'Error al verificar'}
        </h2>
        <p className="mt-1 md:mt-2 text-base md:text-lg font-normal leading-normal text-slate-600">
          {status === 'loading' && 'Espera un momento.'}
          {status === 'success' && 'Serás redirigido al inicio de sesión.'}
          {status === 'error' && 'Serás redirigido al inicio de sesión.'}
        </p>
      </div>
    </AuthLayout>
  );
}

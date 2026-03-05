import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Renders children only if the user is admin (roleId === 1).
 * Used for Empresa and Categorías de documentos. Docentes and parents are redirected to home.
 */
export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isReady } = useAuth();

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Cargando...</p>
      </div>
    );
  }

  if (!user || user.roleId !== 1) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

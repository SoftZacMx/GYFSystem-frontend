import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isStaffRole } from '@/types/auth';

/**
 * Renders children only if the user has staff role (admin or docente/editor).
 * Otherwise redirects to home.
 */
export function RoleProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isReady } = useAuth();

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Cargando...</p>
      </div>
    );
  }

  if (!user || !isStaffRole(user.roleId)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

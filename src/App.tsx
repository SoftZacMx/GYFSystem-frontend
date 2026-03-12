import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { RoleProtectedRoute } from '@/components/RoleProtectedRoute';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute';
import { Layout } from '@/components/Layout';
import { ThemeFromCompanyLoader } from '@/components/ThemeFromCompanyLoader';
import { LoginPage } from '@/pages/LoginPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { VerifyAccountPage } from '@/pages/VerifyAccountPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { UsersPage } from '@/pages/UsersPage';
import { StudentsPage } from '@/pages/StudentsPage';
import { DocumentCategoriesPage } from '@/pages/DocumentCategoriesPage';
import { DocumentsPage } from '@/pages/DocumentsPage';
import { EventsPage } from '@/pages/EventsPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { CompanyPage } from '@/pages/CompanyPage';
import { UserDetailPage } from '@/pages/UserDetailPage';
import { UserCreatePage } from '@/pages/UserCreatePage';
import { StudentDetailPage } from '@/pages/StudentDetailPage';
import { StudentCreatePage } from '@/pages/StudentCreatePage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
            <Route path="/auth/account/verify" element={<VerifyAccountPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ThemeFromCompanyLoader />
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="users" element={<RoleProtectedRoute><UsersPage /></RoleProtectedRoute>} />
              <Route path="users/new" element={<RoleProtectedRoute><UserCreatePage /></RoleProtectedRoute>} />
              <Route path="users/:id" element={<RoleProtectedRoute><UserDetailPage /></RoleProtectedRoute>} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="students/new" element={<RoleProtectedRoute><StudentCreatePage /></RoleProtectedRoute>} />
              <Route path="students/:id" element={<StudentDetailPage />} />
              <Route path="document-categories" element={<AdminProtectedRoute><DocumentCategoriesPage /></AdminProtectedRoute>} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="company" element={<AdminProtectedRoute><CompanyPage /></AdminProtectedRoute>} />
              <Route path="more" element={<Navigate to="/" replace />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster
          position="top-right"
          theme="light"
          richColors
          toastOptions={{
            style: {
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
              color: '#334155',
            },
            actionButtonStyle: {
              background: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
              borderRadius: '0.5rem',
              fontWeight: 500,
            },
            cancelButtonStyle: {
              background: 'transparent',
              color: '#64748b',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              fontWeight: 500,
            },
            classNames: {
              success: '!border-l-[#10b981]',
              error: '!border-l-[#ef4444]',
              warning: '!border-l-[#f59e0b]',
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

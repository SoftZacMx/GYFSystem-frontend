import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { RoleProtectedRoute } from '@/components/RoleProtectedRoute';
import { Layout } from '@/components/Layout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { UsersPage } from '@/pages/UsersPage';
import { StudentsPage } from '@/pages/StudentsPage';
import { DocumentCategoriesPage } from '@/pages/DocumentCategoriesPage';
import { DocumentsPage } from '@/pages/DocumentsPage';
import { EventsPage } from '@/pages/EventsPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { CompanyPage } from '@/pages/CompanyPage';
import { MorePage } from '@/pages/MorePage';
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
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="users" element={<RoleProtectedRoute><UsersPage /></RoleProtectedRoute>} />
              <Route path="users/new" element={<RoleProtectedRoute><UserCreatePage /></RoleProtectedRoute>} />
              <Route path="users/:id" element={<RoleProtectedRoute><UserDetailPage /></RoleProtectedRoute>} />
              <Route path="students" element={<RoleProtectedRoute><StudentsPage /></RoleProtectedRoute>} />
              <Route path="students/new" element={<RoleProtectedRoute><StudentCreatePage /></RoleProtectedRoute>} />
              <Route path="students/:id" element={<RoleProtectedRoute><StudentDetailPage /></RoleProtectedRoute>} />
              <Route path="document-categories" element={<DocumentCategoriesPage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="company" element={<CompanyPage />} />
              <Route path="more" element={<RoleProtectedRoute><MorePage /></RoleProtectedRoute>} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </ThemeProvider>
  );
}

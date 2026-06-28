import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import StudentDashboardPage from './pages/StudentDashboard';
import RegisterElectivesPage from './pages/RegisterElectives';
import FacultyPreferencePage from './pages/FacultyPreference';
import FacultyDashboardPage from './pages/FacultyDashboard';
import AdminDashboardPage from './pages/AdminDashboard';

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}/dashboard`} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/register"
        element={
          <ProtectedRoute allowedRole="student">
            <RegisterElectivesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/faculty-preference"
        element={
          <ProtectedRoute allowedRole="student">
            <FacultyPreferencePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/dashboard"
        element={
          <ProtectedRoute allowedRole="faculty">
            <FacultyDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

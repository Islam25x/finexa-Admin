import { Navigate, Route, Routes } from "react-router-dom";
import AiMonitoringPage from "./features/ai/pages/AiMonitoringPage";
import AdminLoginPage from "./features/auth/pages/AdminLoginPage";
import DashboardPage from "./features/dashboard/pages/DashboardPage";
import UsersPage from "./features/users/pages/UsersPage";
import ProtectedRoute from "./shared/auth/ProtectedRoute";
import PublicRoute from "./shared/auth/PublicRoute";

function App() {
  return (
    <Routes>
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <AdminLoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-monitoring"
        element={
          <ProtectedRoute>
            <AiMonitoringPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;

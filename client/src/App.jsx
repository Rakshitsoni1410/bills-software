import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AuthGuard from "./components/AuthGuard";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import BillingPage from "./pages/BillingPage";
import CustomersPage from "./pages/CustomersPage";
import KhataPage from "./pages/KhataPage";
import InvoicesPage from "./pages/InvoicesPage";

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        Loading...
      </div>
    );
  }
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/dashboard"
        element={
          <AuthGuard>
            <DashboardPage />
          </AuthGuard>
        }
      />
      <Route
        path="/billing"
        element={
          <AuthGuard>
            <BillingPage />
          </AuthGuard>
        }
      />
      <Route
        path="/customers"
        element={
          <AuthGuard>
            <CustomersPage />
          </AuthGuard>
        }
      />
      <Route
        path="/khata"
        element={
          <AuthGuard>
            <KhataPage />
          </AuthGuard>
        }
      />
      <Route
        path="/invoices"
        element={
          <AuthGuard>
            <InvoicesPage />
          </AuthGuard>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

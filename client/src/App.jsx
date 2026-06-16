import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { useAuth } from "./context/AuthContext";
import AuthGuard from "./components/AuthGuard";
import SplashScreen from "./components/SplashScreen";

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
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000); // Change to 10000 for 10 seconds

    return () => clearTimeout(timer);
  }, []);

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#ffffff",
            color: "#0f172a",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
          },
          success: {
            iconTheme: {
              primary: "#14b8a6",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#dc2626",
              secondary: "#ffffff",
            },
          },
        }}
      />

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
    </>
  );
}
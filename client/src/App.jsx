import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { useAuth } from "./context/AuthContext";
import { setLogoutHandler } from "./api/client";

import SplashScreen from "./components/SplashScreen";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import BillingPage from "./pages/BillingPage";
import CustomersPage from "./pages/CustomersPage";
import CustomerDetailsPage from "./pages/CustomerDetailsPage";
import KhataPage from "./pages/KhataPage";
import InvoicesPage from "./pages/InvoicesPage";
import InvoiceDetailsPage from "./pages/InvoiceDetailsPage";
import EditInvoicePage from "./pages/EditInvoicePage";
import SettingsPage from "./pages/SettingsPage";

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <Navigate
      to={user ? "/dashboard" : "/login"}
      replace
    />
  );
}

export default function App() {
  const [showSplash, setShowSplash] =
    useState(true);

  const { logout } = useAuth();

  useEffect(() => {
    setLogoutHandler((message) =>
      logout(message),
    );
  }, [logout]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

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
            border:
              "1px solid #e2e8f0",
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
        <Route
          path="/"
          element={<RootRedirect />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/signup"
          element={<SignupPage />}
        />

        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />

        <Route
          path="/billing"
          element={<BillingPage />}
        />

        <Route
          path="/customers"
          element={<CustomersPage />}
        />

        <Route
          path="/customers/:id"
          element={<CustomerDetailsPage />}
        />

        <Route
          path="/khata"
          element={<KhataPage />}
        />

        <Route
          path="/invoices"
          element={<InvoicesPage />}
        />

        <Route
          path="/invoices/:id"
          element={<InvoiceDetailsPage />}
        />

        <Route
          path="/invoices/:id/edit"
          element={<EditInvoicePage />}
        />

        <Route
          path="/settings"
          element={<SettingsPage />}
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </>
  );
}
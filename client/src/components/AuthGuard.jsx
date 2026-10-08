import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // ✅ Extra buffer — wait one tick before deciding to redirect
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      // Small delay so user state is committed before redirect decision
      const timer = setTimeout(() => setReady(true), 50);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  useEffect(() => {
    if (ready && !user) {
      navigate("/login", { replace: true });
    }
  }, [ready, user, navigate]);

  // Show spinner while loading OR while waiting for ready
  if (loading || !ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin"></div>
          </div>
          <h1 className="mt-8 text-2xl font-bold text-slate-800">
            Bills Software
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Preparing your workspace...
          </p>
          <div className="flex justify-center gap-2 mt-6">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"></span>
            <span
              className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"
              style={{ animationDelay: "0.15s" }}
            ></span>
            <span
              className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"
              style={{ animationDelay: "0.3s" }}
            ></span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}

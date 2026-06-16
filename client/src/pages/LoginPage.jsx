import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

export default function LoginPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [form, setForm] = useState({
    login: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/login", {
        login: form.login,
        password: form.password,
      });

      await refreshUser();
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-indigo-900 relative overflow-hidden flex items-center justify-center px-4 py-10">
      {/* Ambient background blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500/30 rounded-full blur-3xl blob" />
      <div
        className="absolute -bottom-40 -right-20 w-[28rem] h-[28rem] bg-amber-500/20 rounded-full blur-3xl blob"
        style={{ animationDelay: "4s" }}
      />
      <div
        className="absolute top-1/3 right-1/4 w-64 h-64 bg-indigo-500/40 rounded-full blur-3xl blob"
        style={{ animationDelay: "8s" }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Brand mark */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-lg bg-teal-500 flex items-center justify-center font-display font-bold text-indigo-900 text-lg">
            ₹
          </div>
          <span className="font-display font-semibold text-xl text-white">
            BillKaro
          </span>
        </div>

        <div className="bg-canvas rounded-2xl shadow-2xl shadow-black/30 p-7 sm:p-9 relative">
          {/* Perforated receipt-edge accent */}
          <div
            className="absolute -top-2 left-0 right-0 h-2 bg-canvas"
            style={{
              maskImage:
                "radial-gradient(circle 5px at 12px 0, transparent 5px, black 5.5px)",
              maskRepeat: "repeat-x",
              maskSize: "24px 10px",
              WebkitMaskImage:
                "radial-gradient(circle 5px at 12px 0, transparent 5px, black 5.5px)",
              WebkitMaskRepeat: "repeat-x",
              WebkitMaskSize: "24px 10px",
            }}
          />

          <h1 className="font-display text-2xl font-semibold text-ink text-center mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-ink/60 text-center mb-7">
            Login to manage your billing
          </p>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-lg px-3.5 py-2.5 mb-4 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink/70 mb-1.5">
                Email or Mobile Number
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="Enter email or mobile number"
                className="w-full text-sm border border-ink/15 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
                value={form.login}
                onChange={(e) => {
                  let value = e.target.value;

                  // If user is typing only digits, treat as mobile
                  if (/^\d*$/.test(value)) {
                    value = value.slice(0, 10);
                  }

                  setForm({
                    ...form,
                    login: value,
                  });
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink/70 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full text-sm border border-ink/15 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-xl py-2.5 text-sm font-semibold transition disabled:opacity-60 shadow-lg shadow-teal-500/20"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-sm text-ink/60 text-center mt-6">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-teal-600 font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-white/50 mt-6">
          GST billing, khata, and customers — all in one place.
        </p>
      </div>
    </div>
  );
}

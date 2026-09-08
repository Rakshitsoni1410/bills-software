import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import {
  ReceiptIndianRupee,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Loader2,
  TriangleAlert,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [form, setForm] = useState({
    login: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      setError(err?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function updateLogin(value) {
    let nextValue = value;

    // If user is typing only digits, treat it as a mobile number.
    if (/^\d*$/.test(nextValue)) {
      nextValue = nextValue.slice(0, 10);
    }

    setForm((current) => ({
      ...current,
      login: nextValue,
    }));
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-slate-950">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900" />

      {/* Ambient Blobs */}
      <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="absolute -bottom-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-cyan-500/20 blur-3xl" />

      <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-3xl" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2">
          {/* Left Side */}
          <div className="hidden lg:block">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/20">
                <ReceiptIndianRupee size={26} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">Bills Software</h2>

                <p className="text-xs text-slate-400">Smart GST Billing</p>
              </div>
            </div>

            {/* Hero Content */}
            <div className="mt-14 max-w-xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-4 py-2 text-xs font-semibold text-indigo-200 backdrop-blur">
                <Sparkles size={14} />
                Built for growing businesses
              </div>

              <h1 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
                Manage your billing
                <span className="block bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                  from one place.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
                Create GST invoices, track customers, manage khata balances and
                monitor your business activity with a simple billing system.
              </p>

              {/* Features */}
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                    <ShieldCheck size={20} />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-white">
                    Secure Access
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Your business workspace stays protected and private.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                    <ReceiptIndianRupee size={20} />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-white">
                    GST Billing
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Create professional invoices and manage your billing.
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-12 text-xs text-slate-500">
              GST billing • Khata • Customers • Invoices
            </p>
          </div>

          {/* Login Area */}
          <div className="mx-auto w-full max-w-md">
            {/* Mobile Branding */}
            <div className="mb-7 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white shadow-lg">
                <ReceiptIndianRupee size={23} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-white">Bills Software</h2>

                <p className="text-[11px] text-slate-400">Smart GST Billing</p>
              </div>
            </div>

            {/* Login Card */}
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white p-6 shadow-2xl shadow-black/30 sm:p-8">
              {/* Top Accent */}
              <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400" />

              {/* Heading */}
              <div className="mb-7 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Lock size={21} />
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Welcome back
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Sign in to continue to your dashboard
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <TriangleAlert
                    size={18}
                    className="mt-0.5 shrink-0 text-red-500"
                  />

                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Login */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email or Mobile Number
                  </label>

                  <div className="relative">
                    {form.login && /^\d*$/.test(form.login) ? (
                      <Smartphone
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    ) : (
                      <Mail
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    )}

                    <input
                      type="text"
                      required
                      autoFocus
                      autoComplete="username"
                      placeholder="Email or 10-digit mobile number"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                      value={form.login}
                      onChange={(e) => updateLogin(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-700">
                      Password
                    </label>
                  </div>

                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-12 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                      value={form.password}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          password: e.target.value,
                        }))
                      }
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-indigo-700 hover:to-indigo-800 hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      Login
                      <ArrowRight
                        size={17}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-7 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />

                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  New here?
                </span>

                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* Signup */}
              <Link
                to="/signup"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
              >
                Create a business account
                <ArrowRight size={16} />
              </Link>

              {/* Security */}
              <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <ShieldCheck size={14} />
                Secure business login
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500">
                GST billing, khata and customers — all in one place.
              </p>

              <p className="mt-2 text-[11px] text-slate-600">
                © {new Date().getFullYear()} Bills Software
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

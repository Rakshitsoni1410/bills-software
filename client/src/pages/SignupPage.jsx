
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import {
  ReceiptIndianRupee,
  Building2,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  MapPin,
  BadgeIndianRupee,
  ArrowRight,
  ShieldCheck,
  Loader2,
  TriangleAlert,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

function FormField({ label, icon: Icon, children, required = false }) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
        {Icon && <Icon size={15} className="text-indigo-500" />}
        {label}

        {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">{children}</div>
    </div>
  );
}

export default function SignupPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    password: "",
    phone: "",
    gstin: "",
    address: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    // Phone validation
    if (form.phone && form.phone.length !== 10) {
      setError("Phone number must be exactly 10 digits");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/signup", form);

      await refreshUser();

      navigate("/dashboard");
    } catch (err) {
      setError(err?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100";

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900" />

      {/* Ambient Background */}
      <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="absolute -bottom-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-cyan-500/20 blur-3xl" />

      <div className="absolute left-1/3 top-1/3 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />

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
          {/* Left Information */}
          <div className="hidden lg:block">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/20">
                <ReceiptIndianRupee size={26} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">
                  Bills Software
                </h2>

                <p className="text-xs text-slate-400">
                  Smart GST Billing
                </p>
              </div>
            </div>

            {/* Main Text */}
            <div className="mt-14 max-w-xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-4 py-2 text-xs font-semibold text-indigo-200">
                <Sparkles size={14} />
                Start your business workspace
              </div>

              <h1 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
                Everything you need
                <span className="block bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                  to manage billing.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
                Create your business account and start managing invoices,
                customers, GST and khata from one simple dashboard.
              </p>

              {/* Benefits */}
              <div className="mt-10 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
                    <CheckCircle2 size={16} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Professional GST invoices
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Create clear and professional invoices for your customers.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
                    <CheckCircle2 size={16} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Customer & khata management
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Keep customer details and pending balances organised.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
                    <CheckCircle2 size={16} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Business dashboard
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Monitor sales, GST collected and business activity.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-12 text-xs text-slate-500">
              GST billing • Khata • Customers • Invoices
            </p>
          </div>

          {/* Signup Area */}
          <div className="mx-auto w-full max-w-2xl">
            {/* Mobile Logo */}
            <div className="mb-7 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white shadow-lg">
                <ReceiptIndianRupee size={23} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-white">
                  Bills Software
                </h2>

                <p className="text-[11px] text-slate-400">
                  Smart GST Billing
                </p>
              </div>
            </div>

            {/* Signup Card */}
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white p-6 shadow-2xl shadow-black/30 sm:p-8">
              {/* Accent */}
              <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400" />

              {/* Heading */}
              <div className="mb-7 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Building2 size={22} />
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Create your business account
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Start billing and managing your business in minutes
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
                {/* Business / Owner */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField
                    label="Business Name"
                    icon={Building2}
                    required
                  >
                    <Building2
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      required
                      autoFocus
                      type="text"
                      placeholder="Your business name"
                      className={inputClass}
                      value={form.businessName}
                      onChange={(e) =>
                        update("businessName", e.target.value)
                      }
                    />
                  </FormField>

                  <FormField label="Owner Name" icon={User}>
                    <User
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      placeholder="Owner name"
                      className={inputClass}
                      value={form.ownerName}
                      onChange={(e) =>
                        update("ownerName", e.target.value)
                      }
                    />
                  </FormField>
                </div>

                {/* Email / Password */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField label="Email" icon={Mail} required>
                    <Mail
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="name@example.com"
                      className={inputClass}
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                    />
                  </FormField>

                  <FormField label="Password" icon={Lock} required>
                    <Lock
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="Minimum 6 characters"
                      className={`${inputClass} pr-12`}
                      value={form.password}
                      onChange={(e) =>
                        update("password", e.target.value)
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((current) => !current)
                      }
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </FormField>
                </div>

                {/* Phone / GSTIN */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField label="Phone" icon={Phone}>
                    <Phone
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="9876543210"
                      className={inputClass}
                      value={form.phone}
                      onChange={(e) =>
                        update(
                          "phone",
                          e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10),
                        )
                      }
                    />
                  </FormField>

                  <FormField label="GSTIN" icon={BadgeIndianRupee}>
                    <BadgeIndianRupee
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      placeholder="GSTIN"
                      className={`${inputClass} uppercase`}
                      value={form.gstin}
                      onChange={(e) =>
                        update("gstin", e.target.value.toUpperCase())
                      }
                    />
                  </FormField>
                </div>

                {/* Address */}
                <FormField label="Business Address" icon={MapPin}>
                  <MapPin
                    size={18}
                    className="absolute left-3.5 top-3.5 text-slate-400"
                  />

                  <textarea
                    rows={3}
                    placeholder="Enter your business address"
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    value={form.address}
                    onChange={(e) =>
                      update("address", e.target.value)
                    }
                  />
                </FormField>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-indigo-700 hover:to-indigo-800 hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account

                      <ArrowRight
                        size={17}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>
              </form>

              {/* Security Line */}
              <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <ShieldCheck size={14} />
                Your business information is securely stored
              </div>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />

                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Already registered?
                </span>

                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* Login Link */}
              <Link
                to="/login"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
              >
                Login to your account
                <ArrowRight size={16} />
              </Link>
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

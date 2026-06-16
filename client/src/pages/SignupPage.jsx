import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink/70 mb-1.5">
        {label}
      </label>
      {children}
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

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }
  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.phone.length !== 10) {
      alert("Phone number must be 10 digits");
      return;
    }

    // save customer
  };
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/signup", form);
      await refreshUser();
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full text-sm border border-ink/15 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition";

  return (
    <div className="min-h-screen bg-indigo-900 relative overflow-hidden flex items-center justify-center px-4 py-10">
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-teal-500/30 rounded-full blur-3xl blob" />
      <div
        className="absolute -bottom-40 -left-20 w-[28rem] h-[28rem] bg-amber-500/20 rounded-full blur-3xl blob"
        style={{ animationDelay: "4s" }}
      />
      <div
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/40 rounded-full blur-3xl blob"
        style={{ animationDelay: "8s" }}
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-lg bg-teal-500 flex items-center justify-center font-display font-bold text-indigo-900 text-lg">
            ₹
          </div>
          <span className="font-display font-semibold text-xl text-white">
            BillKaro
          </span>
        </div>

        <div className="bg-canvas rounded-2xl shadow-2xl shadow-black/30 p-7 sm:p-9 relative">
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
            Start billing in minutes
          </h1>
          <p className="text-sm text-ink/60 text-center mb-7">
            Create your business account
          </p>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-lg px-3.5 py-2.5 mb-4 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Business name *">
                <input
                  required
                  className={inputClass}
                  value={form.businessName}
                  onChange={(e) => update("businessName", e.target.value)}
                />
              </FormField>
              <FormField label="Owner name">
                <input
                  className={inputClass}
                  value={form.ownerName}
                  onChange={(e) => update("ownerName", e.target.value)}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Email *">
                <input
                  type="email"
                  required
                  className={inputClass}
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </FormField>
              <FormField label="Password *">
                <input
                  type="password"
                  required
                  minLength={6}
                  className={inputClass}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Phone">
                <input
                  type="tel"
                  maxLength={10}
                  className={inputClass}
                  value={form.phone}
                  onChange={(e) =>
                    update(
                      "phone",
                      e.target.value.replace(/\D/g, "").slice(0, 10),
                    )
                  }
                  placeholder="9876543210"
                />
              </FormField>
              <FormField label="GSTIN">
                <input
                  className={inputClass}
                  value={form.gstin}
                  onChange={(e) => update("gstin", e.target.value)}
                />
              </FormField>
            </div>

            <FormField label="Address">
              <input
                className={inputClass}
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
              />
            </FormField>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-xl py-2.5 text-sm font-semibold transition disabled:opacity-60 shadow-lg shadow-teal-500/20"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-sm text-ink/60 text-center mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-teal-600 font-medium hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

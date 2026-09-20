import {
  useEffect,
  useState,
} from "react";

import {
  Building2,
  UserRound,
  Phone,
  BadgeIndianRupee,
  MapPin,
  Landmark,
  CreditCard,
  Smartphone,
  ReceiptText,
  Percent,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Image,
  Mail,
  Hash,
  FileText,
  Map,
} from "lucide-react";

import Field from "../components/Field";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
];

const GST_RATES = [
  0,
  5,
  12,
  18,
  28,
];

const initialForm = {
  businessName: "",
  ownerName: "",
  phone: "",
  gstin: "",
  address: "",
  city: "",
  state: "Gujarat",
  pincode: "",
  logoUrl: "",

  bankName: "",
  accountHolderName: "",
  accountNumber: "",
  ifsc: "",
  upiId: "",

  invoicePrefix: "",
  defaultGstRate: 18,
  defaultNotes:
    "Payment due within 30 days. Thank you for your business!",
};

export default function SettingsPage() {
  const {
    user,
    setUser,
  } = useAuth();

  const [
    form,
    setForm,
  ] = useState(initialForm);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState(null);

  useEffect(() => {
    if (!user) return;

    setForm({
      businessName:
        user.businessName || "",

      ownerName:
        user.ownerName || "",

      phone:
        user.phone || "",

      gstin:
        user.gstin || "",

      address:
        user.address || "",

      city:
        user.city || "",

      state:
        user.state ||
        "Gujarat",

      pincode:
        user.pincode || "",

      logoUrl:
        user.logoUrl || "",

      bankName:
        user.bankName || "",

      accountHolderName:
        user.accountHolderName ||
        "",

      accountNumber:
        user.accountNumber ||
        "",

      ifsc:
        user.ifsc || "",

      upiId:
        user.upiId || "",

      invoicePrefix:
        user.invoicePrefix || "",

      defaultGstRate:
        user.defaultGstRate ??
        18,

      defaultNotes:
        user.defaultNotes ||
        "Payment due within 30 days. Thank you for your business!",
    });
  }, [user]);

  function update(
    field,
    value,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (message) {
      setMessage(null);
    }
  }

  function showError(text) {
    setMessage({
      type: "error",
      text,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSave() {
    setMessage(null);

    if (
      !form.businessName.trim()
    ) {
      showError(
        "Business name is required.",
      );

      return;
    }

    if (
      form.phone.length !== 10
    ) {
      showError(
        "Please enter a valid 10-digit mobile number.",
      );

      return;
    }

    if (
      form.gstin &&
      form.gstin.length !== 15
    ) {
      showError(
        "GSTIN must be exactly 15 characters.",
      );

      return;
    }

    if (
      form.pincode &&
      form.pincode.length !== 6
    ) {
      showError(
        "PIN code must be exactly 6 digits.",
      );

      return;
    }

    setSaving(true);

    try {
      const data =
        await api.put(
          "/auth/me",
          form,
        );

      setUser(data.user);

      setMessage({
        type: "success",
        text:
          "Business settings saved successfully.",
      });

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      showError(
        err?.message ||
          "Could not save business settings.",
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100";

  const normalInputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100";

  return (
    <div className="space-y-7">
      {/* Status */}
      {message && (
        <div
          className={`flex items-start gap-3 rounded-2xl border px-4 py-4 shadow-sm ${
            message.type ===
            "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              message.type ===
              "success"
                ? "bg-emerald-100"
                : "bg-red-100"
            }`}
          >
            {message.type ===
            "success" ? (
              <CheckCircle2
                size={18}
              />
            ) : (
              <AlertCircle
                size={18}
              />
            )}
          </div>

          <div>
            <p className="text-sm font-bold">
              {message.type ===
              "success"
                ? "Settings saved"
                : "Please check your settings"}
            </p>

            <p className="mt-1 text-sm opacity-80">
              {message.text}
            </p>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-cyan-500 px-6 py-7 text-white shadow-xl shadow-indigo-500/10 sm:px-8">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute -bottom-24 left-20 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur">
              <Building2
                size={27}
              />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-100">
                Business Settings
              </p>

              <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                Business Profile
              </h1>

              <p className="mt-2 text-sm text-indigo-100">
                Manage your business,
                banking and invoice
                defaults.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/20 bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {saving ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />
                Saving...
              </>
            ) : (
              <>
                <Save size={17} />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* Business Profile */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <SectionHeader
          icon={Building2}
          title="Business Information"
          subtitle="Details shown on your business account and future invoices"
        />

        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <Field
            label="Business name"
            required
          >
            <IconInput
              icon={Building2}
              className={
                inputClass
              }
            >
              <input
                className={
                  inputClass
                }
                value={
                  form.businessName
                }
                placeholder="Business name"
                onChange={(e) =>
                  update(
                    "businessName",
                    e.target.value,
                  )
                }
              />
            </IconInput>
          </Field>

          <Field label="Owner name">
            <IconInput
              icon={UserRound}
            >
              <input
                className={
                  inputClass
                }
                value={
                  form.ownerName
                }
                placeholder="Owner name"
                onChange={(e) =>
                  update(
                    "ownerName",
                    e.target.value,
                  )
                }
              />
            </IconInput>
          </Field>

          <Field label="Email">
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={
                  user?.email || ""
                }
                disabled
                className={`${inputClass} cursor-not-allowed bg-slate-100 text-slate-500`}
              />
            </div>
          </Field>

          <Field
            label="Mobile number"
            required
          >
            <div className="relative">
              <Phone
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                className={
                  inputClass
                }
                value={form.phone}
                placeholder="9876543210"
                onChange={(e) =>
                  update(
                    "phone",
                    e.target.value
                      .replace(
                        /\D/g,
                        "",
                      )
                      .slice(
                        0,
                        10,
                      ),
                  )
                }
              />
            </div>
          </Field>

          <Field label="GSTIN">
            <div className="relative">
              <BadgeIndianRupee
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                maxLength={15}
                className={`${inputClass} uppercase`}
                value={form.gstin}
                placeholder="24ABCDE1234F1Z5"
                onChange={(e) =>
                  update(
                    "gstin",
                    e.target.value
                      .toUpperCase()
                      .replace(
                        /[^0-9A-Z]/g,
                        "",
                      )
                      .slice(
                        0,
                        15,
                      ),
                  )
                }
              />
            </div>
          </Field>

          <Field label="City">
            <div className="relative">
              <MapPin
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                className={
                  inputClass
                }
                value={form.city}
                placeholder="Ahmedabad"
                onChange={(e) =>
                  update(
                    "city",
                    e.target.value,
                  )
                }
              />
            </div>
          </Field>

          <Field label="State">
            <div className="relative">
              <Map
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                className={`${inputClass} appearance-none`}
                value={form.state}
                onChange={(e) =>
                  update(
                    "state",
                    e.target.value,
                  )
                }
              >
                {STATES.map(
                  (state) => (
                    <option
                      key={state}
                      value={state}
                    >
                      {state}
                    </option>
                  ),
                )}
              </select>
            </div>
          </Field>

          <Field label="PIN code">
            <div className="relative">
              <Hash
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                inputMode="numeric"
                maxLength={6}
                className={
                  inputClass
                }
                value={
                  form.pincode
                }
                placeholder="380001"
                onChange={(e) =>
                  update(
                    "pincode",
                    e.target.value
                      .replace(
                        /\D/g,
                        "",
                      )
                      .slice(
                        0,
                        6,
                      ),
                  )
                }
              />
            </div>
          </Field>

          <div className="sm:col-span-2">
            <Field label="Business address">
              <div className="relative">
                <MapPin
                  size={18}
                  className="absolute left-3.5 top-3.5 text-slate-400"
                />

                <textarea
                  rows={3}
                  value={form.address}
                  placeholder="Complete business address"
                  onChange={(e) =>
                    update(
                      "address",
                      e.target.value,
                    )
                  }
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field label="Business logo URL">
              <div className="relative">
                <Image
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="url"
                  className={
                    inputClass
                  }
                  value={
                    form.logoUrl
                  }
                  placeholder="https://..."
                  onChange={(e) =>
                    update(
                      "logoUrl",
                      e.target.value,
                    )
                  }
                />
              </div>
            </Field>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              Actual logo file
              uploading will be added
              later. For now you can
              store an image URL safely.
            </p>
          </div>
        </div>
      </section>

      {/* Bank */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <SectionHeader
          icon={Landmark}
          title="Bank & Payment Details"
          subtitle="Payment information that can later appear on invoices"
        />

        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <Field label="Bank name">
            <div className="relative">
              <Landmark
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                className={
                  inputClass
                }
                value={
                  form.bankName
                }
                placeholder="Bank name"
                onChange={(e) =>
                  update(
                    "bankName",
                    e.target.value,
                  )
                }
              />
            </div>
          </Field>

          <Field label="Account holder">
            <div className="relative">
              <UserRound
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                className={
                  inputClass
                }
                value={
                  form.accountHolderName
                }
                placeholder="Account holder name"
                onChange={(e) =>
                  update(
                    "accountHolderName",
                    e.target.value,
                  )
                }
              />
            </div>
          </Field>

          <Field label="Account number">
            <div className="relative">
              <CreditCard
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                className={
                  inputClass
                }
                value={
                  form.accountNumber
                }
                placeholder="Bank account number"
                onChange={(e) =>
                  update(
                    "accountNumber",
                    e.target.value
                      .replace(
                        /\D/g,
                        "",
                      ),
                  )
                }
              />
            </div>
          </Field>

          <Field label="IFSC">
            <div className="relative">
              <Landmark
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                className={`${inputClass} uppercase`}
                value={form.ifsc}
                placeholder="SBIN0001234"
                onChange={(e) =>
                  update(
                    "ifsc",
                    e.target.value
                      .toUpperCase(),
                  )
                }
              />
            </div>
          </Field>

          <div className="sm:col-span-2">
            <Field label="UPI ID">
              <div className="relative">
                <Smartphone
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  className={
                    inputClass
                  }
                  value={
                    form.upiId
                  }
                  placeholder="business@upi"
                  onChange={(e) =>
                    update(
                      "upiId",
                      e.target.value,
                    )
                  }
                />
              </div>
            </Field>
          </div>
        </div>
      </section>

      {/* Invoice */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <SectionHeader
          icon={ReceiptText}
          title="Invoice Defaults"
          subtitle="Defaults we will connect to the Billing page in the next invoice improvement step"
        />

        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <Field label="Invoice prefix">
            <div className="relative">
              <FileText
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                maxLength={20}
                className={`${inputClass} uppercase`}
                value={
                  form.invoicePrefix
                }
                placeholder="INV"
                onChange={(e) =>
                  update(
                    "invoicePrefix",
                    e.target.value
                      .toUpperCase()
                      .replace(
                        /[^A-Z0-9_-]/g,
                        "",
                      ),
                  )
                }
              />
            </div>
          </Field>

          <Field label="Default GST rate">
            <div className="relative">
              <Percent
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                className={`${inputClass} appearance-none`}
                value={
                  form.defaultGstRate
                }
                onChange={(e) =>
                  update(
                    "defaultGstRate",
                    Number(
                      e.target.value,
                    ),
                  )
                }
              >
                {GST_RATES.map(
                  (rate) => (
                    <option
                      key={rate}
                      value={rate}
                    >
                      {rate}% GST
                    </option>
                  ),
                )}
              </select>
            </div>
          </Field>

          <div className="sm:col-span-2">
            <Field label="Default invoice notes">
              <textarea
                rows={4}
                className={normalInputClass}
                value={
                  form.defaultNotes
                }
                placeholder="Default payment terms..."
                onChange={(e) =>
                  update(
                    "defaultNotes",
                    e.target.value,
                  )
                }
              />
            </Field>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs leading-5 text-slate-500">
            These settings are stored
            safely with your business
            account.
          </p>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:w-auto"
          >
            {saving ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />
                Saving Settings...
              </>
            ) : (
              <>
                <Save size={17} />
                Save Settings
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <Icon size={20} />
      </div>

      <div>
        <h2 className="text-base font-bold text-slate-900">
          {title}
        </h2>

        <p className="mt-0.5 text-xs text-slate-500">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function IconInput({
  icon: Icon,
  children,
}) {
  return (
    <div className="relative">
      <Icon
        size={18}
        className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-slate-400"
      />

      {children}
    </div>
  );
}
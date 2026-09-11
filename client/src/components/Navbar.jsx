import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import InstallButton from "./InstallButton";
import {
  LayoutDashboard,
  FilePlus2,
  Users,
  Wallet,
  FileText,
  Menu,
  X,
  LogOut,
  Building2,
} from "lucide-react";

const links = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/billing",
    label: "New Bill",
    icon: FilePlus2,
  },
  {
    href: "/customers",
    label: "Customers",
    icon: Users,
  },
  {
    href: "/khata",
    label: "Khata",
    icon: Wallet,
  },
  {
    href: "/invoices",
    label: "Invoices",
    icon: FileText,
  },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            to="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="h-11 w-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg">
              <Building2 size={22} />
            </div>

            <div>
              <h1 className="font-bold text-lg text-slate-800">
                Bills Software
              </h1>
              <p className="text-xs text-slate-500">
                GST Billing System
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {links.map((link) => {
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200
                  ${
                    pathname === link.href
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100 hover:text-indigo-600"
                  }`}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Right */}
          <div className="hidden lg:flex items-center gap-4">

            <div className="text-right">
              <p className="text-sm font-semibold text-slate-700">
                {user?.businessName}
              </p>
              <p className="text-xs text-slate-500">
                Business Account
              </p>
            </div>

            <div className="h-11 w-11 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              {user?.businessName?.charAt(0).toUpperCase()}
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-red-600 font-medium transition hover:bg-red-100"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden rounded-lg p-2 hover:bg-slate-100"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="lg:hidden border-t border-slate-200 py-4 space-y-2">

            <div className="px-3 pb-3">
              <p className="font-semibold text-slate-700">
                {user?.businessName}
              </p>

              <p className="text-xs text-slate-500">
                Business Account
              </p>
            </div>

            {links.map((link) => {
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 transition
                  ${
                    pathname === link.href
                      ? "bg-indigo-600 text-white"
                      : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <Icon size={20} />
                  {link.label}
                </Link>
              );
            })}
          <InstallButton />
            <button
              onClick={logout}
              className="mt-3 flex w-full items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
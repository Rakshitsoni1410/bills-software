import {
  useState,
} from "react";

import {
  Link,
  useLocation,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

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
  Settings,
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
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

export default function Navbar() {
  const {
    pathname,
  } = useLocation();

  const {
    user,
    logout,
  } = useAuth();

  const [
    open,
    setOpen,
  ] = useState(false);

  return (
    <nav className="no-print sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
              <Building2
                size={22}
              />
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-800">
                Bills Software
              </h1>

              <p className="text-xs text-slate-500">
                GST Billing System
              </p>
            </div>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-1 xl:flex">
            {links.map(
              (link) => {
                const Icon =
                  link.icon;

                const active =
                  pathname ===
                  link.href;

                return (
                  <Link
                    key={
                      link.href
                    }
                    to={link.href}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                        : "text-slate-600 hover:bg-slate-100 hover:text-indigo-600"
                    }`}
                  >
                    <Icon
                      size={17}
                    />

                    {link.label}
                  </Link>
                );
              },
            )}
          </div>

          {/* Desktop right */}
          <div className="hidden items-center gap-3 lg:flex">
            <InstallButton />

            <div className="hidden text-right xl:block">
              <p className="max-w-[150px] truncate text-sm font-semibold text-slate-700">
                {
                  user?.businessName
                }
              </p>

              <p className="text-xs text-slate-500">
                Business Account
              </p>
            </div>

            <Link
              to="/settings"
              title="Business settings"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700 transition hover:bg-indigo-200"
            >
              {user?.businessName
                ?.charAt(0)
                .toUpperCase() ||
                "B"}
            </Link>

            <button
              type="button"
              onClick={() =>
                logout()
              }
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
            >
              <LogOut
                size={17}
              />

              <span className="hidden xl:inline">
                Logout
              </span>
            </button>
          </div>

          {/* Mobile */}
          <button
            type="button"
            onClick={() =>
              setOpen(
                (value) =>
                  !value,
              )
            }
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
            aria-label="Toggle navigation"
          >
            {open ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="space-y-2 border-t border-slate-200 py-4 lg:hidden">
            <Link
              to="/settings"
              onClick={() =>
                setOpen(false)
              }
              className="mb-3 flex items-center gap-3 rounded-2xl bg-slate-50 p-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 font-bold text-indigo-700">
                {user?.businessName
                  ?.charAt(0)
                  .toUpperCase() ||
                  "B"}
              </div>

              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-700">
                  {
                    user?.businessName
                  }
                </p>

                <p className="text-xs text-slate-500">
                  Business Account
                </p>
              </div>
            </Link>

            {links.map(
              (link) => {
                const Icon =
                  link.icon;

                const active =
                  pathname ===
                  link.href;

                return (
                  <Link
                    key={
                      link.href
                    }
                    to={link.href}
                    onClick={() =>
                      setOpen(
                        false,
                      )
                    }
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                      active
                        ? "bg-indigo-600 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon
                      size={20}
                    />

                    {link.label}
                  </Link>
                );
              },
            )}

            <InstallButton
              fullWidth
            />

            <button
              type="button"
              onClick={() =>
                logout()
              }
              className="mt-2 flex w-full items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600"
            >
              <LogOut
                size={20}
              />

              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
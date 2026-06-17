import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/billing", label: "New Bill" },
  { href: "/customers", label: "Customers" },
  { href: "/khata", label: "Khata" },
  { href: "/invoices", label: "Invoices" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 no-print">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/dashboard" className="font-semibold text-lg text-gray-900">
            Bills software
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-3 py-2 rounded-md text-sm ${
                  pathname === link.href ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user && <span className="text-sm text-gray-500">{user.businessName}</span>}
            <button
              onClick={logout}
              className="text-sm px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50"
            >
              Logout
            </button>
          </div>

          <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            <span className="block w-6 h-0.5 bg-gray-700 mb-1"></span>
            <span className="block w-6 h-0.5 bg-gray-700 mb-1"></span>
            <span className="block w-6 h-0.5 bg-gray-700"></span>
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-3 flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setOpen(false)}
                className={`px-3 py-2 rounded-md text-sm ${
                  pathname === link.href ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button onClick={logout} className="text-left px-3 py-2 rounded-md text-sm border border-gray-300 mt-1">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

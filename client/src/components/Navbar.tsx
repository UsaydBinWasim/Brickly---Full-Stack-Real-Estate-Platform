"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { getToken, logout } from "@/lib/api";

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
];

function useAuthUser() {
  // useSyncExternalStore reads localStorage without triggering cascading renders
  const user = useSyncExternalStore(
    (cb) => {
      window.addEventListener("storage", cb);
      return () => window.removeEventListener("storage", cb);
    },
    () => {
      try {
        const raw = localStorage.getItem("user");
        return raw || null;
      } catch {
        return null;
      }
    },
    () => null // server snapshot
  );
  return user ? (JSON.parse(user) as { _id: string; email: string; role: string }) : null;
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthUser();

  const isLoggedIn = !!user && !!getToken();
  const isAdmin = user?.role === "admin";

  const navLinks = [
    ...publicLinks,
    ...(isLoggedIn ? [{ href: "/dashboard", label: "Dashboard" }] : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-border">
      <nav className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight text-primary">
          Brickly
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium text-muted hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <span className="text-sm text-muted">{user?.email}</span>
              <button
                onClick={logout}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-gray-50 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-muted hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white px-6 pb-4">
          <ul className="flex flex-col gap-3 pt-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block text-sm font-medium text-muted hover:text-foreground transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-2 flex flex-col gap-2">
              {isLoggedIn ? (
                <>
                  <span className="text-sm text-muted">{user?.email}</span>
                  <button
                    onClick={logout}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:text-foreground"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium text-muted hover:text-foreground">
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white text-center hover:bg-primary-dark transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

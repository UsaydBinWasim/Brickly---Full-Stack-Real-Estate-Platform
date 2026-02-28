"use client";

import Link from "next/link";
import { useState, useEffect, useSyncExternalStore } from "react";
import { getToken, logout, apiFetch } from "@/lib/api";
import ThemeToggle from "@/components/ThemeToggle";

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
  const [unread, setUnread] = useState(0);
  const user = useAuthUser();

  const isLoggedIn = !!user && !!getToken();
  const isAdmin = user?.role === "admin";

  // Fetch unread message count
  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchUnread = async () => {
      try {
        const res = await apiFetch<{ count: number }>("/chat/unread");
        if (res.success) setUnread(res.data.count);
      } catch { /* ignore */ }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const navLinks = [
    ...publicLinks,
    ...(isLoggedIn ? [{ href: "/dashboard", label: "Dashboard" }] : []),
    ...(isLoggedIn ? [{ href: "/chat", label: "Messages", badge: unread }] : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur border-b border-border">
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
                className="relative text-sm font-medium text-muted hover:text-foreground transition-colors"
              >
                {link.label}
                {"badge" in link && (link as { badge: number }).badge > 0 && (
                  <span className="absolute -top-2 -right-4 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {(link as { badge: number }).badge > 9 ? "9+" : (link as { badge: number }).badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Auth buttons + theme toggle */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {isLoggedIn ? (
            <>
              <span className="text-sm text-muted">{user?.email}</span>
              <button
                onClick={logout}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
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
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
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
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface px-6 pb-4">
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

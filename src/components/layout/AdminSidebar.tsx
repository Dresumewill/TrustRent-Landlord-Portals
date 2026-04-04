"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, LogOut, Menu, X, LayoutDashboard, BadgeCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminSidebarProps {
  fullName?: string | null;
  email?: string | null;
}

const navItems = [
  { href: "/admin/dashboard",    icon: LayoutDashboard, label: "Overview",           accent: false },
  { href: "/admin/verification", icon: BadgeCheck,       label: "Verification Queue", accent: false },
  { href: "/admin/disputes",     icon: AlertTriangle,    label: "Dispute Center",     accent: true  },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {navItems.map(({ href, icon: Icon, label, accent }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              active
                ? accent
                  ? "bg-red-950/60 text-red-300"
                  : "bg-slate-800 text-white"
                : accent
                  ? "text-red-400 hover:text-red-300 hover:bg-red-950/40"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </>
  );
}

export function AdminSidebar({ fullName, email }: AdminSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ── Desktop sidebar (lg+) ─────────────────────────── */}
      <aside className="hidden lg:flex w-64 bg-slate-900 flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div>
              <span className="font-bold text-white text-sm tracking-tight block">TrustRent</span>
              <span className="text-slate-400 text-xs">Admin Console</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-0.5 mt-2">
          <NavLinks />
        </nav>

        <div className="p-3 border-t border-slate-800">
          <div className="px-3 py-2 mb-1">
            <p className="text-white text-xs font-medium truncate">{fullName ?? "Admin"}</p>
            <p className="text-slate-500 text-xs truncate">{email}</p>
          </div>
          <form action="/api/auth/signout" method="post">
            <Button
              variant="ghost"
              type="submit"
              className="w-full justify-start gap-3 text-slate-400 hover:text-white hover:bg-slate-800 text-sm"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      {/* ── Mobile top bar (< lg) ─────────────────────────── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-3">
        <button
          onClick={() => setOpen(true)}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span className="font-bold text-white text-sm tracking-tight">TrustRent</span>
          <span className="text-slate-500 text-xs">Admin</span>
        </div>
      </header>

      {/* ── Mobile drawer overlay ─────────────────────────── */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <aside className="relative w-72 max-w-[85vw] bg-slate-900 flex flex-col shadow-xl">
            <div className="h-14 flex items-center justify-between px-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span className="font-bold text-white text-sm tracking-tight">TrustRent</span>
                <span className="text-slate-500 text-xs">Admin</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 p-3 flex flex-col gap-0.5 mt-2 overflow-y-auto">
              <NavLinks onNavigate={() => setOpen(false)} />
            </nav>

            <div className="p-3 border-t border-slate-800">
              <div className="px-3 py-2 mb-1">
                <p className="text-white text-xs font-medium truncate">{fullName ?? "Admin"}</p>
                <p className="text-slate-500 text-xs truncate">{email}</p>
              </div>
              <form action="/api/auth/signout" method="post">
                <Button
                  variant="ghost"
                  type="submit"
                  className="w-full justify-start gap-3 text-slate-400 hover:text-white hover:bg-slate-800 text-sm"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </form>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

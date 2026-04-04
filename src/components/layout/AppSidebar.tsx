"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck, LogOut, Menu, X,
  LayoutDashboard, Building2, Users, Wallet, BadgeCheck, UserCircle,
  Search, FileText, CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

const LANDLORD_NAV = [
  { href: "/landlord/dashboard",     icon: LayoutDashboard, label: "Dashboard" },
  { href: "/landlord/properties",    icon: Building2,       label: "Properties" },
  { href: "/landlord/applications",  icon: Users,           label: "Applications" },
  { href: "/landlord/transactions",  icon: Wallet,          label: "Transactions" },
  { href: "/landlord/verification",  icon: BadgeCheck,      label: "Verification" },
  { href: "/landlord/profile",       icon: UserCircle,      label: "Profile" },
] satisfies { href: string; icon: LucideIcon; label: string }[];

const TENANT_NAV = [
  { href: "/tenant/dashboard",      icon: LayoutDashboard, label: "Dashboard" },
  { href: "/tenant/search",         icon: Search,          label: "Find a Home" },
  { href: "/tenant/applications",   icon: FileText,        label: "My Applications" },
  { href: "/tenant/payments",       icon: CreditCard,      label: "Payments" },
  { href: "/tenant/profile",        icon: UserCircle,      label: "Profile" },
] satisfies { href: string; icon: LucideIcon; label: string }[];

interface AppSidebarProps {
  portal: "landlord" | "tenant";
}

function NavLinks({
  navItems,
  onNavigate,
}: {
  navItems: typeof LANDLORD_NAV | typeof TENANT_NAV;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <>
      {navItems.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              active
                ? "bg-emerald-50 text-emerald-700"
                : "text-muted-foreground hover:text-foreground hover:bg-slate-50"
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

export function AppSidebar({ portal }: AppSidebarProps) {
  const [open, setOpen] = useState(false);
  const navItems = portal === "landlord" ? LANDLORD_NAV : TENANT_NAV;

  return (
    <>
      {/* ── Desktop sidebar (lg+) ─────────────────────────── */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-border flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <span className="font-bold text-lg tracking-tight">TrustRent</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1">
          <NavLinks navItems={navItems} />
        </nav>

        <div className="p-4 border-t border-border">
          <form action="/api/auth/signout" method="post">
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" type="submit">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      {/* ── Mobile top bar (< lg) ─────────────────────────── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b border-border flex items-center px-4 gap-3">
        <button
          onClick={() => setOpen(true)}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span className="font-bold tracking-tight">TrustRent</span>
        </Link>
      </header>

      {/* ── Mobile drawer overlay ─────────────────────────── */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />

          {/* Drawer */}
          <aside className="relative w-72 max-w-[85vw] bg-white flex flex-col shadow-xl">
            <div className="h-14 flex items-center justify-between px-4 border-b border-border">
              <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <span className="font-bold tracking-tight">TrustRent</span>
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-slate-100 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
              <NavLinks navItems={navItems} onNavigate={() => setOpen(false)} />
            </nav>

            <div className="p-4 border-t border-border">
              <form action="/api/auth/signout" method="post">
                <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" type="submit">
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

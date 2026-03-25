import Link from "next/link";
import {
  ShieldCheck,
  LayoutDashboard,
  BadgeCheck,
  AlertTriangle,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin/dashboard",    icon: LayoutDashboard, label: "Overview",           accent: false },
  { href: "/admin/verification", icon: BadgeCheck,       label: "Verification Queue", accent: false },
  { href: "/admin/disputes",     icon: AlertTriangle,    label: "Dispute Center",     accent: true  },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, email")
    .eq("id", user?.id ?? "")
    .single();

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 flex flex-col shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div>
              <span className="font-bold text-white text-sm tracking-tight block">TrustRent</span>
              <span className="text-slate-400 text-xs">Admin Console</span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 flex flex-col gap-0.5 mt-2">
          {navItems.map(({ href, icon: Icon, label, accent }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                accent
                  ? "text-red-400 hover:text-red-300 hover:bg-red-950/40"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Admin info + sign out */}
        <div className="p-3 border-t border-slate-800">
          <div className="px-3 py-2 mb-1">
            <p className="text-white text-xs font-medium truncate">{profile?.full_name ?? "Admin"}</p>
            <p className="text-slate-500 text-xs truncate">{profile?.email}</p>
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

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

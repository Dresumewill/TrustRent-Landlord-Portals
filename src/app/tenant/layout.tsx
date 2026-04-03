import Link from "next/link";
import { ShieldCheck, LayoutDashboard, Search, FileText, CreditCard, LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/tenant/dashboard",      icon: LayoutDashboard, label: "Dashboard" },
  { href: "/tenant/search",         icon: Search,          label: "Find a Home" },
  { href: "/tenant/applications",   icon: FileText,        label: "My Applications" },
  { href: "/tenant/payments",       icon: CreditCard,      label: "Payments" },
  { href: "/tenant/profile",        icon: UserCircle,      label: "Profile" },
];

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-border flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <span className="font-bold text-lg tracking-tight">TrustRent</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-slate-50 transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
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

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

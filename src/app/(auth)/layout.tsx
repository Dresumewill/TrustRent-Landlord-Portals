import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col items-center justify-center p-6">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <ShieldCheck className="h-7 w-7 text-emerald-600" />
        <span className="text-2xl font-bold tracking-tight">TrustRent</span>
      </Link>
      {children}
    </div>
  );
}

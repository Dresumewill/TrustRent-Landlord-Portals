import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

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
      <AdminSidebar fullName={profile?.full_name} email={profile?.email} />

      {/* Main content — add top padding on mobile to clear the fixed header */}
      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}

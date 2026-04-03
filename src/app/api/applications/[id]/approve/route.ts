import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify the requesting user is the landlord for this application's property
  const { data: application } = await supabase
    .from("applications")
    .select("id, properties(landlord_id)")
    .eq("id", id)
    .single();

  const prop = application?.properties as unknown as { landlord_id: string } | { landlord_id: string }[] | null;
  const landlordId = Array.isArray(prop) ? prop[0]?.landlord_id : prop?.landlord_id;
  if (!application || landlordId !== user.id) redirect("/landlord/applications");

  await supabase
    .from("applications")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", id);

  redirect("/landlord/applications");
}

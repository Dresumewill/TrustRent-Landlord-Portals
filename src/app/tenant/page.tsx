import { redirect } from "next/navigation";

export default function TenantRoot() {
  redirect("/tenant/dashboard");
}

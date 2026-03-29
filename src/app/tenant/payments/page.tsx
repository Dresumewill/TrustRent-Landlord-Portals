import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EscrowActions } from "@/components/tenant/EscrowActions";
import { fmtAmount, fmtDate } from "@/lib/utils";

const statusColors: Record<string, "default" | "secondary" | "destructive"> = {
  pending: "secondary",
  held_in_escrow: "default",
  completed: "default",
  failed: "destructive",
  refunded: "secondary",
  disputed: "destructive",
};

export default async function TenantPaymentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, properties(title)")
    .eq("payer_id", user?.id ?? "")
    .order("created_at", { ascending: false });

  const total = transactions
    ?.filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="text-muted-foreground mt-1">Your escrow payment history.</p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Total Paid</p>
          <p className="text-3xl font-bold text-emerald-700">₦{fmtAmount(total)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {!transactions || transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No payment history yet.</p>
          ) : (
            <div className="flex flex-col divide-y">
              {transactions.map((tx) => (
                <div key={tx.id} className="py-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium capitalize">{tx.transaction_type}</p>
                      <p className="text-xs text-muted-foreground">
                        {(tx.properties as { title: string } | null)?.title} ·{" "}
                        {fmtDate(tx.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">₦{fmtAmount(Number(tx.amount))}</span>
                      <Badge variant={statusColors[tx.status] ?? "secondary"} className="capitalize text-xs">
                        {tx.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>

                  {tx.status === "held_in_escrow" && (
                    <EscrowActions transactionId={tx.id} />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

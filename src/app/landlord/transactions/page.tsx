import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fmtCurrency, fmtDate } from "@/lib/utils";

const statusColors: Record<string, string> = {
  pending: "secondary",
  held_in_escrow: "default",
  completed: "default",
  failed: "destructive",
  refunded: "secondary",
};

export default async function LandlordTransactionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, properties(title)")
    .eq("payee_id", user?.id ?? "")
    .order("created_at", { ascending: false });

  // Group completed totals by currency
  const totals: Record<string, number> = {};
  transactions?.filter((t) => t.status === "completed").forEach((t) => {
    totals[t.currency] = (totals[t.currency] ?? 0) + Number(t.amount);
  });

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-muted-foreground mt-1">Your payment history and escrow activity.</p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Total Received</p>
          {Object.keys(totals).length === 0 ? (
            <p className="text-3xl font-bold text-emerald-700">—</p>
          ) : (
            Object.entries(totals).map(([code, amt]) => (
              <p key={code} className="text-3xl font-bold text-emerald-700">
                {fmtCurrency(amt, code)}
              </p>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {!transactions || transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No transactions yet.</p>
          ) : (
            <div className="flex flex-col divide-y">
              {transactions.map((tx) => (
                <div key={tx.id} className="py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium capitalize">{tx.transaction_type}</p>
                    <p className="text-xs text-muted-foreground">
                      {(tx.properties as { title: string } | null)?.title} ·{" "}
                      {fmtDate(tx.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{fmtCurrency(Number(tx.amount), tx.currency)}</span>
                    <Badge variant={statusColors[tx.status] as "default" | "secondary" | "destructive"} className="capitalize text-xs">
                      {tx.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

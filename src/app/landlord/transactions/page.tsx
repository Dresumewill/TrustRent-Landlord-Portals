import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

  const total = transactions
    ?.filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-muted-foreground mt-1">Your payment history and escrow activity.</p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Total Received</p>
          <p className="text-3xl font-bold text-emerald-700">₦{total.toLocaleString()}</p>
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
                      {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">₦{Number(tx.amount).toLocaleString()}</span>
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

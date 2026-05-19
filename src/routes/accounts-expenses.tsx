import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/common/KpiCard";
import { Download, Wallet, TrendingUp, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/accounts-expenses")({
  head: () => ({ meta: [{ title: "Expense Overview" }] }),
  component: ExpenseOverview,
});

type InvStatus = "Pending" | "Approved" | "Paid" | "Rejected";

interface Invoice {
  id: string;
  vendor: string;
  poRef: string;
  flight: string;
  amount: number;
  submittedBy: string;
  date: string;
  paymentMethod: string;
  status: InvStatus;
}

const INVOICES: Invoice[] = [
  { id: "INV-1041", vendor: "Fresh Farms Ltd", poRef: "PO-2025-0451", flight: "BS-315", amount: 24500, submittedBy: "S. Ahmed", date: "2025-11-05", paymentMethod: "Bank Transfer", status: "Paid" },
  { id: "INV-1042", vendor: "Premium Supplies Co", poRef: "PO-2025-0452", flight: "BS-316", amount: 30000, submittedBy: "M. Karim", date: "2025-11-05", paymentMethod: "Bank Transfer", status: "Approved" },
  { id: "INV-1043", vendor: "AlRahman Trading", poRef: "PO-2025-0450", flight: "BS-307", amount: 18400, submittedBy: "N. Hasan", date: "2025-11-06", paymentMethod: "Cheque", status: "Pending" },
  { id: "INV-1044", vendor: "Metro Wholesale", poRef: "PO-2025-0449", flight: "BS-203", amount: 45200, submittedBy: "A. Khan", date: "2025-11-06", paymentMethod: "Bank Transfer", status: "Pending" },
  { id: "INV-1045", vendor: "Halal Meats Co.", poRef: "PO-2025-0448", flight: "BS-141", amount: 22800, submittedBy: "S. Ahmed", date: "2025-11-07", paymentMethod: "Cheque", status: "Rejected" },
  { id: "INV-1046", vendor: "Fresh Farms Ltd", poRef: "PO-2025-0447", flight: "BS-225", amount: 16900, submittedBy: "M. Karim", date: "2025-11-07", paymentMethod: "Bank Transfer", status: "Paid" },
];

function statusColor(status: string) {
  switch (status) {
    case "Pending": return "bg-amber-100 text-amber-800";
    case "Approved": return "bg-blue-100 text-blue-800";
    case "Paid": return "bg-green-100 text-green-800";
    case "Rejected": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

function ExpenseOverview() {
  const totalInvoiced = useMemo(() => INVOICES.reduce((s, i) => s + i.amount, 0), []);
  const totalPaid = useMemo(() => INVOICES.filter(i => i.status === "Paid").reduce((s, i) => s + i.amount, 0), []);
  const totalOutstanding = useMemo(() =>
    INVOICES.filter(i => i.status === "Pending" || i.status === "Approved").reduce((s, i) => s + i.amount, 0), []);
  const totalRejected = useMemo(() => INVOICES.filter(i => i.status === "Rejected").reduce((s, i) => s + i.amount, 0), []);

  // Vendor breakdown
  const vendorBreakdown = useMemo(() => {
    const map: Record<string, { invoices: number; total: number; paid: number; outstanding: number; rejected: number }> = {};
    INVOICES.forEach(inv => {
      if (!map[inv.vendor]) map[inv.vendor] = { invoices: 0, total: 0, paid: 0, outstanding: 0, rejected: 0 };
      map[inv.vendor].invoices += 1;
      map[inv.vendor].total += inv.amount;
      if (inv.status === "Paid") map[inv.vendor].paid += inv.amount;
      else if (inv.status === "Rejected") map[inv.vendor].rejected += inv.amount;
      else map[inv.vendor].outstanding += inv.amount;
    });
    return Object.entries(map)
      .map(([vendor, d]) => ({ vendor, ...d }))
      .sort((a, b) => b.total - a.total);
  }, []);

  // Payment method breakdown
  const methodBreakdown = useMemo(() => {
    const map: Record<string, { invoices: number; total: number }> = {};
    INVOICES.forEach(inv => {
      if (!map[inv.paymentMethod]) map[inv.paymentMethod] = { invoices: 0, total: 0 };
      map[inv.paymentMethod].invoices += 1;
      map[inv.paymentMethod].total += inv.amount;
    });
    return Object.entries(map)
      .map(([method, d]) => ({ method, ...d }))
      .sort((a, b) => b.total - a.total);
  }, []);

  // Recent paid invoices
  const recentPaid = useMemo(() =>
    INVOICES.filter(i => i.status === "Paid").sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    []
  );

  const payRate = totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0;

  return (
    <>
      <PageHeader
        title="Expense Overview"
        subtitle="Financial spend summary — vendor-wise breakdown, payment status and settlement tracking"
        actions={
          <Button variant="outline" onClick={() => toast.success("Export started.")}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Invoiced" value={`৳${totalInvoiced.toLocaleString()}`} icon={Wallet} tone="navy" />
        <KpiCard
          label="Total Paid"
          value={`৳${totalPaid.toLocaleString()}`}
          sub={`${payRate}% settlement rate`}
          icon={TrendingUp}
          tone="success"
        />
        <KpiCard
          label="Outstanding"
          value={`৳${totalOutstanding.toLocaleString()}`}
          sub="Pending + Approved"
          icon={Clock}
          tone="warning"
        />
        <KpiCard label="Rejected Amount" value={`৳${totalRejected.toLocaleString()}`} icon={XCircle} tone="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Vendor Breakdown */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Vendor Spend Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      {["Vendor", "Invoices", "Total (৳)", "Paid (৳)", "Outstanding (৳)", "Status"].map(h => (
                        <th key={h} className="p-3 text-left font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {vendorBreakdown.map(row => {
                      const cleared = row.outstanding === 0 && row.rejected === 0;
                      const allRejected = row.paid === 0 && row.outstanding === 0;
                      const statusLabel = cleared ? "Cleared" : allRejected ? "Rejected" : row.outstanding > 0 ? "Outstanding" : "Partial";
                      const sColor = cleared ? "bg-green-100 text-green-800" : allRejected ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800";
                      return (
                        <tr key={row.vendor} className="border-b hover:bg-muted/30">
                          <td className="p-3 font-medium">{row.vendor}</td>
                          <td className="p-3 text-center">{row.invoices}</td>
                          <td className="p-3 font-medium">৳{row.total.toLocaleString()}</td>
                          <td className="p-3 text-success">৳{row.paid.toLocaleString()}</td>
                          <td className="p-3 text-amber-600">
                            {row.outstanding > 0 ? `৳${row.outstanding.toLocaleString()}` : "—"}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${sColor}`}>{statusLabel}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t bg-muted/30 font-semibold">
                      <td className="p-3">Total</td>
                      <td className="p-3 text-center">{INVOICES.length}</td>
                      <td className="p-3">৳{totalInvoiced.toLocaleString()}</td>
                      <td className="p-3 text-success">৳{totalPaid.toLocaleString()}</td>
                      <td className="p-3 text-amber-600">৳{totalOutstanding.toLocaleString()}</td>
                      <td className="p-3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Payment Method Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Payment Method Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left font-semibold">Method</th>
                    <th className="p-3 text-left font-semibold">Invoices</th>
                    <th className="p-3 text-left font-semibold">Amount (৳)</th>
                  </tr>
                </thead>
                <tbody>
                  {methodBreakdown.map(row => (
                    <tr key={row.method} className="border-b hover:bg-muted/30">
                      <td className="p-3">{row.method}</td>
                      <td className="p-3 text-center">{row.invoices}</td>
                      <td className="p-3 font-medium">৳{row.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Payment Status Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Status Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(["Paid", "Approved", "Pending", "Rejected"] as InvStatus[]).map(status => {
                  const count = INVOICES.filter(i => i.status === status).length;
                  const amount = INVOICES.filter(i => i.status === status).reduce((s, i) => s + i.amount, 0);
                  const pct = totalInvoiced > 0 ? Math.round((amount / totalInvoiced) * 100) : 0;
                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor(status)}`}>{status}</span>
                          <span className="text-muted-foreground">{count} invoice{count !== 1 ? "s" : ""}</span>
                        </span>
                        <span className="font-medium">৳{amount.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={
                            status === "Paid" ? "h-full rounded-full bg-green-500"
                            : status === "Approved" ? "h-full rounded-full bg-blue-500"
                            : status === "Pending" ? "h-full rounded-full bg-amber-500"
                            : "h-full rounded-full bg-red-400"
                          }
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="text-right text-xs text-muted-foreground mt-0.5">{pct}%</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Payments */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Recent Payments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentPaid.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">No payments recorded</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    {["Invoice #", "Vendor", "PO Ref", "Flight", "Amount (৳)", "Payment Method", "Paid By", "Date"].map(h => (
                      <th key={h} className="p-3 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentPaid.map(inv => (
                    <tr key={inv.id} className="border-b hover:bg-muted/30">
                      <td className="p-3 font-medium">{inv.id}</td>
                      <td className="p-3">{inv.vendor}</td>
                      <td className="p-3 text-muted-foreground">{inv.poRef}</td>
                      <td className="p-3">{inv.flight}</td>
                      <td className="p-3 font-medium">৳{inv.amount.toLocaleString()}</td>
                      <td className="p-3 text-muted-foreground">{inv.paymentMethod}</td>
                      <td className="p-3">{inv.submittedBy}</td>
                      <td className="p-3 text-muted-foreground">{inv.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet, FileType, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports" }] }),
  component: Reports,
});

const REPORTS = [
  { name: "Daily Meal Supply Report", desc: "Per-flight meal supply summary for the day" },
  { name: "Passenger Meal Analysis", desc: "Special vs standard meal consumption by sector" },
  { name: "Inventory Consumption", desc: "Item-wise consumption with FIFO depletion" },
  { name: "Procurement Report", desc: "PO summary, vendor spend, lead times" },
  { name: "Vendor Performance", desc: "On-time %, quality issues, ratings" },
  { name: "QC Audit Report", desc: "HACCP, temperature logs, corrective actions" },
  { name: "Wastage Report", desc: "Production yield, returns, expiry waste" },
  { name: "Financial Summary", desc: "Cost per meal, budget vs actual, P&L" },
];

function Reports() {
  return (
    <>
      <PageHeader title="Reports & Analytics" subtitle="Generate and export operational reports" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORTS.map(r => (
          <Card key={r.name} className="hover:shadow-md transition">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> {r.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{r.desc}</p>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => toast.success(`PDF: ${r.name}`)}>
                  <FileType className="h-4 w-4 mr-1" /> PDF
                </Button>
                <Button size="sm" variant="outline" onClick={() => toast.success(`Excel: ${r.name}`)}>
                  <FileSpreadsheet className="h-4 w-4 mr-1" /> Excel
                </Button>
                <Button size="sm" onClick={() => toast.success(`CSV: ${r.name}`)}>
                  <Download className="h-4 w-4 mr-1" /> CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

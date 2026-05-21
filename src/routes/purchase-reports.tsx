import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart } from "lucide-react";

export const Route = createFileRoute("/purchase-reports")({
  head: () => ({ meta: [{ title: "Purchase Reports" }] }),
  component: PurchaseReportsPage,
});

function PurchaseReportsPage() {
  return (
    <>
      <PageHeader
        title="Purchase Reports"
        subtitle="Procurement analytics — supplier-wise spend, category mix, and PR/PO cycle times"
      />
      <Card>
        <CardContent className="py-16 text-center">
          <LineChart className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <div className="text-sm font-medium text-foreground">Purchase Reports</div>
          <div className="text-xs text-muted-foreground mt-1">Module under construction.</div>
        </CardContent>
      </Card>
    </>
  );
}

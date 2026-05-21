import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export const Route = createFileRoute("/quotation-entry")({
  head: () => ({ meta: [{ title: "Quotation Entry" }] }),
  component: QuotationEntryPage,
});

function QuotationEntryPage() {
  return (
    <>
      <PageHeader
        title="Quotation Entry"
        subtitle="Capture supplier quotations against an RFQ"
      />
      <Card>
        <CardContent className="py-16 text-center">
          <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <div className="text-sm font-medium text-foreground">Quotation Entry</div>
          <div className="text-xs text-muted-foreground mt-1">Module under construction.</div>
        </CardContent>
      </Card>
    </>
  );
}

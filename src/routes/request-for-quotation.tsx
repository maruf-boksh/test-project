import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { MailQuestion } from "lucide-react";

export const Route = createFileRoute("/request-for-quotation")({
  head: () => ({ meta: [{ title: "Request for Quotation" }] }),
  component: RequestForQuotationPage,
});

function RequestForQuotationPage() {
  return (
    <>
      <PageHeader
        title="Request for Quotation"
        subtitle="Issue RFQs to suppliers and collect their responses"
      />
      <Card>
        <CardContent className="py-16 text-center">
          <MailQuestion className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <div className="text-sm font-medium text-foreground">Request for Quotation</div>
          <div className="text-xs text-muted-foreground mt-1">Module under construction.</div>
        </CardContent>
      </Card>
    </>
  );
}

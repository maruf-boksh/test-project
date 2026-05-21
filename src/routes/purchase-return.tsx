import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Undo2 } from "lucide-react";

export const Route = createFileRoute("/purchase-return")({
  head: () => ({ meta: [{ title: "Purchase Return" }] }),
  component: PurchaseReturnPage,
});

function PurchaseReturnPage() {
  return (
    <>
      <PageHeader
        title="Purchase Return"
        subtitle="Return received items to suppliers — defective, short-shipped, or rejected stock"
      />
      <Card>
        <CardContent className="py-16 text-center">
          <Undo2 className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <div className="text-sm font-medium text-foreground">Purchase Return</div>
          <div className="text-xs text-muted-foreground mt-1">Module under construction.</div>
        </CardContent>
      </Card>
    </>
  );
}

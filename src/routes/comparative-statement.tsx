import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Scale } from "lucide-react";

export const Route = createFileRoute("/comparative-statement")({
  head: () => ({ meta: [{ title: "Comparative Statement" }] }),
  component: ComparativeStatementPage,
});

function ComparativeStatementPage() {
  return (
    <>
      <PageHeader
        title="Comparative Statement"
        subtitle="Compare supplier quotations side-by-side to pick the awarded vendor"
      />
      <Card>
        <CardContent className="py-16 text-center">
          <Scale className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <div className="text-sm font-medium text-foreground">Comparative Statement</div>
          <div className="text-xs text-muted-foreground mt-1">Module under construction.</div>
        </CardContent>
      </Card>
    </>
  );
}

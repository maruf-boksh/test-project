import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";

export const Route = createFileRoute("/production-reports")({
  head: () => ({ meta: [{ title: "Production Reports" }] }),
  component: ProductionReports,
});

function ProductionReports() {
  return (
    <PageHeader
      title="Production Reports"
      subtitle="Coming soon."
    />
  );
}

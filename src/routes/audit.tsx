import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { RowActions } from "@/components/common/RowActions";

export const Route = createFileRoute("/audit")({
  head: () => ({ meta: [{ title: "Audit Logs" }] }),
  component: Audit,
});

const LOGS = [
  { id: "LG-9001", at: "2025-11-05 06:14", user: "ops.user", action: "Manifest Imported", target: "BS-203", ip: "10.0.4.12" },
  { id: "LG-9002", at: "2025-11-05 06:08", user: "fin.admin", action: "PO Approved", target: "PO-2025-0450", ip: "10.0.4.18" },
  { id: "LG-9003", at: "2025-11-05 05:52", user: "qc.fb", action: "QC Failed", target: "PRD-9006", ip: "10.0.4.21" },
  { id: "LG-9004", at: "2025-11-05 05:30", user: "kit.akhan", action: "Production Started", target: "PRD-9003", ip: "10.0.4.45" },
  { id: "LG-9005", at: "2025-11-05 05:15", user: "store.adm", action: "Low Stock Alert", target: "INV-1005", ip: "10.0.4.55" },
  { id: "LG-9006", at: "2025-11-05 04:50", user: "admin", action: "User Created", target: "U-007", ip: "10.0.4.10" },
];

type L = (typeof LOGS)[number];

function Audit() {
  const cols: Column<L>[] = [
    { key: "id", header: "Log ID" },
    { key: "at", header: "Timestamp" },
    { key: "user", header: "User" },
    { key: "action", header: "Action" },
    { key: "target", header: "Target" },
    { key: "ip", header: "IP Address" },
  ];
  return (
    <>
      <PageHeader title="Audit Logs" subtitle="Immutable system activity trail" />
      <DataTable
        title="audit"
        data={LOGS}
        columns={cols}
        searchKeys={["user", "action", "target", "ip"]}
        actions={(r) => <RowActions row={r} actions={["view", "export"]} />}
      />
    </>
  );
}

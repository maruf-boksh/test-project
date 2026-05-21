import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ShieldAlert, AlertCircle, Wrench, CheckCircle2 } from "lucide-react";
import { damageReports } from "@/lib/sample-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/equipment-damage")({
  head: () => ({ meta: [{ title: "Damage Reports" }] }),
  component: EquipmentDamagePage,
});

function EquipmentDamagePage() {
  const total = damageReports.length;
  const open = damageReports.filter((d) => d.status === "Open").length;
  const underRepair = damageReports.filter((d) => d.status === "Under Repair").length;
  const repaired = damageReports.filter((d) => d.status === "Repaired").length;

  return (
    <>
      <PageHeader
        title="Damage Reports"
        subtitle="Equipment damage incidents — severity, repair status and history"
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Reports" value={total} icon={ShieldAlert} tone="navy" />
        <KpiCard label="Open" value={open} icon={AlertCircle} tone="red" />
        <KpiCard label="Under Repair" value={underRepair} icon={Wrench} tone="warning" />
        <KpiCard label="Repaired" value={repaired} icon={CheckCircle2} tone="success" />
      </div>

      <div className="border border-border rounded-md overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-14 text-xs uppercase tracking-wider">SL</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Report ID</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Date</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Asset</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Severity</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Reported By</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Description</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {damageReports.map((d, i) => (
              <TableRow key={d.id} className="hover:bg-muted/30">
                <TableCell className="text-xs text-muted-foreground tabular-nums">{i + 1}</TableCell>
                <TableCell className="font-mono text-xs">{d.id}</TableCell>
                <TableCell className="tabular-nums text-xs">{d.date}</TableCell>
                <TableCell>
                  <div className="font-medium">{d.assetName}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{d.assetId}</div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px]",
                      d.severity === "Minor" && "border-success/40 bg-success/10 text-success",
                      d.severity === "Moderate" && "border-warning/40 bg-warning/10 text-warning",
                      d.severity === "Severe" && "border-destructive/40 bg-destructive/10 text-destructive",
                    )}
                  >
                    {d.severity}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs">{d.reportedBy}</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[300px]">{d.description}</TableCell>
                <TableCell><StatusBadge status={d.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

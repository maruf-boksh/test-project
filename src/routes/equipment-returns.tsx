import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Undo2, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";
import { equipmentReturns } from "@/lib/sample-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/equipment-returns")({
  head: () => ({ meta: [{ title: "Equipment Returns" }] }),
  component: EquipmentReturnsPage,
});

function EquipmentReturnsPage() {
  const total = equipmentReturns.length;
  const good = equipmentReturns.filter((r) => r.condition === "Good").length;
  const minor = equipmentReturns.filter((r) => r.condition === "Minor Issue").length;
  const damaged = equipmentReturns.filter((r) => r.condition === "Damaged").length;

  return (
    <>
      <PageHeader
        title="Equipment Returns"
        subtitle="Post-flight equipment returns log — condition recorded by the dispatch handler on arrival"
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Returns" value={total} icon={Undo2} tone="navy" />
        <KpiCard label="Good Condition" value={good} icon={CheckCircle2} tone="success" />
        <KpiCard label="Minor Issues" value={minor} icon={AlertTriangle} tone="warning" />
        <KpiCard label="Damaged" value={damaged} icon={ShieldAlert} tone="red" />
      </div>

      <div className="border border-border rounded-md overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-14 text-xs uppercase tracking-wider">SL</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Return ID</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Date</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Flight</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Asset</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Returned By</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Condition</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipmentReturns.map((r, i) => (
              <TableRow key={r.id} className="hover:bg-muted/30">
                <TableCell className="text-xs text-muted-foreground tabular-nums">{i + 1}</TableCell>
                <TableCell className="font-mono text-xs">{r.id}</TableCell>
                <TableCell className="tabular-nums text-xs">{r.date}</TableCell>
                <TableCell className="font-medium">{r.flight}</TableCell>
                <TableCell>
                  <div className="font-medium">{r.assetName}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{r.assetId}</div>
                </TableCell>
                <TableCell className="text-xs">{r.returnedBy}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px]",
                      r.condition === "Good" && "border-success/40 bg-success/10 text-success",
                      r.condition === "Minor Issue" && "border-warning/40 bg-warning/10 text-warning",
                      r.condition === "Damaged" && "border-destructive/40 bg-destructive/10 text-destructive",
                    )}
                  >
                    {r.condition}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{r.remarks ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

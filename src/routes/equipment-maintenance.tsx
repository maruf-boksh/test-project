import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Wrench, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { equipmentAssets } from "@/lib/sample-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/equipment-maintenance")({
  head: () => ({ meta: [{ title: "Equipment Maintenance" }] }),
  component: EquipmentMaintenancePage,
});

function EquipmentMaintenancePage() {
  const today = new Date().toISOString().slice(0, 10);
  const cutoff30 = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

  const eligible = equipmentAssets.filter(
    (a) => a.status !== "Damaged" && a.status !== "Retired",
  );
  const overdue = eligible.filter((a) => a.nextMaintenance <= today);
  const dueSoon = eligible.filter((a) => a.nextMaintenance > today && a.nextMaintenance <= cutoff30);
  const allDue = [...overdue, ...dueSoon].sort((a, b) => a.nextMaintenance.localeCompare(b.nextMaintenance));

  return (
    <>
      <PageHeader
        title="Equipment Maintenance"
        subtitle="Service-due watchlist for trolleys, racks, containers and galley equipment"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard label="Overdue" value={overdue.length} icon={AlertTriangle} tone="red" />
        <KpiCard label="Due in 30d" value={dueSoon.length} icon={Clock} tone="warning" />
        <KpiCard label="All Caught Up" value={eligible.length - allDue.length} icon={CheckCircle2} tone="success" />
      </div>

      {allDue.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Wrench className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <div className="text-sm font-medium text-foreground">All caught up</div>
            <div className="text-xs text-muted-foreground mt-1">
              No assets due for maintenance in the next 30 days.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="border border-border rounded-md overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-xs uppercase tracking-wider">Asset</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Category</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Location</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Last Maint.</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Next Maint.</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-right">Days</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allDue.map((a) => {
                const isOverdue = a.nextMaintenance <= today;
                const days = Math.round(
                  (new Date(a.nextMaintenance).getTime() - new Date(today).getTime()) / 86400000,
                );
                return (
                  <TableRow key={a.id} className={cn("hover:bg-muted/30", isOverdue && "bg-destructive/5")}>
                    <TableCell>
                      <div className="font-medium">{a.name}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{a.id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{a.category}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">{a.location}</TableCell>
                    <TableCell className="tabular-nums text-xs">{a.lastMaintenance}</TableCell>
                    <TableCell className="tabular-nums text-xs">{a.nextMaintenance}</TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          "tabular-nums text-xs font-semibold",
                          isOverdue ? "text-destructive" : days <= 7 ? "text-warning" : "text-muted-foreground",
                        )}
                      >
                        {isOverdue ? `${Math.abs(days)}d overdue` : `${days}d`}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}

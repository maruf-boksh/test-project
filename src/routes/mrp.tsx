import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Calculator, FileText, Package, PackageOpen, Wrench, History, CheckCircle2,
  AlertCircle, Search, CalendarRange,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkflow, type WfMrpRun, type WfMrpMaterial } from "@/lib/workflow-store";

export const Route = createFileRoute("/mrp")({
  head: () => ({ meta: [{ title: "Material Requirement Planning" }] }),
  component: MrpPage,
});

function downloadCsv(run: WfMrpRun) {
  const header = [
    "MRP Run", "Date", "Run By", "Basis",
    "Bucket", "Item Code", "Item Name", "UoM",
    "Required Qty", "On Hand", "Shortfall",
    "Rate (BDT)", "Total Cost (BDT)", "Supplier",
  ];
  const rows = run.materials.map((m) => [
    run.id, run.date, run.runBy, run.basis,
    m.bucket, m.itemCode, m.itemName, m.uom,
    m.reqQty.toFixed(3), m.onHand.toString(), m.shortfall.toFixed(3),
    m.rate.toString(), m.totalCost.toFixed(2), m.supplier ?? "",
  ]);
  const csv = [header, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${run.id}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function MrpPage() {
  const { mrpRuns } = useWorkflow();
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<WfMrpRun | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return mrpRuns.filter((r) => {
      if (q && !r.id.toLowerCase().includes(q) && !r.runBy.toLowerCase().includes(q)) return false;
      const day = r.date.slice(0, 10);
      if (from && day < from) return false;
      if (to && day > to) return false;
      return true;
    });
  }, [mrpRuns, search, from, to]);

  const totalRuns = filtered.length;
  const totalCost = filtered.reduce((s, r) => s + r.totalCost, 0);
  const totalPRs = filtered.reduce((s, r) => s + r.requisitionIds.length, 0);
  const totalTransfers = filtered.reduce((s, r) => s + r.transferIds.length, 0);

  return (
    <>
      <PageHeader
        title="Material Requirement Planning"
        subtitle="History of MRP runs — each row links to the auto-generated Purchase Requisitions and Internal Transfers"
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Runs" value={totalRuns} icon={Calculator} tone="navy" />
        <KpiCard label="Total Plan Value" value={`৳ ${totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={History} tone="success" />
        <KpiCard label="PRs Generated" value={totalPRs} icon={FileText} tone="warning" />
        <KpiCard label="Transfers Generated" value={totalTransfers} icon={PackageOpen} tone="navy" />
      </div>

      <Card className="mb-4">
        <CardContent className="pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-72">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search MRP id, run by…"
                className="pl-8 h-8"
              />
            </div>
            <div className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 shadow-sm">
              <CalendarRange className="h-3.5 w-3.5 text-muted-foreground" />
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">From</Label>
              <Input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="h-7 w-[140px] border-0 shadow-none px-1 focus-visible:ring-0"
              />
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">To</Label>
              <Input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="h-7 w-[140px] border-0 shadow-none px-1 focus-visible:ring-0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Calculator className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <div className="text-sm font-medium text-foreground">No MRP runs yet</div>
            <div className="text-xs text-muted-foreground mt-1">
              Open <strong className="text-foreground">/production-entry</strong> and click{" "}
              <strong className="text-foreground">Run MRP</strong> to generate a requirement plan.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="border border-border rounded-md overflow-hidden bg-card">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-xs uppercase tracking-wider">MRP #</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Date</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Run By</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Basis</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-right">Orders</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-right">Units</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-right">Materials</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-right">Shortfall</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">PRs</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Transfers</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-right">Plan Value</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => {
                const shortfallCount = r.materials.filter((m) => m.shortfall > 0).length;
                return (
                  <TableRow key={r.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs font-semibold text-primary">{r.id}</TableCell>
                    <TableCell className="text-xs tabular-nums">{r.date}</TableCell>
                    <TableCell className="text-xs">{r.runBy}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {r.basis === "remaining" ? "Remaining Only" : "Full Order Qty"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-xs">{r.orderIds.length}</TableCell>
                    <TableCell className="text-right tabular-nums text-xs">{r.totalUnits.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums text-xs">{r.materials.length}</TableCell>
                    <TableCell className={cn(
                      "text-right tabular-nums text-xs",
                      shortfallCount > 0 ? "text-warning font-medium" : "text-success",
                    )}>
                      {shortfallCount > 0 ? shortfallCount : "0"}
                    </TableCell>
                    <TableCell>
                      {r.requisitionIds.length === 0 ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <Badge variant="outline" className="text-[10px] border-success/40 bg-success/10 text-success">
                          {r.requisitionIds.length}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {r.transferIds.length === 0 ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <Badge variant="outline" className="text-[10px] border-navy/40 bg-navy/10 text-navy">
                          {r.transferIds.length}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-xs font-semibold">
                      ৳ {r.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-[11px]"
                          onClick={() => setSelected(r)}
                        >
                          View
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => downloadCsv(r)}
                          title="Download CSV"
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <MrpRunDetailDialog run={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function MrpRunDetailDialog({
  run, onClose,
}: { run: WfMrpRun | null; onClose: () => void }) {
  return (
    <Dialog open={!!run} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            MRP Run
            {run && (
              <span className="font-mono text-sm text-muted-foreground ml-1">— {run.id}</span>
            )}
          </DialogTitle>
        </DialogHeader>

        {run && (
          <div className="flex-1 overflow-y-auto">
            {/* Summary */}
            <div className="px-6 py-4 border-b border-border bg-muted/20">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Stat label="Run By" value={run.runBy} />
                <Stat label="Date" value={run.date} mono />
                <Stat label="Basis" value={run.basis === "remaining" ? "Remaining Only" : "Full Order Qty"} />
                <Stat label="Orders" value={run.orderIds.length.toString()} />
                <Stat label="Units Planned" value={run.totalUnits.toLocaleString()} />
                <Stat label="Materials" value={run.materials.length.toString()} />
                <Stat
                  label="Shortfalls"
                  value={run.materials.filter((m) => m.shortfall > 0).length.toString()}
                />
                <Stat
                  label="Plan Value"
                  value={`৳ ${run.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                  tone="primary"
                />
              </div>
            </div>

            {/* Production Orders covered */}
            <div className="px-6 py-4 border-b border-border">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
                Production Orders Covered
              </div>
              <div className="flex flex-wrap gap-1.5">
                {run.orderIds.map((id) => (
                  <Badge key={id} variant="outline" className="font-mono text-[11px]">
                    {id}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Generated artifacts */}
            <div className="px-6 py-4 border-b border-border grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-md border border-success/30 bg-success/5 px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-success" />
                  <span className="text-sm font-semibold uppercase tracking-wider text-success">
                    Purchase Requisitions ({run.requisitionIds.length})
                  </span>
                </div>
                {run.requisitionIds.length === 0 ? (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3" /> No shortfall — nothing to procure.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {run.requisitionIds.map((id) => (
                      <Badge
                        key={id}
                        variant="outline"
                        className="font-mono text-[10px] border-success/40 bg-card"
                      >
                        {id}
                      </Badge>
                    ))}
                    <p className="w-full text-[10px] text-muted-foreground mt-1">
                      View in <strong>Purchase Requisition</strong> or <strong>Procurement</strong>.
                    </p>
                  </div>
                )}
              </div>
              <div className="rounded-md border border-navy/30 bg-navy/5 px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <PackageOpen className="h-4 w-4 text-navy" />
                  <span className="text-sm font-semibold uppercase tracking-wider text-navy">
                    Internal Transfers ({run.transferIds.length})
                  </span>
                </div>
                {run.transferIds.length === 0 ? (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <AlertCircle className="h-3 w-3" /> No on-hand stock to allocate.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {run.transferIds.map((id) => (
                      <Badge
                        key={id}
                        variant="outline"
                        className="font-mono text-[10px] border-navy/40 bg-card"
                      >
                        {id}
                      </Badge>
                    ))}
                    <p className="w-full text-[10px] text-muted-foreground mt-1">
                      View in <strong>Transfer</strong> or <strong>Item Issue</strong>.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Materials breakdown */}
            <div className="px-6 py-4 space-y-4">
              <MaterialBucket
                title="Raw Materials"
                icon={Package}
                items={run.materials.filter((m) => m.bucket === "Raw")}
                tone="primary"
              />
              <MaterialBucket
                title="Packaging"
                icon={PackageOpen}
                items={run.materials.filter((m) => m.bucket === "Packaging")}
                tone="navy"
              />
              <MaterialBucket
                title="Other Consumption"
                icon={Wrench}
                items={run.materials.filter((m) => m.bucket === "Other")}
                tone="muted"
              />
            </div>
          </div>
        )}

        <DialogFooter className="px-6 py-3 border-t border-border bg-muted/20">
          {run && (
            <Button variant="outline" onClick={() => downloadCsv(run)}>
              <FileText className="h-4 w-4 mr-1.5" /> Download CSV
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Stat({
  label, value, mono, tone,
}: { label: string; value: string; mono?: boolean; tone?: "primary" }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn(
        "mt-0.5 text-sm font-semibold",
        mono && "font-mono text-xs",
        tone === "primary" ? "text-primary" : "text-foreground",
      )}>
        {value}
      </div>
    </div>
  );
}

function MaterialBucket({
  title, icon: Icon, items, tone,
}: {
  title: string;
  icon: typeof Package;
  items: WfMrpMaterial[];
  tone: "primary" | "navy" | "muted";
}) {
  if (items.length === 0) return null;
  const total = items.reduce((s, m) => s + m.totalCost, 0);
  const shortfallCount = items.filter((m) => m.shortfall > 0).length;
  const headerTint =
    tone === "primary" ? "bg-primary/5 text-primary" :
    tone === "navy"    ? "bg-navy/5 text-navy" :
    "bg-muted/40 text-muted-foreground";

  return (
    <div>
      <div className={cn(
        "flex items-center justify-between rounded-t-md px-3 py-2 border border-b-0 border-border",
        headerTint,
      )}>
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5" />
          <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
          <Badge variant="outline" className="text-[10px] bg-card">
            {items.length}
          </Badge>
          {shortfallCount > 0 && (
            <Badge variant="outline" className="text-[10px] border-warning/40 bg-warning/10 text-warning">
              {shortfallCount} shortfall
            </Badge>
          )}
        </div>
        <span className="text-xs font-semibold tabular-nums">
          ৳ {total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </span>
      </div>
      <div className="border border-border rounded-b-md overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-8 text-[10px] uppercase tracking-wider">SL</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider w-24">Code</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider">Material</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider w-14">UoM</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-right w-24">Req. Qty</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-right w-20">On Hand</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-right w-24">Shortfall</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider">Supplier</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-right w-24">Total (৳)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((m, i) => {
              const isShort = m.shortfall > 0;
              return (
                <TableRow key={m.itemCode} className={cn("hover:bg-muted/20", isShort && "bg-destructive/5")}>
                  <TableCell className="text-xs tabular-nums text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-mono text-xs">{m.itemCode}</TableCell>
                  <TableCell className="text-sm font-medium">{m.itemName}</TableCell>
                  <TableCell className="text-xs">{m.uom}</TableCell>
                  <TableCell className="text-right tabular-nums text-sm font-semibold">
                    {m.reqQty.toLocaleString(undefined, { maximumFractionDigits: 3 })}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-xs text-muted-foreground">
                    {m.onHand.toLocaleString()}
                  </TableCell>
                  <TableCell className={cn(
                    "text-right tabular-nums text-sm font-semibold",
                    isShort ? "text-destructive" : "text-success",
                  )}>
                    {isShort ? m.shortfall.toLocaleString(undefined, { maximumFractionDigits: 3 }) : "—"}
                  </TableCell>
                  <TableCell className="text-[11px]">
                    {isShort ? (
                      <span className="text-muted-foreground">{m.supplier}</span>
                    ) : (
                      <span className="text-success">In stock</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-sm font-semibold">
                    ৳ {m.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

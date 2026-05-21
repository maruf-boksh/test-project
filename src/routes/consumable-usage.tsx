import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Send, Plane, Layers, Coins } from "lucide-react";
import { consumableUsage, consumableItems } from "@/lib/sample-data";

export const Route = createFileRoute("/consumable-usage")({
  head: () => ({ meta: [{ title: "Consumable Usage Tracking" }] }),
  component: ConsumableUsagePage,
});

function ConsumableUsagePage() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return consumableUsage;
    return consumableUsage.filter(
      (u) =>
        u.flight.toLowerCase().includes(q) ||
        u.itemName.toLowerCase().includes(q) ||
        u.itemId.toLowerCase().includes(q) ||
        u.sector.toLowerCase().includes(q),
    );
  }, [search]);

  const totalEntries = consumableUsage.length;
  const totalQty = consumableUsage.reduce((s, u) => s + u.qty, 0);
  const flightsCovered = new Set(consumableUsage.map((u) => u.flight)).size;
  const totalValue = consumableUsage.reduce((s, u) => {
    const item = consumableItems.find((i) => i.id === u.itemId);
    return s + u.qty * (item?.unitCost ?? 0);
  }, 0);

  return (
    <>
      <PageHeader
        title="Consumable Usage Tracking"
        subtitle="Per-flight consumption log for napkins, cups, cutlery, kits and packaging materials"
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Usage Entries" value={totalEntries} icon={Send} tone="navy" />
        <KpiCard label="Flights Covered" value={flightsCovered} icon={Plane} tone="success" />
        <KpiCard label="Total Units Loaded" value={totalQty.toLocaleString()} icon={Layers} tone="warning" />
        <KpiCard
          label="Total Value"
          value={`৳ ${Math.round(totalValue).toLocaleString()}`}
          icon={Coins}
          tone="success"
        />
      </div>

      <Card className="mb-4">
        <CardContent className="pt-5">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by flight, sector, item code or item name…"
            className="h-9"
          />
        </CardContent>
      </Card>

      <div className="border border-border rounded-md overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-14 text-xs uppercase tracking-wider">SL</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Usage ID</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Date</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Flight</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Sector</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Class</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Item</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-right">Qty</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-8">
                  No usage entries match.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((u, i) => {
                const item = consumableItems.find((it) => it.id === u.itemId);
                const value = u.qty * (item?.unitCost ?? 0);
                return (
                  <TableRow key={u.id} className="hover:bg-muted/30">
                    <TableCell className="text-xs text-muted-foreground tabular-nums">{i + 1}</TableCell>
                    <TableCell className="font-mono text-xs">{u.id}</TableCell>
                    <TableCell className="tabular-nums text-xs">{u.date}</TableCell>
                    <TableCell className="font-medium">{u.flight}</TableCell>
                    <TableCell className="text-xs">{u.sector}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{u.cabinClass}-Class</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{u.itemName}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{u.itemId}</div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-semibold">
                      {u.qty.toLocaleString()} {u.uom}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      ৳ {Math.round(value).toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

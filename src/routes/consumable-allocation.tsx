import { createFileRoute } from "@tanstack/react-router";
import { Fragment } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plane, Layers, Coins } from "lucide-react";
import { consumableUsage, consumableItems } from "@/lib/sample-data";

export const Route = createFileRoute("/consumable-allocation")({
  head: () => ({ meta: [{ title: "Flight Allocation" }] }),
  component: FlightAllocationPage,
});

function FlightAllocationPage() {
  // Group usage by flight
  const byFlight = new Map<string, typeof consumableUsage>();
  for (const u of consumableUsage) {
    if (!byFlight.has(u.flight)) byFlight.set(u.flight, []);
    byFlight.get(u.flight)!.push(u);
  }
  const entries = Array.from(byFlight.entries());

  const flights = entries.length;
  const totalLines = consumableUsage.length;
  const totalValue = consumableUsage.reduce((s, u) => {
    const item = consumableItems.find((i) => i.id === u.itemId);
    return s + u.qty * (item?.unitCost ?? 0);
  }, 0);

  return (
    <>
      <PageHeader
        title="Flight Allocation"
        subtitle="Consumables grouped by flight — what was loaded on each leg, with cabin-class split and total value"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard label="Flights" value={flights} icon={Plane} tone="navy" />
        <KpiCard label="Item Lines" value={totalLines} icon={Layers} tone="warning" />
        <KpiCard
          label="Total Value"
          value={`৳ ${Math.round(totalValue).toLocaleString()}`}
          icon={Coins}
          tone="success"
        />
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No flight allocations recorded yet.
          </CardContent>
        </Card>
      ) : (
        <div className="border border-border rounded-md overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-xs uppercase tracking-wider">Flight / Item</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Sector</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Class</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-right">Qty</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-right">Unit Cost</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map(([flight, rows]) => {
                const sector = rows[0]?.sector ?? "—";
                const flightValue = rows.reduce((s, r) => {
                  const item = consumableItems.find((i) => i.id === r.itemId);
                  return s + r.qty * (item?.unitCost ?? 0);
                }, 0);
                return (
                  <Fragment key={flight}>
                    <TableRow className="bg-primary/5 hover:bg-primary/10 border-t-2 border-t-primary/40">
                      <TableCell colSpan={5} className="py-2">
                        <span className="font-mono text-sm font-semibold text-primary">{flight}</span>
                        <span className="ml-2 text-[11px] text-muted-foreground">{sector}</span>
                        <span className="ml-3 text-[11px] text-muted-foreground tabular-nums">
                          {rows.length} item{rows.length === 1 ? "" : "s"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-semibold text-primary">
                        ৳ {Math.round(flightValue).toLocaleString()}
                      </TableCell>
                    </TableRow>
                    {rows.map((r) => {
                      const item = consumableItems.find((i) => i.id === r.itemId);
                      const unitCost = item?.unitCost ?? 0;
                      return (
                        <TableRow key={r.id} className="hover:bg-muted/30">
                          <TableCell className="pl-8">
                            <div className="font-medium text-sm">{r.itemName}</div>
                            <div className="font-mono text-[10px] text-muted-foreground">{r.itemId}</div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{r.sector}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">{r.cabinClass}</Badge>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{r.qty.toLocaleString()} {r.uom}</TableCell>
                          <TableCell className="text-right tabular-nums text-muted-foreground">৳ {unitCost.toFixed(2)}</TableCell>
                          <TableCell className="text-right tabular-nums font-medium">
                            ৳ {Math.round(r.qty * unitCost).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}

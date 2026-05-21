import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Boxes, AlertTriangle, Coffee } from "lucide-react";
import {
  consumableItems, items as MASTER_ITEMS,
  type ConsumableCategory, type ConsumableItem,
} from "@/lib/sample-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/airline-consumables")({
  head: () => ({ meta: [{ title: "Consumables Inventory" }] }),
  component: ConsumableInventoryPage,
});

const CATEGORIES: ConsumableCategory[] = [
  "Napkin", "Cup", "Cutlery", "Tissue", "Amenity Kit", "Plastic Tray", "Packaging",
];

function ConsumableInventoryPage() {
  const [items] = useState<ConsumableItem[]>(consumableItems);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ConsumableCategory | "All">("All");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      if (category !== "All" && it.category !== category) return false;
      if (q && !it.name.toLowerCase().includes(q) && !it.id.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, search, category]);

  const totalItems = items.length;
  const lowStock = items.filter((i) => i.status === "Low").length;
  const critical = items.filter((i) => i.status === "Critical").length;
  const totalValue = items.reduce((s, i) => s + i.stock * i.unitCost, 0);

  return (
    <>
      <PageHeader
        title="Consumables Inventory"
        subtitle="Disposable airline service items — napkins, cups, cutlery, tissues, amenity kits, trays and packaging"
        actions={
          <Button onClick={() => alert("Stock-receipt flow lives in Receive Items.")}>
            <Plus className="h-4 w-4 mr-1" /> New Receipt
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Items" value={totalItems} icon={Boxes} tone="navy" />
        <KpiCard label="Low Stock" value={lowStock} icon={AlertTriangle} tone="warning" />
        <KpiCard label="Critical" value={critical} icon={AlertTriangle} tone="red" />
        <KpiCard
          label="Stock Value"
          value={`৳ ${Math.round(totalValue).toLocaleString()}`}
          icon={Coffee}
          tone="success"
        />
      </div>

      <Card className="mb-4">
        <CardContent className="pt-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[220px]">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search consumables…"
                className="h-9"
              />
            </div>
            <div className="flex items-center gap-1 rounded-md border border-input bg-background p-0.5 shadow-sm flex-wrap">
              {(["All", ...CATEGORIES] as const).map((c) => {
                const active = category === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c as typeof category)}
                    className={cn(
                      "px-2.5 py-1 text-[11px] font-medium rounded-sm transition-colors",
                      active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="border border-border rounded-md overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-14 text-xs uppercase tracking-wider">SL</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Code</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Item</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Category</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">UoM</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-right">Stock</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-right">Reorder</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-right">Unit Cost</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-right">Value</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Bin</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-sm text-muted-foreground py-8">
                  No items match the selected filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((it, i) => {
                const masterBin = MASTER_ITEMS.find(
                  (m) => m.name.toLowerCase() === it.name.toLowerCase(),
                )?.binLocation;
                const bin = masterBin ?? it.binLocation ?? "—";
                return (
                  <TableRow key={it.id} className="hover:bg-muted/30">
                    <TableCell className="text-xs text-muted-foreground tabular-nums">{i + 1}</TableCell>
                    <TableCell className="font-mono text-xs">{it.id}</TableCell>
                    <TableCell className="font-medium">{it.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{it.category}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">{it.uom}</TableCell>
                    <TableCell className="text-right tabular-nums font-semibold">
                      <span className={it.status === "Critical" ? "text-destructive" : it.status === "Low" ? "text-warning" : ""}>
                        {it.stock.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{it.reorder.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">৳ {it.unitCost.toFixed(2)}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      ৳ {Math.round(it.stock * it.unitCost).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        {bin}
                        {masterBin && (
                          <Badge variant="outline" className="text-[9px] py-0 px-1 border-primary/30 bg-primary/5 text-primary">
                            profile
                          </Badge>
                        )}
                      </span>
                    </TableCell>
                    <TableCell><StatusBadge status={it.status} /></TableCell>
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

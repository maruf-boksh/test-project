import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { RowActions } from "@/components/common/RowActions";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Croissant, Plus, CheckCircle2, AlertCircle } from "lucide-react";
import { bakeryOrders } from "@/lib/sample-data";
import { KpiCard } from "@/components/common/KpiCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

type B = (typeof bakeryOrders)[number];

// Calculated bakery items from the 9600 meal order (Snacks + Heavy Snacks)
// System segregates bakery items from Snacks and Heavy Snacks meal configuration
const MEAL_ORDER_TOTAL = 9600;
const MEAL_ORDER_DATE = "09 Nov 2025";

const calculatedBakeryItems = [
  { name: "Butter Croissant", required: 1440, inStock: 480, unit: "Pcs" },
  { name: "Dinner Roll / Soft Roll", required: 960, inStock: 1200, unit: "Pcs" },
  { name: "Sandwich Bread", required: 768, inStock: 500, unit: "Pcs" },
  { name: "Chocolate Muffin", required: 576, inStock: 320, unit: "Pcs" },
  { name: "Vanilla Cake Slice", required: 480, inStock: 180, unit: "Pcs" },
  { name: "Cheese Pastry", required: 624, inStock: 260, unit: "Pcs" },
];

export default function Bakery() {
  const [detailOpen, setDetailOpen] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [productionStarted, setProductionStarted] = useState(false);

  const allInStock = calculatedBakeryItems.every((item) => item.inStock >= item.required);

  const cols: Column<B>[] = [
    { key: "id", header: "Order #" },
    { key: "item", header: "Item" },
    { key: "qty", header: "Qty" },
    { key: "oven", header: "Oven" },
    { key: "batch", header: "Batch" },
    { key: "yield", header: "Yield" },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <>
      <PageHeader
        title="Bakery Production"
        subtitle="Bread, pastry, muffin, cake & dessert production"
        actions={<Button><Plus className="h-4 w-4 mr-1" /> New Bake Order</Button>}
      />

      {/* Meal Order Generated Card */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 mb-6 flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">From Meal Planning — {MEAL_ORDER_DATE}</div>
          <div className="text-lg font-bold text-slate-800">{MEAL_ORDER_TOTAL.toLocaleString()} Meal Order Generated</div>
          <div className="text-sm text-slate-600 mt-0.5">
            Bakery items required from Snacks &amp; Heavy Snacks — <span className="font-semibold">{calculatedBakeryItems.length} item types</span>
          </div>
        </div>
        <Button
          className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
          onClick={() => { setDetailOpen(true); setShowInventory(false); }}
        >
          View Details
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Ovens Active" value="4 / 5" icon={Croissant} tone="navy" />
        <KpiCard label="Items Baked Today" value="1,240" icon={Croissant} tone="success" />
        <KpiCard label="Avg Yield" value="97.2%" icon={Croissant} tone="warning" />
        <KpiCard label="Pending Batches" value={3} icon={Croissant} tone="red" />
      </div>

      <DataTable
        title="bakery"
        data={bakeryOrders}
        columns={cols}
        searchKeys={["id", "item", "oven", "status"]}
        actions={(r) => <RowActions row={r} actions={["view", "edit", "delete"]} />}
      />

      {/* Bakery Items Detail / Inventory Modal */}
      <Dialog open={detailOpen} onOpenChange={(open) => { setDetailOpen(open); if (!open) setShowInventory(false); }}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-base font-semibold">
              {showInventory ? "Inventory Check — Bakery Items" : `Bakery Items Required — ${MEAL_ORDER_DATE}`}
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {showInventory
                ? "Comparing required quantities against current stock."
                : `Calculated from ${MEAL_ORDER_TOTAL.toLocaleString()} meal order (Snacks & Heavy Snacks).`}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
            {/* Column headers */}
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground border-b pb-2 mb-3">
              <div className="flex-1">Item</div>
              <div className="w-20 text-right">Required</div>
              {showInventory && <div className="w-20 text-right">In Stock</div>}
              {showInventory && <div className="w-16 text-center">Status</div>}
            </div>

            {calculatedBakeryItems.map((item) => {
              const ok = item.inStock >= item.required;
              return (
                <div key={item.name} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg ${showInventory ? (ok ? "bg-emerald-50 border border-emerald-100" : "bg-red-50 border border-red-100") : "bg-muted/40"}`}>
                  <div className="flex-1 text-sm font-medium text-slate-700">{item.name}</div>
                  <div className="w-20 text-right text-sm font-semibold">{item.required.toLocaleString()} {item.unit}</div>
                  {showInventory && (
                    <div className={`w-20 text-right text-sm font-semibold ${ok ? "text-emerald-700" : "text-red-600"}`}>
                      {item.inStock.toLocaleString()}
                    </div>
                  )}
                  {showInventory && (
                    <div className="w-16 flex justify-center">
                      {ok
                        ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        : <AlertCircle className="h-4 w-4 text-red-500" />}
                    </div>
                  )}
                </div>
              );
            })}

            {showInventory && !allInStock && (
              <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                Some items are below required stock. Raise a demand before starting production.
              </div>
            )}
            {showInventory && allInStock && (
              <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
                All items are sufficiently stocked. Ready to start production.
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDetailOpen(false)}>Close</Button>
            {!showInventory && (
              <Button onClick={() => setShowInventory(true)}>Check Inventory</Button>
            )}
            {showInventory && !allInStock && (
              <Button variant="outline" className="text-red-600 border-red-200" onClick={() => { setDetailOpen(false); toast.info("Navigate to Kitchen Stock to raise demand."); }}>
                Raise Demand
              </Button>
            )}
            {showInventory && allInStock && (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => {
                  setProductionStarted(true);
                  setDetailOpen(false);
                  toast.success("Bakery production started for meal order.");
                }}
              >
                Start Production
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

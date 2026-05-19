import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Plus, ChefHat, Flame, Users, Clock, Search, Bell, ArrowRight } from "lucide-react";
import { productionOrders, inventory } from "@/lib/sample-data";
import { KpiCard } from "@/components/common/KpiCard";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useWorkflow, type WfDemandRequest } from "@/lib/workflow-store";
import { useRole } from "@/lib/roles";

export const Route = createFileRoute("/kitchen")({
  head: () => ({ meta: [{ title: "Kitchen Production" }] }),
  component: Kitchen,
});

type P = (typeof productionOrders)[number];

type DemandLine = {
  id: string;
  item: string;
  qty: number;
  uom: string;
  status: string;
  createdAt: string;
};

const forwardedOrder = {
  date: "09 Nov 2025",
  totalMeals: 9600,
  breakdown: {
    Breakfast: 2400,
    Lunch: 2880,
    Snacks: 1440,
    "Heavy Snacks": 1680,
    Dinner: 1200,
  },
};

// Production order status chain and progress mapping
const STATUS_CHAIN = ["Pending", "In Preparation", "Cooking", "Ready for QC", "Approved", "Sent to Packaging"];
const STATUS_PROGRESS: Record<string, number> = {
  "Pending": 0,
  "In Preparation": 20,
  "Cooking": 55,
  "Ready for QC": 80,
  "Approved": 95,
  "Sent to Packaging": 100,
};

function Kitchen() {
  const { role } = useRole();
  const wf = useWorkflow();
  const {
    demands, addDemands, transferNotes, acknowledgeTransfer,
    applyStockDeltas, stockDeltas, prdStatuses, prdProgress, setPRDStatus,
  } = wf;

  const [orders, setOrders] = useState<P[]>(productionOrders);
  const [localDemands, setLocalDemands] = useState<DemandLine[]>([]);
  const [activeKitchenTab, setActiveKitchenTab] = useState("production");
  const [mealOrderDetailOpen, setMealOrderDetailOpen] = useState(false);

  // Kitchen Stock selection state
  const [selectedStock, setSelectedStock] = useState<Set<string>>(new Set());
  const [stockNeeds, setStockNeeds] = useState<Record<string, number>>({});
  const [stockOrderFilter, setStockOrderFilter] = useState(false);
  const [stockSearch, setStockSearch] = useState("");

  // Effective stock = seed stock + all GRN/transfer deltas applied
  const effectiveInventory = useMemo(() => {
    const totals: Record<string, number> = {};
    stockDeltas.forEach(d => { totals[d.itemId] = (totals[d.itemId] ?? 0) + d.delta; });
    return inventory.map(item => ({
      ...item,
      stock: item.stock + (totals[item.id] ?? 0),
    }));
  }, [stockDeltas]);

  // Effective production orders — status/progress overridden from workflow context
  const effectiveOrders = useMemo(() =>
    orders.map(o => ({
      ...o,
      status: prdStatuses[o.id] ?? o.status,
      progress: prdProgress[o.id] ?? o.progress,
    })),
    [orders, prdStatuses, prdProgress]
  );

  const displayInventory = useMemo(() => {
    let items = stockOrderFilter
      ? effectiveInventory.filter(i => i.stock < i.reorder)   // Critical only
      : effectiveInventory;
    if (stockSearch) {
      const q = stockSearch.toLowerCase();
      items = items.filter(i =>
        i.id.toLowerCase().includes(q) ||
        i.name.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.storage.toLowerCase().includes(q),
      );
    }
    return items;
  }, [stockOrderFilter, stockSearch, effectiveInventory]);

  const pendingTransfers = useMemo(
    () => transferNotes.filter(t => t.status === "Pending Acknowledgment"),
    [transferNotes]
  );

  // ── Step 1: Check Stock Against This Order ──────────────────────────────────
  const handleCheckStock = () => {
    const critical = effectiveInventory.filter(i => i.stock < i.reorder);
    setStockOrderFilter(true);
    setActiveKitchenTab("stock");
    setSelectedStock(new Set(critical.map(i => i.id)));
    const needs: Record<string, number> = {};
    critical.forEach(item => { needs[item.id] = item.reorder - item.stock; });
    setStockNeeds(needs);
    if (critical.length > 0) {
      toast.warning(`${critical.length} critical item(s) flagged. Quantities pre-filled — review and create demand.`);
    } else {
      toast.success("All items are at or above reorder level. No demand needed.");
    }
  };

  const createProductionOrder = () => {
    setOrders(prev => [
      { id: `PRD-${Date.now()}`, flight: "TBD", meal: "New Production Batch", qty: 0, section: "Hot Kitchen", status: "Pending", progress: 0 },
      ...prev,
    ]);
    toast.success("New production order created.");
  };

  const toggleStockItem = (id: string) => {
    setSelectedStock(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAllStock = (checked: boolean) => {
    if (checked) setSelectedStock(new Set(displayInventory.map(i => i.id)));
    else setSelectedStock(new Set());
  };

  // ── Step 1: Create Demand → sends to Store (workflow context) ───────────────
  const submitBulkDemand = () => {
    const items = effectiveInventory.filter(
      item => selectedStock.has(item.id) && (stockNeeds[item.id] || 0) > 0
    );
    if (items.length === 0) {
      toast.error("Enter a required quantity for at least one selected item.");
      return;
    }
    // Find the first non-packaged PRD as the reference order
    const prdRef = effectiveOrders.find(o => o.status !== "Sent to Packaging")?.id ?? "PRD-0000";

    // Create WfDemandRequests for the workflow (cross-route state)
    const wfDemands: WfDemandRequest[] = items.map(item => ({
      id: `DR-${Date.now()}-${item.id}`,
      reference: prdRef,
      requestedBy: role,
      role: "Flight Kitchen Executive",
      date: new Date().toLocaleString(),
      status: "Pending Store Review",
      items: [{ id: item.id, name: item.name, qty: stockNeeds[item.id], uom: item.uom, type: item.category }],
      note: `Kitchen demand for production order ${prdRef}. Required: ${stockNeeds[item.id]} ${item.uom}.`,
      source: "Kitchen",
    }));
    addDemands(wfDemands);

    // Also keep local history
    setLocalDemands(prev => [
      ...items.map(item => ({
        id: `DM-${Date.now()}-${item.id}`,
        item: item.name,
        qty: stockNeeds[item.id],
        uom: item.uom,
        status: "Raised",
        createdAt: new Date().toLocaleString(),
      })),
      ...prev,
    ]);
    setSelectedStock(new Set());
    setStockNeeds({});
    toast.success(`Demand raised for ${items.length} item(s) — sent to Store & Inventory.`);
  };

  // ── Step 8: Acknowledge Transfer Note ───────────────────────────────────────
  const handleAcknowledgeTransfer = (tn: typeof transferNotes[number]) => {
    acknowledgeTransfer(tn.id);
    // Add items to kitchen stock via delta
    applyStockDeltas(tn.items.map(i => ({ itemId: i.id, delta: i.qty })));
    // Find linked demand → get its reference (PRD-XXXX) → advance PRD status
    const linkedDemand = demands.find(d => d.id === tn.demandRef);
    if (linkedDemand) {
      const prdId = linkedDemand.reference;
      const currentStatus = prdStatuses[prdId] ?? orders.find(o => o.id === prdId)?.status ?? "";
      if (currentStatus === "Pending") {
        setPRDStatus(prdId, "In Preparation", STATUS_PROGRESS["In Preparation"]);
        toast.success(`Transfer acknowledged — stock updated. ${prdId} advanced to In Preparation.`);
      } else {
        toast.success(`Transfer acknowledged — stock updated for ${tn.items.map(i => i.name).join(", ")}.`);
      }
    } else {
      toast.success("Transfer acknowledged — stock items added to Kitchen.");
    }
  };

  // ── Step 9: Advance production order status ──────────────────────────────────
  const advancePRDStatus = (orderId: string, currentStatus: string) => {
    const idx = STATUS_CHAIN.indexOf(currentStatus);
    if (idx < 0 || idx >= STATUS_CHAIN.length - 1) return;
    const nextStatus = STATUS_CHAIN[idx + 1];
    setPRDStatus(orderId, nextStatus, STATUS_PROGRESS[nextStatus]);
    toast.success(`${orderId} → ${nextStatus}`);
  };

  function stockStatusBadge(stock: number, reorder: number) {
    if (stock < reorder)
      return <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">Critical</span>;
    if (stock < reorder * 1.2)
      return <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">Low</span>;
    return <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">OK</span>;
  }

  const productionCols: Column<typeof effectiveOrders[number]>[] = [
    { key: "id", header: "Order #" },
    { key: "flight", header: "Flight" },
    { key: "meal", header: "Meal" },
    { key: "qty", header: "Qty" },
    { key: "section", header: "Section" },
    {
      key: "progress", header: "Progress",
      render: (r) => (
        <div className="flex items-center gap-2 min-w-[140px]">
          <Progress value={r.progress} className="h-2 flex-1" />
          <span className="text-xs">{r.progress}%</span>
        </div>
      ),
    },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <>
      <PageHeader
        title="Flight Kitchen Production"
        subtitle="Hot kitchen, cold kitchen, special meals & beverage operations"
        actions={<Button onClick={createProductionOrder}><Plus className="h-4 w-4 mr-1" /> Production Order</Button>}
      />

      {/* Forwarded Meal Order Card */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 mb-6 flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">Forwarded from Meal Planning</div>
          <div className="text-lg font-bold text-slate-800">New Meal Order for {forwardedOrder.date}</div>
          <div className="text-sm text-slate-600 mt-0.5">
            Total Meals: <span className="font-bold text-emerald-700">{forwardedOrder.totalMeals.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            className="border-emerald-400 text-emerald-700 hover:bg-emerald-100"
            onClick={handleCheckStock}
          >
            Check Stock Against This Order
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setMealOrderDetailOpen(true)}>
            View Details
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Active Flights" value={12} icon={Flame} tone="navy" />
        <KpiCard label="Meals in Progress" value="2,140" icon={ChefHat} tone="warning" />
        <KpiCard label="Staff On Shift" value={48} icon={Users} tone="success" />
        <KpiCard label="Avg Cycle Time" value="42m" icon={Clock} tone="red" />
      </div>

      <Tabs value={activeKitchenTab} onValueChange={setActiveKitchenTab}>
        <TabsList>
          <TabsTrigger value="production">Production Orders</TabsTrigger>
          <TabsTrigger value="stock">
            Kitchen Stock
            {pendingTransfers.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {pendingTransfers.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Production Orders tab ── */}
        <TabsContent value="production" className="mt-6">
          <DataTable
            title="production"
            data={effectiveOrders}
            columns={productionCols}
            searchKeys={["id", "flight", "meal", "section", "status"]}
            actions={(r) => {
              const idx = STATUS_CHAIN.indexOf(r.status);
              const canAdvance = idx >= 0 && idx < STATUS_CHAIN.length - 1;
              const isQC = r.status === "Ready for QC";
              return (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Button size="sm" variant="ghost" onClick={() => toast.info(`Viewing ${r.id}`)}>View</Button>
                  {canAdvance && !isQC && (
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white h-7 px-2.5 text-xs"
                      onClick={() => advancePRDStatus(r.id, r.status)}
                    >
                      <ArrowRight className="h-3 w-3 mr-1" />
                      {STATUS_CHAIN[idx + 1]}
                    </Button>
                  )}
                  {isQC && (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white h-7 px-2.5 text-xs"
                      onClick={() => {
                        setPRDStatus(r.id, "Approved", STATUS_PROGRESS["Approved"]);
                        // Auto-advance to Sent to Packaging after QC approval
                        setTimeout(() => setPRDStatus(r.id, "Sent to Packaging", 100), 800);
                        toast.success(`${r.id} QC approved — advancing to Sent to Packaging.`);
                      }}
                    >
                      Approve QC
                    </Button>
                  )}
                </div>
              );
            }}
          />
        </TabsContent>

        {/* ── Kitchen Stock tab ── */}
        <TabsContent value="stock" className="mt-6">

          {/* Step 8: Pending Inbound Transfers banner */}
          {pendingTransfers.length > 0 && (
            <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">
                  {pendingTransfers.length} Inbound Transfer{pendingTransfers.length !== 1 ? "s" : ""} Awaiting Acknowledgment
                </span>
              </div>
              <div className="space-y-2">
                {pendingTransfers.map(tn => (
                  <div key={tn.id} className="flex items-center justify-between rounded-lg bg-white border border-blue-200 px-3 py-2.5 gap-3">
                    <div>
                      <span className="font-medium text-sm text-slate-800">{tn.id}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        Demand Ref: {tn.demandRef} · GRN: {tn.grnRef} · From: {tn.from} → {tn.to}
                      </span>
                      <div className="text-xs text-slate-600 mt-0.5">
                        Items: {tn.items.map(i => `${i.name} (${i.qty} ${i.uom})`).join(", ")}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
                      onClick={() => handleAcknowledgeTransfer(tn)}
                    >
                      Acknowledge Receipt
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top action bar */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <Button disabled={selectedStock.size === 0} onClick={submitBulkDemand}>
              <Plus className="h-4 w-4 mr-1" />
              {selectedStock.size > 0 ? `Create Demand (${selectedStock.size} items)` : "Create Demand"}
            </Button>
            <span className="text-sm text-muted-foreground">
              {selectedStock.size === 0
                ? "Select items below to raise a demand to Store."
                : `${selectedStock.size} item${selectedStock.size !== 1 ? "s" : ""} selected — enter quantities and submit.`}
            </span>
            {stockOrderFilter && (
              <span className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                Showing: Meal Order Relevant Items
                <button
                  type="button"
                  className="hover:text-amber-900 font-bold leading-none"
                  onClick={() => { setStockOrderFilter(false); setSelectedStock(new Set()); setStockNeeds({}); }}
                >
                  ×
                </button>
              </span>
            )}
          </div>

          {selectedStock.size > 0 && (
            <div className="mb-3 flex items-center gap-3 px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/20">
              <span className="text-sm font-medium text-primary">
                {selectedStock.size} item{selectedStock.size !== 1 ? "s" : ""} selected
              </span>
              <span className="text-muted-foreground">→</span>
              <Button size="sm" onClick={submitBulkDemand}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Create Demand
              </Button>
              <button
                type="button"
                className="ml-auto text-sm text-muted-foreground hover:text-foreground"
                onClick={() => { setSelectedStock(new Set()); setStockNeeds({}); }}
              >
                Clear selection
              </button>
            </div>
          )}

          {/* Custom stock table */}
          <div className="bg-card rounded-lg border border-border shadow-sm">
            <div className="p-3 flex items-center gap-2 border-b border-border">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={stockSearch}
                  onChange={(e) => setStockSearch(e.target.value)}
                  placeholder="Search..."
                  className="pl-9 h-9"
                />
              </div>
            </div>

            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="w-10 p-3">
                      <Checkbox
                        checked={displayInventory.length > 0 && displayInventory.every(i => selectedStock.has(i.id))}
                        onCheckedChange={(v) => toggleAllStock(!!v)}
                      />
                    </th>
                    {["Code", "Item", "Category", "UOM", "Current Stock", "Reorder Level", "Storage", "Status", "Actions"].map(h => (
                      <th key={h} className="p-3 text-left font-semibold text-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayInventory.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center text-muted-foreground py-10">No records found</td>
                    </tr>
                  ) : displayInventory.map(item => {
                    const isSelected = selectedStock.has(item.id);
                    return (
                      <tr key={item.id} className={`border-b transition-colors hover:bg-muted/40 ${isSelected ? "bg-primary/5" : ""}`}>
                        <td className="p-3">
                          <Checkbox checked={isSelected} onCheckedChange={() => toggleStockItem(item.id)} />
                        </td>
                        <td className="p-3 text-muted-foreground">{item.id}</td>
                        <td className="p-3 font-medium">{item.name}</td>
                        <td className="p-3">{item.category}</td>
                        <td className="p-3">{item.uom}</td>
                        <td className="p-3">
                          <span className={item.stock < item.reorder ? "text-destructive font-semibold" : ""}>{item.stock}</span>
                        </td>
                        <td className="p-3">{item.reorder}</td>
                        <td className="p-3">{item.storage}</td>
                        <td className="p-3">{stockStatusBadge(item.stock, item.reorder)}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1 flex-wrap justify-end">
                            {isSelected && (
                              <div className="inline-flex items-center gap-1.5 mr-2">
                                <span className="text-xs text-muted-foreground">Need:</span>
                                <Input
                                  type="number"
                                  min={0}
                                  placeholder="Qty"
                                  value={stockNeeds[item.id] || ""}
                                  onChange={(e) => setStockNeeds(prev => ({ ...prev, [item.id]: Number(e.target.value) }))}
                                  className="w-20 h-7 text-xs"
                                />
                                <span className="text-xs text-muted-foreground">{item.uom}</span>
                              </div>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => toast.info(`Viewing ${item.name}`)}>View</Button>
                            <Button size="sm" variant="ghost" onClick={() => toast.info(`Editing ${item.name}`)}>Edit</Button>
                            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => toast.success(`${item.name} removed`)}>Delete</Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {localDemands.length > 0 && (
            <div className="mt-6">
              <Card>
                <CardHeader><CardTitle>Kitchen Demand History</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {localDemands.map(d => (
                      <div key={d.id} className="rounded-xl border border-border p-4 bg-muted/80 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{d.id}</span>
                          <span>{d.createdAt}</span>
                        </div>
                        <div className="font-semibold">{d.item}</div>
                        <div className="text-sm">{d.qty} {d.uom} — <StatusBadge status={d.status} /></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Meal Order Detail Modal */}
      <Dialog open={mealOrderDetailOpen} onOpenChange={setMealOrderDetailOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Meal Order — {forwardedOrder.date}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground mb-3">
              Total Meals: <span className="font-bold text-foreground">{forwardedOrder.totalMeals.toLocaleString()}</span>
            </div>
            {Object.entries(forwardedOrder.breakdown).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center px-3 py-2 rounded-lg bg-muted/50">
                <span className="text-sm font-medium">{type}</span>
                <span className="text-sm font-bold">{count.toLocaleString()} meals</span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMealOrderDetailOpen(false)}>Close</Button>
            <Button onClick={() => { setMealOrderDetailOpen(false); handleCheckStock(); }}>
              Check Inventory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

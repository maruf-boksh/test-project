import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Plus, ArrowLeft, Save, ClipboardCheck, CheckCircle2, AlertCircle, Factory, Users,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useWorkflow, type WfProductionEntryRecord } from "@/lib/workflow-store";
import { LocationPicker, LocationFilter, LocationCell } from "@/components/common/LocationPicker";

const SHIFTS = ["Morning", "Evening", "Night"] as const;
const PRODUCERS = ["F. Begum", "T. Islam", "M. Karim", "N. Hossen", "S. Ahmed", "R. Karim"];

const selectCls =
  "w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export default function ProductionEntryPage() {
  const { productionEntries, productionEntryRecords, addProductionEntryRecord } = useWorkflow();
  const [view, setView] = useState<"list" | "create">("list");
  const [filterOffice, setFilterOffice] = useState("");
  const [filterWarehouse, setFilterWarehouse] = useState("");

  // Orders that can accept new entries: anything Approved or In Preparation
  // (Pending = not approved yet, Ready for QC / Completed = order target met).
  const fulfillableOrders = useMemo(
    () =>
      productionEntries.filter(
        (o) =>
          o.status === "Approved" ||
          o.status === "In Preparation",
      ),
    [productionEntries],
  );

  const filteredRecords = productionEntryRecords.filter((r) => {
    if (filterOffice && r.officeId !== filterOffice) return false;
    if (filterWarehouse && r.warehouseId !== filterWarehouse) return false;
    return true;
  });

  const totalProduced = filteredRecords.reduce((s, r) => s + r.producedQty, 0);

  const cols: Column<WfProductionEntryRecord>[] = [
    { key: "id", header: "Entry No", render: (r) => <span className="font-mono text-xs">{r.id}</span> },
    { key: "date", header: "Date", render: (r) => <span className="tabular-nums text-xs">{r.date}</span> },
    {
      key: "productionOrderId", header: "Production Order",
      render: (r) => (
        <div className="text-xs">
          <div className="font-mono text-primary">{r.productionOrderId}</div>
          <div className="text-muted-foreground">{r.outputItemName ?? r.bom}</div>
        </div>
      ),
    },
    {
      key: "officeId", header: "Office / Warehouse",
      render: (r) => <LocationCell officeId={r.officeId} warehouseId={r.warehouseId} />,
    },
    {
      key: "producedQty", header: "Produced Qty", className: "text-right",
      render: (r) => <span className="tabular-nums font-semibold">{r.producedQty.toLocaleString()}</span>,
    },
    {
      key: "batchNo", header: "Batch",
      render: (r) => r.batchNo ? <span className="font-mono text-xs">{r.batchNo}</span> : <span className="text-muted-foreground">—</span>,
    },
    {
      key: "shift", header: "Shift",
      render: (r) => r.shift ? <Badge variant="outline" className="text-[10px]">{r.shift}</Badge> : <span className="text-muted-foreground">—</span>,
    },
    { key: "producedBy", header: "Produced By" },
  ];

  return (
    <>
      <PageHeader
        title="Production Entry"
        subtitle="Log actual production runs against an approved Production Order — quantity rolls up to the order's Produced Qty"
        actions={
          <Button
            variant={view === "create" ? "outline" : "default"}
            onClick={() => setView(view === "create" ? "list" : "create")}
          >
            {view === "create" ? (
              <><ArrowLeft className="h-4 w-4 mr-1" /> Back</>
            ) : (
              <><Plus className="h-4 w-4 mr-1" /> Create Entry</>
            )}
          </Button>
        }
      />

      {view === "list" ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <KpiCard label="Total Entries" value={filteredRecords.length} icon={ClipboardCheck} tone="navy" />
            <KpiCard label="Total Produced" value={totalProduced.toLocaleString()} icon={Factory} tone="success" />
            <KpiCard label="Fulfillable Orders" value={fulfillableOrders.length} icon={CheckCircle2} tone="warning" />
          </div>

          <div className="mb-4">
            <LocationFilter
              officeId={filterOffice}
              warehouseId={filterWarehouse}
              onChange={(n) => { setFilterOffice(n.officeId); setFilterWarehouse(n.warehouseId); }}
            />
          </div>

          {filteredRecords.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Factory className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <div className="text-sm font-medium text-foreground">No production entries yet</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Click <strong className="text-foreground">+ Create Entry</strong> to log a production run against an approved order.
                </div>
              </CardContent>
            </Card>
          ) : (
            <DataTable
              title="production-entries"
              data={filteredRecords}
              columns={cols}
              searchKeys={["id", "productionOrderId", "outputItemName", "batchNo", "producedBy"]}
              selectable={false}
            />
          )}
        </>
      ) : (
        <CreateEntry
          orders={fulfillableOrders}
          onSave={(record) => {
            addProductionEntryRecord(record);
            setView("list");
            toast.success(`${record.id} logged — ${record.producedQty} units credited to ${record.productionOrderId}.`);
          }}
          nextSeq={productionEntryRecords.length + 47}
        />
      )}
    </>
  );
}

function CreateEntry({
  orders, nextSeq, onSave,
}: {
  orders: ReturnType<typeof useWorkflow>["productionEntries"];
  nextSeq: number;
  onSave: (record: WfProductionEntryRecord) => void;
}) {
  const [orderId, setOrderId] = useState("");
  const [qty, setQty] = useState("");
  const [batch, setBatch] = useState("");
  const [shift, setShift] = useState<typeof SHIFTS[number]>("Morning");
  const [producer, setProducer] = useState(PRODUCERS[0]);
  const [officeId, setOfficeId] = useState("OFF-001");
  const [warehouseId, setWarehouseId] = useState("WH-003");
  const [remarks, setRemarks] = useState("");

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === orderId) ?? null,
    [orders, orderId],
  );
  const remaining = selectedOrder
    ? Math.max(0, (selectedOrder.orderQty ?? selectedOrder.producedQty) - selectedOrder.producedQty)
    : 0;

  const handleSelectOrder = (id: string) => {
    setOrderId(id);
    const o = orders.find((x) => x.id === id);
    if (o) {
      // Pre-fill warehouse from the order
      if (o.officeId) setOfficeId(o.officeId);
      if (o.warehouseId) setWarehouseId(o.warehouseId);
      // Default qty to the remaining amount so the user can produce in full
      const rem = Math.max(0, (o.orderQty ?? o.producedQty) - o.producedQty);
      setQty(rem > 0 ? String(rem) : "");
    }
  };

  const handleSave = () => {
    if (!orderId) { toast.error("Select a Production Order."); return; }
    if (!selectedOrder) return;
    const q = Number(qty);
    if (!q || q <= 0) { toast.error("Produced quantity must be greater than zero."); return; }
    if (q > remaining) {
      toast.error(`Cannot exceed remaining qty (${remaining}).`);
      return;
    }
    if (!producer.trim()) { toast.error("Produced By is required."); return; }
    if (!officeId) { toast.error("Office is required."); return; }
    if (!warehouseId) { toast.error("Warehouse is required."); return; }

    const id = `PE-2026-${String(nextSeq).padStart(6, "0")}`;
    const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
    onSave({
      id,
      date: stamp,
      productionOrderId: orderId,
      bom: selectedOrder.bom,
      outputItemName: selectedOrder.outputItemName,
      outputItemCode: selectedOrder.outputItemCode,
      producedQty: q,
      batchNo: batch.trim() || undefined,
      shift,
      producedBy: producer.trim(),
      officeId,
      warehouseId,
      remarks: remarks.trim() || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
            <div>
              <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground">
                Log Production Entry
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pick an approved Production Order, then record the actual quantity produced.
              </p>
            </div>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-1.5" /> Save Entry
            </Button>
          </div>

          {/* PO picker */}
          <div className="mb-5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Production Order <span className="text-destructive">*</span>
            </Label>
            <select
              value={orderId}
              onChange={(e) => handleSelectOrder(e.target.value)}
              className={selectCls}
            >
              <option value="">Select a fulfillable order…</option>
              {orders.length === 0 ? (
                <option disabled>No approved orders available</option>
              ) : (
                orders.map((o) => {
                  const target = o.orderQty ?? o.producedQty;
                  const rem = Math.max(0, target - o.producedQty);
                  return (
                    <option key={o.id} value={o.id}>
                      {o.id} — {o.outputItemName ?? o.bom} · {o.producedQty}/{target} produced · {rem} remaining · {o.status}
                    </option>
                  );
                })
              )}
            </select>
          </div>

          {/* Order context summary */}
          {selectedOrder && (
            <div className="mb-5 rounded-md border border-primary/30 bg-primary/5 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Order Context
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-foreground">
                    {selectedOrder.outputItemName ?? selectedOrder.bom}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    BOM: {selectedOrder.bom} · Status:{" "}
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <SummaryStat label="Order Qty" value={(selectedOrder.orderQty ?? selectedOrder.producedQty).toLocaleString()} />
                  <SummaryStat label="Produced" value={selectedOrder.producedQty.toLocaleString()} />
                  <SummaryStat
                    label="Remaining"
                    value={remaining.toLocaleString()}
                    tone={remaining > 0 ? "warning" : "success"}
                  />
                </div>
              </div>
              {remaining === 0 && (
                <div className="mt-2 text-[11px] text-success flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3" /> Order is already fully produced.
                </div>
              )}
            </div>
          )}

          {/* Entry form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Produced Quantity <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                min={0}
                max={remaining || undefined}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="0"
                className="mt-1 tabular-nums"
                disabled={!selectedOrder}
              />
              {selectedOrder && Number(qty) > remaining && (
                <p className="mt-1 text-[11px] text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Exceeds remaining ({remaining}).
                </p>
              )}
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Batch No.
              </Label>
              <Input
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                placeholder="e.g. BCB-20A"
                className="mt-1 font-mono"
              />
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Shift</Label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as typeof SHIFTS[number])}
                className={selectCls}
              >
                {SHIFTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Produced By <span className="text-destructive">*</span>
              </Label>
              <select
                value={producer}
                onChange={(e) => setProducer(e.target.value)}
                className={selectCls}
              >
                {PRODUCERS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <LocationPicker
              officeId={officeId}
              warehouseId={warehouseId}
              onChange={(n) => { setOfficeId(n.officeId); setWarehouseId(n.warehouseId); }}
            />

            <div className="md:col-span-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Remarks</Label>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Yield notes, wastage, equipment issues, etc."
                className="mt-1 min-h-[72px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Helpful side note */}
      <div className="rounded-md border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground flex items-start gap-2">
        <Users className="h-4 w-4 shrink-0 mt-0.5" />
        <div>
          On save, the entry's <strong className="text-foreground">Produced Qty</strong> is added to the
          linked Production Order's running total. The order auto-advances to{" "}
          <strong className="text-foreground">In Preparation</strong> on the first entry and{" "}
          <strong className="text-foreground">Ready for QC</strong> once the full order qty is met.
        </div>
      </div>
    </div>
  );
}

function SummaryStat({
  label, value, tone,
}: { label: string; value: string; tone?: "warning" | "success" }) {
  return (
    <div className="text-right">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-0.5 text-sm font-semibold tabular-nums",
          tone === "warning" && "text-warning",
          tone === "success" && "text-success",
          !tone && "text-foreground",
        )}
      >
        {value}
      </div>
    </div>
  );
}

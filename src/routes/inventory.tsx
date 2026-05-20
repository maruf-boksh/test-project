import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Boxes, AlertTriangle, Snowflake, Eye, Pencil, FilePlus2 } from "lucide-react";
import { toast } from "sonner";
import { inventory } from "@/lib/sample-data";
import { KpiCard } from "@/components/common/KpiCard";
import { useRole } from "@/lib/roles";
import { LocationPicker, LocationFilter, LocationCell } from "@/components/common/LocationPicker";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/inventory")({
  head: () => ({ meta: [{ title: "Stock Overview" }] }),
  component: Inventory,
});

type BaseItem = (typeof inventory)[number];
type Item = BaseItem & {
  threshold?: number;
  lastEditedBy?: string;
  lastEditedDate?: string;
  lastEditedTime?: string;
  officeId?: string;
  warehouseId?: string;
};

const CATEGORIES = ["Grains", "Protein", "Beverage", "Dairy", "Vegetable", "Oil", "Misc"];
const UOM_OPTIONS = ["Kg", "Litre", "Bottle", "Unit", "Pcs", "Box", "Pack"];
const STORAGE_OPTIONS = ["Dry", "Cold", "Frozen"];

function computeStatus(stock: number, reorder: number, thresholdPct = 20): string {
  if (stock < reorder) return "Critical";
  if (stock < reorder * (1 + thresholdPct / 100)) return "Low";
  return "OK";
}

type FormState = {
  name: string;
  category: string;
  uom: string;
  stock: string;
  reorder: string;
  threshold: string;
  batch: string;
  expiry: string;
  storage: string;
  officeId: string;
  warehouseId: string;
};

const emptyForm: FormState = {
  name: "",
  category: "Grains",
  uom: "Kg",
  stock: "",
  reorder: "",
  threshold: "20",
  batch: "",
  expiry: "",
  storage: "Dry",
  officeId: "OFF-001",
  warehouseId: "WH-001",
};

const SELECT_CLS = "w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm";

function Inventory() {
  const { role } = useRole();
  // Backfill existing inventory rows with default Office + Central Warehouse
  const [items, setItems] = useState<Item[]>(
    inventory.map((i) => ({ ...i, officeId: "OFF-001", warehouseId: "WH-001" })),
  );
  const [newItemOpen, setNewItemOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<Item | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [filterOffice, setFilterOffice] = useState("");
  const [filterWarehouse, setFilterWarehouse] = useState("");

  const f = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const openNew = () => {
    setForm(emptyForm);
    setNewItemOpen(true);
  };

  const saveNew = () => {
    if (!form.name.trim()) { toast.error("Item name is required."); return; }
    if (!form.officeId) { toast.error("Office is required."); return; }
    if (!form.warehouseId) { toast.error("Warehouse is required."); return; }
    const stock = Number(form.stock) || 0;
    const reorder = Number(form.reorder) || 0;
    const threshold = Math.max(0, Number(form.threshold) || 20);
    const newItem: Item = {
      id: `INV-${String(Date.now()).slice(-4)}`,
      name: form.name.trim(),
      category: form.category,
      uom: form.uom,
      stock,
      reorder,
      threshold,
      batch: form.batch.trim() || "—",
      expiry: form.expiry || "—",
      storage: form.storage,
      status: computeStatus(stock, reorder, threshold),
      officeId: form.officeId,
      warehouseId: form.warehouseId,
    };
    setItems((prev) => [newItem, ...prev]);
    setNewItemOpen(false);
    toast.success(`${newItem.name} added to inventory.`);
  };

  const openEdit = (item: Item) => {
    setSelected(item);
    setForm({
      name: item.name,
      category: item.category,
      uom: item.uom,
      stock: String(item.stock),
      reorder: String(item.reorder),
      threshold: String(item.threshold ?? 20),
      batch: item.batch,
      expiry: item.expiry === "—" ? "" : item.expiry,
      storage: item.storage,
      officeId: item.officeId ?? "OFF-001",
      warehouseId: item.warehouseId ?? "WH-001",
    });
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (!selected) return;
    if (!form.name.trim()) { toast.error("Item name is required."); return; }
    const stock = Number(form.stock) || 0;
    const reorder = Number(form.reorder) || 0;
    const threshold = Math.max(0, Number(form.threshold) || 20);
    const now = new Date();
    const date = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true });
    setItems((prev) =>
      prev.map((i) =>
        i.id === selected.id
          ? {
              ...i,
              name: form.name.trim(),
              category: form.category,
              uom: form.uom,
              stock,
              reorder,
              threshold,
              batch: form.batch.trim() || "—",
              expiry: form.expiry || "—",
              storage: form.storage,
              status: computeStatus(stock, reorder, threshold),
              officeId: form.officeId,
              warehouseId: form.warehouseId,
              lastEditedBy: role,
              lastEditedDate: date,
              lastEditedTime: time,
            }
          : i,
      ),
    );
    setEditOpen(false);
    toast.success(`${form.name.trim()} updated successfully.`);
  };

  const openView = (item: Item) => {
    setSelected(item);
    setViewOpen(true);
  };

  const lowStockCount = items.filter((i) => i.status === "Low").length;
  const criticalCount = items.filter((i) => i.status === "Critical").length;

  const cols: Column<Item>[] = [
    { key: "id", header: "Code" },
    { key: "name", header: "Item" },
    {
      key: "officeId" as keyof Item, header: "Office / Warehouse",
      render: (r) => <LocationCell officeId={r.officeId} warehouseId={r.warehouseId} />,
    },
    { key: "category", header: "Category" },
    { key: "uom", header: "UOM" },
    {
      key: "stock", header: "Stock",
      render: (r) => (
        <span className={r.stock < r.reorder ? "text-destructive font-semibold" : ""}>{r.stock}</span>
      ),
    },
    { key: "reorder", header: "Reorder Lvl" },
    { key: "batch", header: "Batch" },
    { key: "expiry", header: "Expiry" },
    { key: "storage", header: "Storage" },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  const filteredItems = items.filter((i) => {
    if (filterOffice && i.officeId !== filterOffice) return false;
    if (filterWarehouse && i.warehouseId !== filterWarehouse) return false;
    return true;
  });

  return (
    <>
      <PageHeader
        title="Stock Overview"
        subtitle="Kitchen store item master — batch tracking, reorder levels and storage status"
        actions={
          <>
            <Button variant="outline" onClick={() => toast.success("Material issue request opened.")}>
              Material Issue
            </Button>
            <Button variant="outline" onClick={() => toast.success("Goods receipt note created.")}>
              GRN
            </Button>
            <Button onClick={openNew}>
              <Plus className="h-4 w-4 mr-1" /> New Item
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Items" value={1248} icon={Boxes} tone="navy" />
        <KpiCard label="Low Stock" value={lowStockCount} icon={AlertTriangle} tone="warning" />
        <KpiCard label="Critical" value={criticalCount} icon={AlertTriangle} tone="red" />
        <KpiCard label="Cold Storage" value="62%" sub="Capacity used" icon={Snowflake} tone="success" />
      </div>

      <div className="mb-4">
        <LocationFilter
          officeId={filterOffice}
          warehouseId={filterWarehouse}
          onChange={(n) => { setFilterOffice(n.officeId); setFilterWarehouse(n.warehouseId); }}
        />
      </div>

      <DataTable
        title="inventory"
        data={filteredItems}
        columns={cols}
        searchKeys={["name", "category", "batch", "status"]}
        actions={(row) => (
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => openView(row)}
              aria-label={`View ${row.name}`}
              title="View"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => openEdit(row)}
              aria-label={`Edit ${row.name}`}
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            {(row.status === "Low" || row.status === "Critical") && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-warning-foreground hover:text-warning-foreground hover:bg-warning/15"
                onClick={() => toast.success(`Demand request created for ${row.name}.`)}
                aria-label={`Create demand for ${row.name}`}
                title="Create Demand"
              >
                <FilePlus2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      />

      {/* New Item Dialog */}
      <Dialog open={newItemOpen} onOpenChange={setNewItemOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Inventory Item</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Item Name *</Label>
              <Input value={form.name} onChange={(e) => f("name", e.target.value)} placeholder="e.g. Chicken Breast" className="mt-1" />
            </div>
            <div>
              <Label>Category</Label>
              <select value={form.category} onChange={(e) => f("category", e.target.value)} className={SELECT_CLS}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label>UOM</Label>
              <select value={form.uom} onChange={(e) => f("uom", e.target.value)} className={SELECT_CLS}>
                {UOM_OPTIONS.map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <Label>Current Stock</Label>
              <Input type="number" min={0} value={form.stock} onChange={(e) => f("stock", e.target.value)} placeholder="0" className="mt-1" />
            </div>
            <div>
              <Label>Reorder Level</Label>
              <Input type="number" min={0} value={form.reorder} onChange={(e) => f("reorder", e.target.value)} placeholder="0" className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label>Stock Threshold (%)</Label>
              <Input type="number" min={0} max={200} value={form.threshold} onChange={(e) => f("threshold", e.target.value)} placeholder="20" className="mt-1" />
              <p className="mt-1.5 text-[11px] text-muted-foreground leading-relaxed bg-muted/60 rounded px-2.5 py-1.5">
                Sets the buffer above the Reorder Level that triggers <span className="font-semibold text-amber-600">Low</span> status.
                Stock below Reorder Level = <span className="font-semibold text-red-600">Critical</span>.
                Stock below Reorder Level × (1 + Threshold%) = <span className="font-semibold text-amber-600">Low</span>.
                <br />
                <span className="text-muted-foreground/80">Example: Reorder = 100, Threshold = 20% → Low when stock &lt; 120, Critical when stock &lt; 100.</span>
              </p>
            </div>
            <div>
              <Label>Batch No.</Label>
              <Input value={form.batch} onChange={(e) => f("batch", e.target.value)} placeholder="e.g. BR-2406" className="mt-1" />
            </div>
            <div>
              <Label>Expiry Date</Label>
              <Input type="date" value={form.expiry} onChange={(e) => f("expiry", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Storage</Label>
              <select value={form.storage} onChange={(e) => f("storage", e.target.value)} className={SELECT_CLS}>
                {STORAGE_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <LocationPicker
              officeId={form.officeId}
              warehouseId={form.warehouseId}
              onChange={(n) => setForm((p) => ({ ...p, officeId: n.officeId, warehouseId: n.warehouseId }))}
            />
          </div>
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setNewItemOpen(false)}>Cancel</Button>
            <Button onClick={saveNew}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Item — {selected?.id}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Item Name *</Label>
              <Input value={form.name} onChange={(e) => f("name", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Category</Label>
              <select value={form.category} onChange={(e) => f("category", e.target.value)} className={SELECT_CLS}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label>UOM</Label>
              <select value={form.uom} onChange={(e) => f("uom", e.target.value)} className={SELECT_CLS}>
                {UOM_OPTIONS.map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <Label>Current Stock</Label>
              <Input type="number" min={0} value={form.stock} onChange={(e) => f("stock", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Reorder Level</Label>
              <Input type="number" min={0} value={form.reorder} onChange={(e) => f("reorder", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Batch No.</Label>
              <Input value={form.batch} onChange={(e) => f("batch", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Expiry Date</Label>
              <Input type="date" value={form.expiry} onChange={(e) => f("expiry", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Storage</Label>
              <select value={form.storage} onChange={(e) => f("storage", e.target.value)} className={SELECT_CLS}>
                {STORAGE_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <LocationPicker
              officeId={form.officeId}
              warehouseId={form.warehouseId}
              onChange={(n) => setForm((p) => ({ ...p, officeId: n.officeId, warehouseId: n.warehouseId }))}
            />

            {selected?.lastEditedBy && (
              <div className="col-span-2 border-t pt-3">
                <div className="rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                  Last edited by{" "}
                  <span className="font-medium text-foreground">{selected.lastEditedBy}</span>
                  {" "}on {selected.lastEditedDate} at {selected.lastEditedTime}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={saveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="text-sm">
              {(
                [
                  ["Code", selected.id],
                  ["Category", selected.category],
                  ["UOM", selected.uom],
                  ["Current Stock", String(selected.stock)],
                  ["Reorder Level", String(selected.reorder)],
                  ["Batch No.", selected.batch],
                  ["Expiry", selected.expiry],
                  ["Storage", selected.storage],
                  ["Status", selected.status],
                ] as [string, string][]
              ).map(([label, value]) => (
                <div key={label} className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
              {selected.lastEditedBy && (
                <div className="mt-3 rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                  Last edited by{" "}
                  <span className="font-medium text-foreground">{selected.lastEditedBy}</span>
                  {" "}on {selected.lastEditedDate} at {selected.lastEditedTime}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
            <Button onClick={() => { setViewOpen(false); if (selected) openEdit(selected); }}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

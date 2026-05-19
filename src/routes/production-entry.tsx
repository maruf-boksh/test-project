import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { RowActions } from "@/components/common/RowActions";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Plus, Plane, Users, Clock, Flame, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { billOfMaterials, seedProductionEntries, seedFlightOrders, type FlightOrderRow } from "@/lib/sample-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DAYS,
  gmOrderSummary,
  mealCards,
  type FlightType,
  type MealCard,
} from "@/lib/meal-planning-data";

const TOTAL_MEALS_FROM_ORDERS = seedFlightOrders.reduce(
  (sum, o) => sum + o.pax + o.crew + o.specialMeals,
  0,
);

const DOMESTIC_AIRPORTS = new Set(["DAC", "CXB", "CGP", "ZYL", "JSR"]);

function getFlightTypeFromSector(sector: string): FlightType {
  const parts = sector.split("→");
  const dest = parts[parts.length - 1]?.trim();
  return dest && DOMESTIC_AIRPORTS.has(dest) ? "Domestic" : "International";
}

function getDayFromDate(dateStr: string): (typeof DAYS)[number] {
  const d = new Date(dateStr);
  const idx = d.getDay() === 0 ? 6 : d.getDay() - 1;
  return DAYS[idx];
}

type OrderRequirement = {
  day: (typeof DAYS)[number];
  flightType: FlightType;
  flights: number;
  passengers: number;
  crew: number;
  specialMeals: number;
  orders: FlightOrderRow[];
};

function computeOrderRequirements(orders: FlightOrderRow[]): OrderRequirement[] {
  const map = new Map<string, OrderRequirement>();
  for (const o of orders) {
    const day = getDayFromDate(o.date);
    const flightType = getFlightTypeFromSector(o.sector);
    const key = `${day}|${flightType}`;
    if (!map.has(key)) {
      map.set(key, {
        day, flightType, flights: 0, passengers: 0, crew: 0, specialMeals: 0, orders: [],
      });
    }
    const r = map.get(key)!;
    r.flights += 1;
    r.passengers += o.pax;
    r.crew += o.crew;
    r.specialMeals += o.specialMeals;
    r.orders.push(o);
  }
  return Array.from(map.values()).sort((a, b) => {
    const dayDiff = DAYS.indexOf(a.day) - DAYS.indexOf(b.day);
    if (dayDiff !== 0) return dayDiff;
    return a.flightType.localeCompare(b.flightType);
  });
}

const FORWARDED_ORDER = {
  date: gmOrderSummary.date,
  totalMeals: TOTAL_MEALS_FROM_ORDERS,
};

const DEPARTMENTS = ["Hot Kitchen", "Cold Kitchen", "Bakery", "Beverage", "Special Meal"];

const selectCls =
  "w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export const Route = createFileRoute("/production-entry")({
  head: () => ({ meta: [{ title: "Production Entry" }] }),
  component: ProductionEntryPage,
});

type ProductionEntry = {
  id: string;
  date: string;
  bom: string;
  producedQty: number;
  status: string;
};

const seedEntries: ProductionEntry[] = seedProductionEntries;

function ProductionEntryPage() {
  const [entries, setEntries] = useState<ProductionEntry[]>(seedEntries);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [view, setView] = useState<"list" | "create">("list");

  const addEntry = (entry: ProductionEntry) => {
    setEntries((prev) => [entry, ...prev]);
    setView("list");
  };

  const cols: Column<ProductionEntry>[] = [
    { key: "id",         header: "Entry No" },
    { key: "date",       header: "Date" },
    { key: "bom",        header: "BOM" },
    { key: "producedQty", header: "Produced Qty", className: "text-right" },
    { key: "status",     header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <>
      <PageHeader
        title="Production Entry"
        subtitle="Record and manage production entries"
        actions={
          <Button onClick={() => setView(view === "create" ? "list" : "create")}>
            <Plus className="h-4 w-4 mr-1" />
            {view === "create" ? "View List" : "Create Entry"}
          </Button>
        }
      />

      {view === "list" ? (
        <>
          <div className="mb-6 rounded-lg border border-success/30 bg-success/10 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-success">
                  Forwarded from Order Management
                </div>
                <div className="mt-1 text-base font-bold text-foreground">
                  New Meal Order for {FORWARDED_ORDER.date}
                </div>
                <div className="mt-0.5 text-sm text-muted-foreground">
                  Total Meals:{" "}
                  <span className="font-bold text-success">
                    {FORWARDED_ORDER.totalMeals.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  className="bg-success text-success-foreground hover:bg-success/90"
                  onClick={() => setDetailsOpen(true)}
                >
                  View Details
                </Button>
              </div>
            </div>
          </div>

          <DataTable
            title="production-entries"
            data={entries}
            columns={cols}
            searchKeys={["id", "bom", "status"]}
            selectable={false}
            actions={(r) => <RowActions row={r} actions={["view"]} />}
          />
        </>
      ) : (
        <ProductionEntryCreate onSave={addEntry} />
      )}

      <MealPlanningDetailsDialog open={detailsOpen} onOpenChange={setDetailsOpen} />
    </>
  );
}

type RecipeItem = {
  itemCode: string;
  itemName: string;
  uom: string;
  qtyPerUnit: number;
  rate: number;
};

type ProductionItem = {
  code: string;
  name: string;
  rawMaterials: RecipeItem[];
  packagingMaterials: RecipeItem[];
  otherConsumption: RecipeItem[];
};

const PRODUCTION_ITEMS: ProductionItem[] = [
  {
    code: "FG-001",
    name: "Chicken Biryani",
    rawMaterials: [
      { itemCode: "RM-001", itemName: "Basmati Rice",    uom: "Kg",    qtyPerUnit: 0.180, rate: 120 },
      { itemCode: "RM-002", itemName: "Chicken",         uom: "Kg",    qtyPerUnit: 0.120, rate: 280 },
      { itemCode: "RM-003", itemName: "Onion",           uom: "Kg",    qtyPerUnit: 0.040, rate: 60  },
      { itemCode: "RM-004", itemName: "Spice Mix",       uom: "Kg",    qtyPerUnit: 0.010, rate: 850 },
      { itemCode: "RM-005", itemName: "Cooking Oil",     uom: "Litre", qtyPerUnit: 0.020, rate: 175 },
    ],
    packagingMaterials: [
      { itemCode: "PKG-001", itemName: "Aluminum Tray",  uom: "Pcs", qtyPerUnit: 1, rate: 12 },
      { itemCode: "PKG-002", itemName: "Lid Foil",       uom: "Pcs", qtyPerUnit: 1, rate: 3  },
    ],
    otherConsumption: [
      { itemCode: "OC-001", itemName: "Cooking Gas",     uom: "Kg",  qtyPerUnit: 0.050, rate: 85 },
      { itemCode: "OC-002", itemName: "Disposable Glove", uom: "Pair", qtyPerUnit: 0.10, rate: 4  },
    ],
  },
  {
    code: "FG-002",
    name: "Veg Pulao",
    rawMaterials: [
      { itemCode: "RM-001", itemName: "Basmati Rice",    uom: "Kg",    qtyPerUnit: 0.180, rate: 120 },
      { itemCode: "RM-006", itemName: "Mixed Vegetable", uom: "Kg",    qtyPerUnit: 0.100, rate: 70  },
      { itemCode: "RM-005", itemName: "Cooking Oil",     uom: "Litre", qtyPerUnit: 0.020, rate: 175 },
      { itemCode: "RM-004", itemName: "Spice Mix",       uom: "Kg",    qtyPerUnit: 0.008, rate: 850 },
    ],
    packagingMaterials: [
      { itemCode: "PKG-001", itemName: "Aluminum Tray",  uom: "Pcs", qtyPerUnit: 1, rate: 12 },
      { itemCode: "PKG-002", itemName: "Lid Foil",       uom: "Pcs", qtyPerUnit: 1, rate: 3  },
    ],
    otherConsumption: [
      { itemCode: "OC-001", itemName: "Cooking Gas",     uom: "Kg",  qtyPerUnit: 0.040, rate: 85 },
    ],
  },
  {
    code: "FG-003",
    name: "Continental Breakfast",
    rawMaterials: [
      { itemCode: "RM-007", itemName: "Bread Loaf",      uom: "Pcs", qtyPerUnit: 0.25, rate: 30  },
      { itemCode: "RM-008", itemName: "Egg",             uom: "Pcs", qtyPerUnit: 1.0,  rate: 11  },
      { itemCode: "RM-009", itemName: "Butter",          uom: "Kg",  qtyPerUnit: 0.015, rate: 950 },
      { itemCode: "RM-010", itemName: "Sausage",         uom: "Pcs", qtyPerUnit: 2.0,  rate: 22  },
    ],
    packagingMaterials: [
      { itemCode: "PKG-003", itemName: "Breakfast Box",  uom: "Pcs", qtyPerUnit: 1, rate: 18 },
    ],
    otherConsumption: [
      { itemCode: "OC-001", itemName: "Cooking Gas",     uom: "Kg",  qtyPerUnit: 0.025, rate: 85 },
    ],
  },
  {
    code: "FG-004",
    name: "Grilled Salmon",
    rawMaterials: [
      { itemCode: "RM-011", itemName: "Salmon Fillet",   uom: "Kg",    qtyPerUnit: 0.140, rate: 1400 },
      { itemCode: "RM-012", itemName: "Lemon",           uom: "Pcs",   qtyPerUnit: 0.25,  rate: 8    },
      { itemCode: "RM-005", itemName: "Cooking Oil",     uom: "Litre", qtyPerUnit: 0.015, rate: 175  },
      { itemCode: "RM-004", itemName: "Spice Mix",       uom: "Kg",    qtyPerUnit: 0.008, rate: 850  },
    ],
    packagingMaterials: [
      { itemCode: "PKG-001", itemName: "Aluminum Tray",  uom: "Pcs", qtyPerUnit: 1, rate: 12 },
      { itemCode: "PKG-002", itemName: "Lid Foil",       uom: "Pcs", qtyPerUnit: 1, rate: 3  },
    ],
    otherConsumption: [
      { itemCode: "OC-001", itemName: "Cooking Gas",     uom: "Kg",  qtyPerUnit: 0.035, rate: 85 },
    ],
  },
];

type OutputLine = {
  id: string;
  itemCode: string;
  itemName: string;
  qty: number;
};

type AggregatedMaterial = RecipeItem & { reqQty: number };

function aggregateMaterials(lines: OutputLine[]) {
  const raw = new Map<string, AggregatedMaterial>();
  const pkg = new Map<string, AggregatedMaterial>();
  const other = new Map<string, AggregatedMaterial>();

  const addTo = (bucket: Map<string, AggregatedMaterial>, recipe: RecipeItem, qty: number) => {
    const reqQty = recipe.qtyPerUnit * qty;
    const existing = bucket.get(recipe.itemCode);
    if (existing) existing.reqQty += reqQty;
    else bucket.set(recipe.itemCode, { ...recipe, reqQty });
  };

  for (const line of lines) {
    const item = PRODUCTION_ITEMS.find((p) => p.code === line.itemCode);
    if (!item) continue;
    item.rawMaterials.forEach((r) => addTo(raw, r, line.qty));
    item.packagingMaterials.forEach((r) => addTo(pkg, r, line.qty));
    item.otherConsumption.forEach((r) => addTo(other, r, line.qty));
  }
  return {
    raw: Array.from(raw.values()),
    pkg: Array.from(pkg.values()),
    other: Array.from(other.values()),
  };
}

function MaterialTable({
  title, items,
}: { title: string; items: AggregatedMaterial[] }) {
  const grandTotal = items.reduce((sum, m) => sum + m.reqQty * m.rate, 0);

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        {title}
      </div>
      <div className="border border-border rounded-md overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-14 text-xs uppercase tracking-wider">SL</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Item Code</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Item Name</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">UoM</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-right">Req. Qty</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-right">Rate</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-right">Total Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-6">
                  —
                </TableCell>
              </TableRow>
            ) : (
              <>
                {items.map((m, i) => (
                  <TableRow key={m.itemCode}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell className="font-mono text-xs">{m.itemCode}</TableCell>
                    <TableCell className="font-medium">{m.itemName}</TableCell>
                    <TableCell>{m.uom}</TableCell>
                    <TableCell className="text-right tabular-nums">{m.reqQty.toFixed(3)}</TableCell>
                    <TableCell className="text-right tabular-nums">{m.rate.toFixed(2)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {(m.reqQty * m.rate).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/30 font-semibold">
                  <TableCell colSpan={6} className="text-right uppercase text-xs tracking-wider">
                    Total
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{grandTotal.toFixed(2)}</TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ProductionEntryCreate({ onSave }: { onSave?: (entry: ProductionEntry) => void }) {
  // Production Information
  const today = new Date().toISOString().slice(0, 10);
  const [orderDate, setOrderDate] = useState(today);
  const [withoutBom, setWithoutBom] = useState(false);
  const [bomName, setBomName] = useState("");
  const [department, setDepartment] = useState("");
  const [remarks, setRemarks] = useState("");

  // Production Output Item
  const [itemCode, setItemCode] = useState("");
  const [itemQty, setItemQty] = useState("");
  const [lines, setLines] = useState<OutputLine[]>([]);

  const materials = useMemo(() => aggregateMaterials(lines), [lines]);

  const addLine = () => {
    const item = PRODUCTION_ITEMS.find((p) => p.code === itemCode);
    if (!item) { toast.error("Select a production output item."); return; }
    const qty = Number(itemQty);
    if (!qty || qty <= 0) { toast.error("Production quantity must be greater than zero."); return; }
    setLines((prev) => [
      ...prev,
      { id: `OL-${Date.now()}`, itemCode: item.code, itemName: item.name, qty },
    ]);
    setItemCode("");
    setItemQty("");
  };

  const removeLine = (id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const handleSave = () => {
    if (!withoutBom && !bomName) { toast.error("Select a BOM or check 'Without BOM'."); return; }
    if (lines.length === 0) { toast.error("Add at least one production output item."); return; }

    const totalQty = lines.reduce((sum, l) => sum + l.qty, 0);
    const nextSeq = String(Date.now()).slice(-6);
    const newEntry: ProductionEntry = {
      id: `PE-2026-${nextSeq}`,
      date: orderDate,
      bom: withoutBom ? "Without BOM" : bomName,
      producedQty: totalQty,
      status: "Draft",
    };

    toast.success(`Entry ${newEntry.id} created with ${lines.length} item${lines.length > 1 ? "s" : ""}.`);
    onSave?.(newEntry);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground">
              Production Information
            </h3>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-1.5" /> Save
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Order Date <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Department
              </Label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={selectCls}
              >
                <option value="">Department</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
              <Checkbox
                id="without-bom"
                checked={withoutBom}
                onCheckedChange={(v) => {
                  const next = v === true;
                  setWithoutBom(next);
                  if (next) setBomName("");
                }}
              />
              <Label htmlFor="without-bom" className="text-sm font-normal cursor-pointer">
                Without BOM
              </Label>
            </div>

            <div className="md:col-span-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                BOM Name {!withoutBom && <span className="text-destructive">*</span>}
              </Label>
              <select
                value={bomName}
                onChange={(e) => setBomName(e.target.value)}
                disabled={withoutBom}
                className={selectCls}
              >
                <option value="">BOM Name</option>
                {billOfMaterials.map((b) => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Remarks
              </Label>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Remarks"
                className="mt-1 min-h-[72px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground mb-6">
            Production Output Item
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-6">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Production Item <span className="text-destructive">*</span>
              </Label>
              <select
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
                className={selectCls}
              >
                <option value="">Select Production Item</option>
                {PRODUCTION_ITEMS.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-4">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Production Quantity <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                min={0}
                value={itemQty}
                onChange={(e) => setItemQty(e.target.value)}
                placeholder="Quantity"
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <Button variant="outline" onClick={addLine} className="w-full">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
          </div>

          <div className="mt-6 border border-border rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-14 text-xs uppercase tracking-wider">SL</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Item Code</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Item Name</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-right">Production Qty</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                      No output items added yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  lines.map((l, i) => (
                    <TableRow key={l.id}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell className="font-mono text-xs">{l.itemCode}</TableCell>
                      <TableCell className="font-medium">{l.itemName}</TableCell>
                      <TableCell className="text-right tabular-nums">{l.qty}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => removeLine(l.id)}
                          aria-label={`Remove ${l.itemName}`}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground mb-6">
            Material Item Information
          </h3>
          {lines.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              Add a production output item to see required materials.
            </div>
          ) : (
            <div className="space-y-6">
              <MaterialTable title="Raw Materials" items={materials.raw} />
              <MaterialTable title="Packaging Materials" items={materials.pkg} />
              <MaterialTable title="Other Consumption" items={materials.other} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


function MealCardView({ meal }: { meal: MealCard }) {
  return (
    <Card>
      <CardContent className="pt-5 space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {meal.day}
            </div>
            <div className="mt-0.5 text-base font-bold text-foreground">{meal.mealType}</div>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> {meal.servingTime.start} – {meal.servingTime.end}
              </span>
              <span className="inline-flex items-center gap-1">
                <Flame className="h-3 w-3" /> {meal.totalKcal} kcal
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {meal.flightType.map((ft) => (
              <Badge key={ft} variant="outline" className="text-[10px]">
                <Plane className="h-2.5 w-2.5 mr-1" /> {ft}
              </Badge>
            ))}
            <Badge variant="secondary" className="text-[10px]">
              <Users className="h-2.5 w-2.5 mr-1" /> {meal.forType}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {meal.choices.map((c) => (
            <div key={c.label} className="rounded-md border border-border bg-muted/30 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-primary">{c.label}</span>
                <span className="text-[11px] text-muted-foreground">{c.percentage}%</span>
              </div>
              <ul className="space-y-1">
                {c.items.map((item, i) => (
                  <li key={i} className="text-xs flex items-center justify-between gap-2">
                    <span className="text-foreground">{item.name}</span>
                    <span className="text-muted-foreground tabular-nums shrink-0">
                      {item.weight}g · {item.calories} kcal
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {meal.specialMeals.filter((s) => s.enabled).length > 0 && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Special Meals
            </div>
            <div className="space-y-2">
              {meal.specialMeals.filter((s) => s.enabled).map((s) => (
                <div key={s.type} className="rounded-md border border-border p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{s.type}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {typeof s.portions === "number" ? `${s.portions} portions` : s.portions}
                    </span>
                  </div>
                  <ul className="space-y-0.5">
                    {s.items.map((item, i) => (
                      <li key={i} className="text-[11px] text-muted-foreground">
                        {item.name} <span className="text-foreground/60">({item.weight}g · {item.calories} kcal)</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
          <span className="text-xs text-muted-foreground">Dessert</span>
          <span className="text-xs font-medium text-foreground">
            {meal.dessert.name}{" "}
            <span className="text-muted-foreground font-normal">
              ({meal.dessert.weight}g · {meal.dessert.calories} kcal)
            </span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function MealPlanningDetailsDialog({
  open, onOpenChange,
}: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const requirements = useMemo(() => computeOrderRequirements(seedFlightOrders), []);
  const orderDays = useMemo(() => new Set(requirements.map((r) => r.day)), [requirements]);

  const byDay = useMemo(() => {
    const groups = new Map<string, MealCard[]>();
    for (const m of mealCards) {
      if (!orderDays.has(m.day as (typeof DAYS)[number])) continue;
      if (!groups.has(m.day)) groups.set(m.day, []);
      groups.get(m.day)!.push(m);
    }
    return Array.from(groups.entries()).sort(
      ([a], [b]) => DAYS.indexOf(a as (typeof DAYS)[number]) - DAYS.indexOf(b as (typeof DAYS)[number]),
    );
  }, [orderDays]);

  const totalPax = seedFlightOrders.reduce((s, o) => s + o.pax, 0);
  const totalCrew = seedFlightOrders.reduce((s, o) => s + o.crew, 0);
  const totalSpecial = seedFlightOrders.reduce((s, o) => s + o.specialMeals, 0);
  const totalMeals = totalPax + totalCrew + totalSpecial;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle>
            Meal Planning Details — New Meal Order for {gmOrderSummary.date}
          </DialogTitle>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
            <SummaryStat label="Flights"        value={seedFlightOrders.length.toString()} />
            <SummaryStat label="Passengers"     value={totalPax.toLocaleString()} />
            <SummaryStat label="Crew"           value={totalCrew.toString()} />
            <SummaryStat label="Special Meals"  value={totalSpecial.toString()} />
            <SummaryStat label="Total Meals"    value={totalMeals.toLocaleString()} success />
          </div>
        </DialogHeader>

        <Tabs defaultValue="orders" className="flex-1 overflow-hidden flex flex-col">
          <div className="px-6 pt-4 border-b border-border">
            <TabsList className="bg-transparent p-0 h-auto rounded-none gap-4">
              <TabsTrigger
                value="orders"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none px-1 pb-3 text-xs uppercase tracking-wider font-semibold"
              >
                Flight Orders ({seedFlightOrders.length})
              </TabsTrigger>
              <TabsTrigger
                value="meals"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none px-1 pb-3 text-xs uppercase tracking-wider font-semibold"
              >
                Meal Plan
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="orders" className="flex-1 overflow-y-auto px-6 py-5 mt-0">
            <FlightOrdersTabContent orders={seedFlightOrders} />
          </TabsContent>

          <TabsContent value="meals" className="flex-1 overflow-hidden flex flex-col mt-0">
            <div className="flex-1 overflow-y-auto">
              <div className="px-6 pt-5 pb-4">
                <RequirementsSummary requirements={requirements} />
              </div>

              <div className="px-6 py-3 border-y border-border bg-muted/30">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Menu Templates &mdash; {Array.from(orderDays).join(" · ")}
                </div>
              </div>

              <div className="px-6 py-5">
                {byDay.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-12">
                    No menu templates available for the order days.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {byDay.map(([day, meals]) => (
                      <div key={day}>
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                            {day}
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            ({meals.length} meal{meals.length > 1 ? "s" : ""})
                          </span>
                        </div>
                        <div className="space-y-3">
                          {meals.map((m) => <MealCardView key={m.id} meal={m} />)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function SummaryStat({
  label, value, success,
}: { label: string; value: string; success?: boolean }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("mt-0.5 font-semibold", success ? "text-success" : "text-foreground")}>
        {value}
      </div>
    </div>
  );
}

function FlightOrdersTabContent({ orders }: { orders: FlightOrderRow[] }) {
  const totalPax = orders.reduce((s, o) => s + o.pax, 0);
  const totalCrew = orders.reduce((s, o) => s + o.crew, 0);
  const totalSpecial = orders.reduce((s, o) => s + o.specialMeals, 0);

  return (
    <div className="space-y-4">
      <div className="border border-border rounded-md overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="text-xs uppercase tracking-wider">Order #</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Flight</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Sector</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Date</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">ETD</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-right">PAX</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-right">Crew</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-right">Special</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id} className="hover:bg-muted/30">
                <TableCell className="font-mono text-xs">{o.id}</TableCell>
                <TableCell className="font-medium">{o.flight}</TableCell>
                <TableCell>{o.sector}</TableCell>
                <TableCell>{o.date}</TableCell>
                <TableCell>{o.etd}</TableCell>
                <TableCell className="text-right tabular-nums">{o.pax}</TableCell>
                <TableCell className="text-right tabular-nums">{o.crew}</TableCell>
                <TableCell className="text-right tabular-nums">{o.specialMeals}</TableCell>
                <TableCell><StatusBadge status={o.status} /></TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/30 font-semibold">
              <TableCell colSpan={5} className="text-right uppercase text-xs tracking-wider">
                Totals
              </TableCell>
              <TableCell className="text-right tabular-nums">{totalPax.toLocaleString()}</TableCell>
              <TableCell className="text-right tabular-nums">{totalCrew.toLocaleString()}</TableCell>
              <TableCell className="text-right tabular-nums">{totalSpecial.toLocaleString()}</TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function RequirementsSummary({ requirements }: { requirements: OrderRequirement[] }) {
  const totals = requirements.reduce(
    (acc, r) => ({
      flights: acc.flights + r.flights,
      passengers: acc.passengers + r.passengers,
      crew: acc.crew + r.crew,
      specialMeals: acc.specialMeals + r.specialMeals,
    }),
    { flights: 0, passengers: 0, crew: 0, specialMeals: 0 },
  );
  const grandTotal = totals.passengers + totals.crew + totals.specialMeals;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-success">
          Required Meals (derived from Flight Orders)
        </div>
        <div className="text-[11px] text-muted-foreground">
          Grouped by Day &times; Flight Type
        </div>
      </div>
      <div className="border border-border rounded-md overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="text-xs uppercase tracking-wider">Day</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Flight Type</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-right">Flights</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-right">Passengers</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-right">Crew</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-right">Special</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-right">Total Meals</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requirements.map((r) => {
              const total = r.passengers + r.crew + r.specialMeals;
              return (
                <TableRow key={`${r.day}-${r.flightType}`}>
                  <TableCell className="font-medium">{r.day}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      <Plane className="h-2.5 w-2.5 mr-1" /> {r.flightType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{r.flights}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.passengers.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.crew.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.specialMeals.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">
                    {total.toLocaleString()}
                  </TableCell>
                </TableRow>
              );
            })}
            <TableRow className="bg-muted/30 font-semibold">
              <TableCell colSpan={2} className="text-right uppercase text-xs tracking-wider">
                Grand Total
              </TableCell>
              <TableCell className="text-right tabular-nums">{totals.flights}</TableCell>
              <TableCell className="text-right tabular-nums">{totals.passengers.toLocaleString()}</TableCell>
              <TableCell className="text-right tabular-nums">{totals.crew.toLocaleString()}</TableCell>
              <TableCell className="text-right tabular-nums">{totals.specialMeals.toLocaleString()}</TableCell>
              <TableCell className="text-right tabular-nums text-success">
                {grandTotal.toLocaleString()}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { RowActions } from "@/components/common/RowActions";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Layers, FileText, CheckCircle, Save, Trash2 } from "lucide-react";
import { billOfMaterials } from "@/lib/sample-data";
import { KpiCard } from "@/components/common/KpiCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/bom")({
  head: () => ({ meta: [{ title: "Bill of Materials" }] }),
  component: BomPage,
});

type BOM = (typeof billOfMaterials)[number];

function BomList({ data }: { data: BOM[] }) {
  const cols: Column<BOM>[] = [
    { key: "id", header: "BOM #" },
    { key: "name", header: "BOM Name" },
    { key: "version", header: "Version" },
    { key: "lastUpdated", header: "Last Updated" },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];
  return (
    <DataTable
      title="bom"
      data={data}
      columns={cols}
      searchKeys={["id", "name", "status"]}
      selectable={false}
      actions={(r) => <RowActions row={r} actions={["view", "edit", "approve", "print", "delete"]} />}
    />
  );
}

const HEADER_ITEM_TYPES = ["Finished Good", "Semi-Finished Good"];
const HEADER_CATEGORIES = ["Hot Kitchen", "Cold Kitchen", "Bakery", "Beverage"];
const HEADER_SUB_CATEGORIES = ["Main Course", "Side", "Dessert", "Snack"];
const FG_SFG_ITEMS = ["Chicken Biryani", "Beef Curry", "Vegetable Pulao", "Croissant", "Mango Mousse"];

const MATERIAL_ITEM_TYPES = ["Raw Material", "Packaging", "Consumable"];
const MATERIAL_CATEGORIES = ["Grains", "Protein", "Vegetable", "Spices", "Oil", "Dairy"];
const MATERIAL_SUB_CATEGORIES = ["Fresh", "Frozen", "Dry", "Liquid"];
const MATERIAL_ITEMS = ["Basmati Rice", "Chicken Breast", "Onion", "Tomato", "Cumin Powder", "Mustard Oil"];

const selectCls =
  "w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

type LineItem = {
  id: string;
  itemType: string;
  item: string;
  qty: number;
};

function BomCreate({ onSave }: { onSave?: (bom: BOM) => void }) {
  // BOM header
  const [bomName, setBomName] = useState("");
  const [itemType, setItemType] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [fgSfgItem, setFgSfgItem] = useState("");
  const [lotSize, setLotSize] = useState("");

  // Material entry row
  const [matItemType, setMatItemType] = useState(MATERIAL_ITEM_TYPES[0]);
  const [matCategory, setMatCategory] = useState("");
  const [matSubCategory, setMatSubCategory] = useState("");
  const [matItem, setMatItem] = useState("");
  const [matQty, setMatQty] = useState("");

  const [lines, setLines] = useState<LineItem[]>([]);

  const addLine = () => {
    if (!matItem) { toast.error("Select a material item."); return; }
    const qty = Number(matQty);
    if (!qty || qty <= 0) { toast.error("Quantity must be greater than zero."); return; }
    setLines((prev) => [
      ...prev,
      { id: `LN-${Date.now()}`, itemType: matItemType, item: matItem, qty },
    ]);
    setMatItem("");
    setMatQty("");
  };

  const removeLine = (id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const handleSave = () => {
    if (!bomName.trim()) { toast.error("BOM Name is required."); return; }
    if (lines.length === 0) { toast.error("Add at least one input material."); return; }

    const today = new Date().toISOString().slice(0, 10);
    const newBom: BOM = {
      id: `BOM-${String(Date.now()).slice(-3)}`,
      name: fgSfgItem ? `${bomName.trim()} — ${fgSfgItem}` : bomName.trim(),
      components: lines.length,
      version: "v1.0",
      yield: lotSize ? `${lotSize} portions` : "Set",
      lastUpdated: today,
      status: "Draft",
    };

    toast.success(`BOM "${bomName.trim()}" saved with ${lines.length} material${lines.length > 1 ? "s" : ""}.`);
    onSave?.(newBom);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground">
              Create Bill of Material
            </h3>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-1.5" /> Save
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="md:col-span-2 md:max-w-xs">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                BOM Name <span className="text-destructive">*</span>
              </Label>
              <Input
                value={bomName}
                onChange={(e) => setBomName(e.target.value)}
                placeholder="BOM Name"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Item Type
              </Label>
              <select
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                className={selectCls}
              >
                <option value="">Item Type</option>
                {HEADER_ITEM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Category
              </Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={selectCls}
              >
                <option value="">Category</option>
                {HEADER_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Sub Category
              </Label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className={selectCls}
              >
                <option value="">Sub Category</option>
                {HEADER_SUB_CATEGORIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                FG/SFG Item
              </Label>
              <select
                value={fgSfgItem}
                onChange={(e) => setFgSfgItem(e.target.value)}
                className={selectCls}
              >
                <option value="">Select FG/SFG Item</option>
                {FG_SFG_ITEMS.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            <div className="md:max-w-xs">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Lot Size
              </Label>
              <Input
                type="number"
                min={0}
                value={lotSize}
                onChange={(e) => setLotSize(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="input-materials">
            <TabsList className="h-auto bg-transparent p-0 border-b border-border w-full justify-start rounded-none">
              <TabsTrigger
                value="input-materials"
                className="text-xs uppercase tracking-wider rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none px-4 pb-3"
              >
                Input Materials Setup
              </TabsTrigger>
            </TabsList>

            <TabsContent value="input-materials" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Item Type
                  </Label>
                  <select
                    value={matItemType}
                    onChange={(e) => setMatItemType(e.target.value)}
                    className={selectCls}
                  >
                    {MATERIAL_ITEM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Category
                  </Label>
                  <select
                    value={matCategory}
                    onChange={(e) => setMatCategory(e.target.value)}
                    className={selectCls}
                  >
                    <option value="">Category</option>
                    {MATERIAL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Sub Category
                  </Label>
                  <select
                    value={matSubCategory}
                    onChange={(e) => setMatSubCategory(e.target.value)}
                    className={selectCls}
                  >
                    <option value="">Sub Category</option>
                    {MATERIAL_SUB_CATEGORIES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="md:col-span-3">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Material Item <span className="text-destructive">*</span>
                  </Label>
                  <select
                    value={matItem}
                    onChange={(e) => setMatItem(e.target.value)}
                    className={selectCls}
                  >
                    <option value="">Select item</option>
                    {MATERIAL_ITEMS.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>

                <div className="md:col-span-3 flex items-end gap-2">
                  <div className="flex-1">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      Quantity <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      value={matQty}
                      onChange={(e) => setMatQty(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <Button variant="outline" onClick={addLine}>
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
              </div>

              <div className="mt-6 border border-border rounded-md overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="text-xs uppercase tracking-wider">Item Type</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider">Item</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-right">Qty</TableHead>
                      <TableHead className="w-16" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">
                          No materials added yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      lines.map((l) => (
                        <TableRow key={l.id}>
                          <TableCell>{l.itemType}</TableCell>
                          <TableCell className="font-medium">{l.item}</TableCell>
                          <TableCell className="text-right">{l.qty}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0"
                              onClick={() => removeLine(l.id)}
                              aria-label={`Remove ${l.item}`}
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function BomPage() {
  const [boms, setBoms] = useState<BOM[]>(billOfMaterials);
  const [view, setView] = useState<"list" | "create">("list");

  const addBom = (bom: BOM) => {
    setBoms((prev) => [bom, ...prev]);
    setView("list");
  };

  const activeCount = boms.filter((b) => b.status === "Active").length;
  const draftCount = boms.filter((b) => b.status === "Draft").length;

  return (
    <>
      <PageHeader
        title="Bill of Materials (BOM)"
        subtitle="Manage meal recipes, component lists, version control and yield planning for the flight kitchen"
        actions={
          <>
            <Button variant="outline" onClick={() => toast.success("BOM report exported.")}>
              <FileText className="h-4 w-4 mr-1" /> Export
            </Button>
            <Button onClick={() => setView(view === "create" ? "list" : "create")}>
              <Plus className="h-4 w-4 mr-1" /> {view === "create" ? "View List" : "Create BOM"}
            </Button>
          </>
        }
      />

      {view === "list" ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <KpiCard label="Total BOMs" value={boms.length} icon={Layers} tone="navy" />
            <KpiCard label="Active" value={activeCount} icon={CheckCircle} tone="success" />
            <KpiCard label="Draft" value={draftCount} icon={FileText} tone="warning" />
          </div>
          <BomList data={boms} />
        </>
      ) : (
        <BomCreate onSave={addBom} />
      )}
    </>
  );
}

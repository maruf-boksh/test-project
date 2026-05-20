import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { RowActions } from "@/components/common/RowActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, ArrowLeft, Save, Tag, CheckCircle, XCircle,
  ChevronRight, ChevronDown, FolderTree,
} from "lucide-react";
import { KpiCard } from "@/components/common/KpiCard";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  items as MASTER_ITEMS,
  ITEM_TYPES,
  ITEM_CATEGORIES,
  ITEM_SUB_CATEGORIES,
  ITEM_UOMS,
  type ItemMaster,
} from "@/lib/sample-data";

export const Route = createFileRoute("/config-item")({
  head: () => ({ meta: [{ title: "Configuration · Item" }] }),
  component: ConfigItemPage,
});

type ItemRow = ItemMaster;

const CATEGORIES = ITEM_CATEGORIES;
const SUB_CATEGORIES = ITEM_SUB_CATEGORIES;
const UOMS = ITEM_UOMS;

const selectCls =
  "w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";


function ConfigItemPage() {
  const [rows, setRows] = useState<ItemRow[]>(MASTER_ITEMS);
  const [view, setView] = useState<"list" | "create">("list");
  const [tab, setTab] = useState<"items" | "category">("items");

  const toggle = (id: string) =>
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: r.status === "Active" ? "Inactive" : "Active" } : r)),
    );

  const add = (row: ItemRow) => {
    setRows((prev) => [row, ...prev]);
    setView("list");
  };

  const activeCount = rows.filter((r) => r.status === "Active").length;

  return (
    <>
      <PageHeader
        title="Item Configuration"
        subtitle="Master list of raw materials, packaging, consumables and finished goods used across the kitchen"
        actions={
          tab === "items" ? (
            <Button
              variant={view === "create" ? "outline" : "default"}
              onClick={() => setView(view === "create" ? "list" : "create")}
            >
              {view === "create" ? <><ArrowLeft className="h-4 w-4 mr-1" /> Back</> : <><Plus className="h-4 w-4 mr-1" /> Create Item</>}
            </Button>
          ) : null
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as "items" | "category")} className="space-y-4">
        <TabsList className="h-auto bg-transparent p-0 border-b border-border w-full justify-start rounded-none">
          <TabsTrigger
            value="items"
            className="text-xs uppercase tracking-wider rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none px-4 pb-3"
          >
            Item Profile
          </TabsTrigger>
          <TabsTrigger
            value="category"
            className="text-xs uppercase tracking-wider rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none px-4 pb-3"
          >
            Category
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="mt-0">
          {view === "list" ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <KpiCard label="Total Items" value={rows.length} icon={Tag} tone="navy" />
                <KpiCard label="Active" value={activeCount} icon={CheckCircle} tone="success" />
                <KpiCard label="Inactive" value={rows.length - activeCount} icon={XCircle} tone="warning" />
              </div>
              <ItemList data={rows} onToggle={toggle} />
            </>
          ) : (
            <ItemCreate nextId={`ITM-${String(rows.length + 1).padStart(3, "0")}`} onSave={add} />
          )}
        </TabsContent>

        <TabsContent value="category" className="mt-0">
          <CategoryManager items={rows} />
        </TabsContent>
      </Tabs>
    </>
  );
}

type CategoryNode = {
  id: string;
  description: string;
  children: CategoryNode[];
};

const CATEGORY_TREE: CategoryNode[] = [
  { id: "C-1",  description: "Grains",    children: [
    { id: "C-1-1", description: "Rice",            children: [] },
    { id: "C-1-2", description: "Flour",           children: [] },
    { id: "C-1-3", description: "Pasta",           children: [] },
  ]},
  { id: "C-2",  description: "Protein",   children: [
    { id: "C-2-1", description: "Chicken",         children: [] },
    { id: "C-2-2", description: "Beef",            children: [] },
    { id: "C-2-3", description: "Mutton",          children: [] },
    { id: "C-2-4", description: "Seafood",         children: [] },
    { id: "C-2-5", description: "Egg",             children: [] },
  ]},
  { id: "C-3",  description: "Vegetable", children: [
    { id: "C-3-1", description: "Fresh Vegetable", children: [] },
    { id: "C-3-2", description: "Frozen Vegetable",children: [] },
    { id: "C-3-3", description: "Leafy Greens",    children: [] },
  ]},
  { id: "C-4",  description: "Spices",    children: [
    { id: "C-4-1", description: "Whole Spices",    children: [] },
    { id: "C-4-2", description: "Ground Spices",   children: [] },
    { id: "C-4-3", description: "Spice Blends",    children: [] },
  ]},
  { id: "C-5",  description: "Oil",       children: [
    { id: "C-5-1", description: "Cooking Oil",     children: [] },
    { id: "C-5-2", description: "Specialty Oil",   children: [] },
    { id: "C-5-3", description: "Ghee",            children: [] },
  ]},
  { id: "C-6",  description: "Dairy",     children: [
    { id: "C-6-1", description: "Milk",            children: [] },
    { id: "C-6-2", description: "Butter & Cream",  children: [] },
    { id: "C-6-3", description: "Cheese",          children: [] },
    { id: "C-6-4", description: "Yogurt",          children: [] },
  ]},
  { id: "C-7",  description: "Beverage",  children: [
    { id: "C-7-1", description: "Water",           children: [] },
    { id: "C-7-2", description: "Juice",           children: [] },
    { id: "C-7-3", description: "Tea & Coffee",    children: [] },
    { id: "C-7-4", description: "Soft Drinks",     children: [] },
  ]},
  { id: "C-8",  description: "Bakery",    children: [
    { id: "C-8-1", description: "Bread",           children: [] },
    { id: "C-8-2", description: "Pastry",          children: [] },
    { id: "C-8-3", description: "Cake",            children: [] },
    { id: "C-8-4", description: "Cookies",         children: [] },
  ]},
  { id: "C-9",  description: "Meal",      children: [
    { id: "C-9-1", description: "Hot Meal",        children: [] },
    { id: "C-9-2", description: "Cold Meal",       children: [] },
    { id: "C-9-3", description: "Special Meal",    children: [] },
  ]},
  { id: "C-10", description: "Packaging", children: [
    { id: "C-10-1", description: "Boxes & Trays",  children: [] },
    { id: "C-10-2", description: "Cups & Bottles", children: [] },
    { id: "C-10-3", description: "Films & Wraps",  children: [] },
    { id: "C-10-4", description: "Labels",         children: [] },
  ]},
];

function CategoryManager({ items }: { items: ItemRow[] }) {
  const [mode, setMode] = useState<"table" | "tree">("table");

  const itemCount = (description: string) =>
    items.filter((i) => i.category.toLowerCase() === description.toLowerCase()).length;

  const totalCategories = CATEGORY_TREE.length;
  const totalSubCategories = CATEGORY_TREE.reduce((s, c) => s + c.children.length, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KpiCard label="Categories" value={totalCategories} icon={FolderTree} tone="navy" />
        <KpiCard label="Sub Categories" value={totalSubCategories} icon={Tag} tone="success" />
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center gap-6 mb-4 border-b border-border pb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category-view"
                value="table"
                checked={mode === "table"}
                onChange={() => setMode("table")}
                className="h-4 w-4 accent-primary cursor-pointer"
              />
              <span className="text-sm font-medium">Table View</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category-view"
                value="tree"
                checked={mode === "tree"}
                onChange={() => setMode("tree")}
                className="h-4 w-4 accent-primary cursor-pointer"
              />
              <span className="text-sm font-medium">Tree View</span>
            </label>
          </div>

          {mode === "table" ? (
            <CategoryTableView nodes={CATEGORY_TREE} itemCount={itemCount} />
          ) : (
            <CategoryTreeView nodes={CATEGORY_TREE} itemCount={itemCount} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CategoryTableView({
  nodes, itemCount,
}: { nodes: CategoryNode[]; itemCount: (d: string) => number }) {
  return (
    <div className="border border-border rounded-md overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-primary/5">
          <tr>
            <th className="w-16 text-left px-3 py-2 text-[10px] uppercase tracking-wider font-semibold">SL</th>
            <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider font-semibold">Description</th>
            <th className="w-32 text-right px-3 py-2 text-[10px] uppercase tracking-wider font-semibold">Items</th>
          </tr>
        </thead>
        <tbody>
          {nodes.map((parent, pi) => (
            <Fragment2 key={parent.id}>
              <tr className="border-t border-border bg-muted/20 font-medium">
                <td className="px-3 py-2 tabular-nums">{pi + 1}</td>
                <td className="px-3 py-2">{parent.description}</td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                  {itemCount(parent.description)}
                </td>
              </tr>
              {parent.children.map((child, ci) => (
                <tr key={child.id} className="border-t border-border hover:bg-muted/10">
                  <td className="px-3 py-2 tabular-nums text-muted-foreground pl-8">{ci + 1}</td>
                  <td className="px-3 py-2 pl-8 text-muted-foreground">{child.description}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">—</td>
                </tr>
              ))}
            </Fragment2>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Fragment2({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function CategoryTreeView({
  nodes, itemCount,
}: { nodes: CategoryNode[]; itemCount: (d: string) => number }) {
  return (
    <div className="space-y-1">
      {nodes.map((n) => (
        <TreeNode key={n.id} node={n} depth={0} itemCount={itemCount} defaultOpen />
      ))}
    </div>
  );
}

function TreeNode({
  node, depth, itemCount, defaultOpen,
}: {
  node: CategoryNode;
  depth: number;
  itemCount: (d: string) => number;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const hasChildren = node.children.length > 0;
  const count = depth === 0 ? itemCount(node.description) : 0;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm hover:bg-muted/40 transition-colors",
          depth === 0 && "font-medium",
        )}
        style={{ paddingLeft: 8 + depth * 20 }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="h-5 w-5 inline-flex items-center justify-center rounded hover:bg-muted text-muted-foreground"
            aria-label={open ? "Collapse" : "Expand"}
          >
            {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        ) : (
          <span className="h-5 w-5 inline-block" aria-hidden />
        )}
        <span className="flex-1">{node.description}</span>
        {depth === 0 && count > 0 && (
          <span className="text-[10px] tabular-nums rounded-full bg-muted/60 text-muted-foreground px-2 py-0.5">
            {count} item{count === 1 ? "" : "s"}
          </span>
        )}
      </div>
      {hasChildren && open && (
        <div>
          {node.children.map((c) => (
            <TreeNode key={c.id} node={c} depth={depth + 1} itemCount={itemCount} />
          ))}
        </div>
      )}
    </div>
  );
}

function ItemList({ data, onToggle }: { data: ItemRow[]; onToggle: (id: string) => void }) {
  const cols: Column<ItemRow>[] = [
    { key: "id", header: "ID" },
    { key: "code", header: "Code", render: (r) => <span className="font-mono text-xs">{r.code}</span> },
    { key: "name", header: "Item Name" },
    { key: "itemType", header: "Type" },
    { key: "category", header: "Category" },
    { key: "uom", header: "UOM" },
    {
      key: "status",
      header: "Status",
      render: (r) => {
        const active = r.status === "Active";
        return (
          <div className="flex items-center gap-2">
            <Switch checked={active} onCheckedChange={() => onToggle(r.id)} />
            <span className={cn("text-xs font-medium", active ? "text-success" : "text-muted-foreground")}>
              {r.status}
            </span>
          </div>
        );
      },
    },
  ];
  return (
    <DataTable
      title="items"
      data={data}
      columns={cols}
      searchKeys={["id", "code", "name", "itemType", "category"]}
      selectable={false}
      actions={(r) => <RowActions row={r} actions={["view", "edit", "print"]} />}
    />
  );
}

function ItemCreate({ nextId, onSave }: { nextId: string; onSave: (row: ItemRow) => void }) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [itemType, setItemType] = useState<string>(ITEM_TYPES[0]);
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [uom, setUom] = useState<string>(UOMS[0]);

  // Stock & storage
  const [currentStock, setCurrentStock] = useState("0");
  const [reorderLevel, setReorderLevel] = useState("0");
  const [thresholdPct, setThresholdPct] = useState("20");
  const [batchNo, setBatchNo] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const save = () => {
    if (!name.trim()) { toast.error("Item name is required."); return; }
    if (!code.trim()) { toast.error("Item code is required."); return; }
    const stock = Number(currentStock) || 0;
    const reorder = Number(reorderLevel) || 0;
    const threshold = Number(thresholdPct) || 0;
    if (stock < 0 || reorder < 0 || threshold < 0) {
      toast.error("Stock, reorder level and threshold must be non-negative.");
      return;
    }
    onSave({
      id: nextId,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      itemType: itemType as ItemRow["itemType"],
      category, subCategory, uom,
      status: "Active",
      currentStock: stock,
      reorderLevel: reorder,
      thresholdPct: threshold,
      batchNo: batchNo.trim() || undefined,
      expiryDate: expiryDate || undefined,
    });
    toast.success(`Item "${name.trim()}" created.`);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider">Create Item</h3>
          <Button onClick={save}><Save className="h-4 w-4 mr-1.5" /> Save</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Item ID</Label>
            <Input value={nextId} disabled className="mt-1 font-mono" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Item Code <span className="text-destructive">*</span></Label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} className="mt-1" placeholder="e.g. RM-RICE-BSMT" />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Item Name <span className="text-destructive">*</span></Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Item Type</Label>
            <select value={itemType} onChange={(e) => setItemType(e.target.value)} className={selectCls}>
              {ITEM_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Category</Label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Sub Category</Label>
            <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className={selectCls}>
              <option value="">Select sub category</option>
              {SUB_CATEGORIES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">UOM</Label>
            <select value={uom} onChange={(e) => setUom(e.target.value)} className={selectCls}>
              {UOMS.map((u) => <option key={u}>{u}</option>)}
            </select>
          </div>

          <div className="md:col-span-2 mt-2 pt-4 border-t border-border">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Stock & Storage
            </h4>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Current Stock</Label>
            <Input type="number" min={0} value={currentStock} onChange={(e) => setCurrentStock(e.target.value)} className="mt-1 tabular-nums" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Reorder Level</Label>
            <Input type="number" min={0} value={reorderLevel} onChange={(e) => setReorderLevel(e.target.value)} className="mt-1 tabular-nums" />
          </div>

          <div className="md:col-span-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Stock Threshold (%)</Label>
            <Input type="number" min={0} value={thresholdPct} onChange={(e) => setThresholdPct(e.target.value)} className="mt-1 tabular-nums" />
            <div className="mt-2 rounded-md bg-muted/40 border border-border px-3 py-2 text-[11px] text-muted-foreground leading-relaxed">
              Sets the buffer above the Reorder Level that triggers <span className="font-semibold text-warning-foreground">Low</span> status.
              Stock below Reorder Level = <span className="font-semibold text-destructive">Critical</span>.
              Stock below Reorder Level × (1 + Threshold%) = <span className="font-semibold text-warning-foreground">Low</span>.
              <div className="mt-1">
                <span className="text-foreground/70">Example:</span> Reorder = 100, Threshold = 20% → Low when stock &lt; 120, Critical when stock &lt; 100.
              </div>
            </div>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Batch No.</Label>
            <Input value={batchNo} onChange={(e) => setBatchNo(e.target.value)} className="mt-1 font-mono" placeholder="e.g. BR-2406" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Expiry Date</Label>
            <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="mt-1 tabular-nums" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

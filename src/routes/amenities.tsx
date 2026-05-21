import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { RowActions } from "@/components/common/RowActions";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Pill, Scroll, Utensils, Boxes, Eye, Package, ChevronRight, ChevronLeft, Pencil } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KpiCard } from "@/components/common/KpiCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { amenitiesMedicine, amenitiesTissue, amenitiesCutlery } from "@/lib/sample-data";
import { toast } from "sonner";

export const Route = createFileRoute("/amenities")({
  head: () => ({ meta: [{ title: "Amenities" }] }),
  component: Amenities,
});

const PAX_96H = 1248;
const DEFAULT_ISSUED_BY = "Meal Planner";

type Row = { id: string; item: string; brand?: string; uom: string; stock: number; reorder: number; flight?: string; status: string };
type CategoryKey = "medicine" | "tissue" | "cutlery" | "other";
type IssueLineItem = { name: string; amount: number };

type IssuedRecord = {
  id: string;
  flightType: string;
  issuedBy: string;
  issuedAt: string;
  paxCount: number;
  medicine: IssueLineItem[];
  tissue: IssueLineItem[];
  cutlery: IssueLineItem[];
  other: IssueLineItem[];
};

const CATEGORY_OPTIONS: Record<Exclude<CategoryKey, "other">, string[]> = {
  medicine: amenitiesMedicine.map((m) => m.item),
  tissue: amenitiesTissue.map((t) => t.item),
  cutlery: amenitiesCutlery.map((c) => c.item),
};

const CATEGORY_META: Record<CategoryKey, { label: string; icon: any; color: string; bg: string }> = {
  medicine: { label: "Medicine", icon: Pill, color: "text-red-600", bg: "bg-red-50 border-red-200" },
  tissue: { label: "Tissue", icon: Scroll, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  cutlery: { label: "Cutlery", icon: Utensils, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  other: { label: "Other", icon: Package, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
};

const CATS: CategoryKey[] = ["medicine", "tissue", "cutlery", "other"];
const TOTAL_CAT_STEPS = 4;

const catTotal = (items: IssueLineItem[]) => items.reduce((s, i) => s + i.amount, 0);

const EMPTY_ITEMS: Record<CategoryKey, IssueLineItem[]> = { medicine: [], tissue: [], cutlery: [], other: [] };
const EMPTY_STR: Record<CategoryKey, string> = { medicine: "", tissue: "", cutlery: "", other: "" };
const EMPTY_AMT: Record<CategoryKey, number | ""> = { medicine: "", tissue: "", cutlery: "", other: "" };

function inventoryTable(data: Row[], extraKey?: { key: keyof Row; header: string }) {
  const cols: Column<Row>[] = [
    { key: "id", header: "Code" },
    { key: "item", header: "Item" },
    ...(extraKey ? [extraKey as Column<Row>] : []),
    { key: "uom", header: "UOM" },
    { key: "stock", header: "Stock" },
    { key: "reorder", header: "Reorder" },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];
  return (
    <DataTable
      title="amenities"
      data={data}
      columns={cols}
      searchKeys={["id", "item", "status"]}
      actions={(r) => <RowActions row={r} actions={["view", "edit", "delete"]} />}
    />
  );
}

// Reusable category section used in both the wizard and the edit dialog
function CategorySection({
  cat,
  items,
  pendingName,
  pendingAmount,
  onAdd,
  onRemove,
  onNameChange,
  onAmountChange,
  skipHint,
}: {
  cat: CategoryKey;
  items: IssueLineItem[];
  pendingName: string;
  pendingAmount: number | "";
  onAdd: () => void;
  onRemove: (idx: number) => void;
  onNameChange: (v: string) => void;
  onAmountChange: (v: number | "") => void;
  skipHint?: boolean;
}) {
  const meta = CATEGORY_META[cat];
  const Icon = meta.icon;
  const options = cat !== "other" ? CATEGORY_OPTIONS[cat as Exclude<CategoryKey, "other">] : [];

  return (
    <div className={`rounded-lg border p-3 space-y-2.5 ${meta.bg}`}>
      <div className={`text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 ${meta.color}`}>
        <Icon className="h-3.5 w-3.5" /> {meta.label} Items
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex items-center justify-between bg-white rounded-md px-2.5 py-1.5 text-xs border border-border">
          <span className="font-medium text-slate-700">{item.name}</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">{item.amount} units</span>
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="text-red-400 hover:text-red-600 text-base leading-none w-5 text-center"
            >×</button>
          </div>
        </div>
      ))}
      <div className="flex gap-2 items-center">
        {cat !== "other" ? (
          <select
            value={pendingName}
            onChange={(e) => onNameChange(e.target.value)}
            className="flex-1 rounded-md border border-input bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Select {meta.label.toLowerCase()}...</option>
            {options.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        ) : (
          <Input
            placeholder="Enter item name"
            value={pendingName}
            onChange={(e) => onNameChange(e.target.value)}
            className="flex-1 h-8 text-xs bg-white"
          />
        )}
        <Input
          type="number"
          min={1}
          placeholder="Units"
          value={pendingAmount}
          onChange={(e) => onAmountChange(e.target.value === "" ? "" : Number(e.target.value))}
          className="w-20 h-8 text-xs bg-white"
        />
        <Button size="sm" onClick={onAdd} className="h-8 text-xs px-3">Add</Button>
      </div>
      {skipHint && items.length === 0 && (
        <p className="text-[11px] text-center text-muted-foreground pt-1">
          No items added — click Next to skip this category.
        </p>
      )}
    </div>
  );
}

function Amenities() {
  // ── New Issue Wizard ──
  const [newIssueOpen, setNewIssueOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [issueFlightType, setIssueFlightType] = useState("");
  const [categoryItems, setCategoryItems] = useState<Record<CategoryKey, IssueLineItem[]>>(EMPTY_ITEMS);
  const [pendingName, setPendingName] = useState<Record<CategoryKey, string>>(EMPTY_STR);
  const [pendingAmount, setPendingAmount] = useState<Record<CategoryKey, number | "">>(EMPTY_AMT);

  // ── Edit Dialog ──
  const [editRecord, setEditRecord] = useState<IssuedRecord | null>(null);
  const [editFlightType, setEditFlightType] = useState("");
  const [editItems, setEditItems] = useState<Record<CategoryKey, IssueLineItem[]>>(EMPTY_ITEMS);
  const [editPendingName, setEditPendingName] = useState<Record<CategoryKey, string>>(EMPTY_STR);
  const [editPendingAmount, setEditPendingAmount] = useState<Record<CategoryKey, number | "">>(EMPTY_AMT);

  // ── Records & View ──
  const [issuedRecords, setIssuedRecords] = useState<IssuedRecord[]>([]);
  const [viewRecord, setViewRecord] = useState<IssuedRecord | null>(null);
  const [viewCategory, setViewCategory] = useState<{ label: string; items: IssueLineItem[] } | null>(null);

  // ── Wizard helpers ──
  const resetForm = () => {
    setIssueFlightType("");
    setWizardStep(0);
    setCategoryItems({ ...EMPTY_ITEMS });
    setPendingName({ ...EMPTY_STR });
    setPendingAmount({ ...EMPTY_AMT });
  };

  const addItem = (cat: CategoryKey) => {
    if (!pendingName[cat]) { toast.error("Select or enter an item."); return; }
    if (!pendingAmount[cat] || Number(pendingAmount[cat]) <= 0) { toast.error("Enter a valid amount."); return; }
    setCategoryItems((p) => ({ ...p, [cat]: [...p[cat], { name: pendingName[cat], amount: Number(pendingAmount[cat]) }] }));
    setPendingName((p) => ({ ...p, [cat]: "" }));
    setPendingAmount((p) => ({ ...p, [cat]: "" }));
  };

  const removeItem = (cat: CategoryKey, idx: number) =>
    setCategoryItems((p) => ({ ...p, [cat]: p[cat].filter((_, i) => i !== idx) }));

  const handleNext = () => {
    if (wizardStep === 0 && !issueFlightType) { toast.error("Select a flight type."); return; }
    setWizardStep((s) => s + 1);
  };

  const handleSaveAndIssue = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true });
    setIssuedRecords((p) => [
      ...p,
      {
        id: `ISS-${Date.now()}`,
        flightType: issueFlightType,
        issuedBy: DEFAULT_ISSUED_BY,
        issuedAt: `${dateStr}, ${timeStr}`,
        paxCount: PAX_96H,
        medicine: [...categoryItems.medicine],
        tissue: [...categoryItems.tissue],
        cutlery: [...categoryItems.cutlery],
        other: [...categoryItems.other],
      },
    ]);
    toast.success(`Amenities issued for ${issueFlightType} flights.`);
    setNewIssueOpen(false);
    resetForm();
  };

  // ── Edit helpers ──
  const openEdit = (rec: IssuedRecord) => {
    setEditRecord(rec);
    setEditFlightType(rec.flightType);
    setEditItems({ medicine: [...rec.medicine], tissue: [...rec.tissue], cutlery: [...rec.cutlery], other: [...rec.other] });
    setEditPendingName({ ...EMPTY_STR });
    setEditPendingAmount({ ...EMPTY_AMT });
  };

  const addEditItem = (cat: CategoryKey) => {
    if (!editPendingName[cat]) { toast.error("Select or enter an item."); return; }
    if (!editPendingAmount[cat] || Number(editPendingAmount[cat]) <= 0) { toast.error("Enter a valid amount."); return; }
    setEditItems((p) => ({ ...p, [cat]: [...p[cat], { name: editPendingName[cat], amount: Number(editPendingAmount[cat]) }] }));
    setEditPendingName((p) => ({ ...p, [cat]: "" }));
    setEditPendingAmount((p) => ({ ...p, [cat]: "" }));
  };

  const removeEditItem = (cat: CategoryKey, idx: number) =>
    setEditItems((p) => ({ ...p, [cat]: p[cat].filter((_, i) => i !== idx) }));

  const handleSaveEdit = () => {
    if (!editRecord) return;
    setIssuedRecords((p) =>
      p.map((r) =>
        r.id === editRecord.id
          ? { ...r, flightType: editFlightType, medicine: [...editItems.medicine], tissue: [...editItems.tissue], cutlery: [...editItems.cutlery], other: [...editItems.other] }
          : r
      )
    );
    toast.success("Issue record updated.");
    setEditRecord(null);
  };

  const lastIssued = issuedRecords.length > 0 ? issuedRecords[issuedRecords.length - 1] : null;

  // ── Wizard render helpers ──
  const renderPreview = () => (
    <div className="space-y-3">
      <div className="rounded-lg bg-muted/40 border border-border px-3 py-2.5 text-xs space-y-1">
        <div><span className="text-muted-foreground">Flight Type:</span> <strong>{issueFlightType}</strong></div>
        <div><span className="text-muted-foreground">Passengers:</span> <strong>{PAX_96H.toLocaleString()}</strong></div>
      </div>
      {CATS.map((cat) => {
        const items = categoryItems[cat];
        if (!items.length) return null;
        const meta = CATEGORY_META[cat];
        const Icon = meta.icon;
        return (
          <div key={cat} className={`rounded-lg border p-3 space-y-1.5 ${meta.bg}`}>
            <div className={`text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 ${meta.color}`}>
              <Icon className="h-3.5 w-3.5" /> {meta.label} — {catTotal(items)} units total
            </div>
            {items.map((item, i) => (
              <div key={i} className="flex justify-between bg-white rounded-md px-2.5 py-1.5 text-xs border border-border">
                <span className="font-medium text-slate-700">{item.name}</span>
                <span className="font-bold text-slate-800">{item.amount} units</span>
              </div>
            ))}
          </div>
        );
      })}
      {CATS.every((c) => !categoryItems[c].length) && (
        <div className="text-sm text-muted-foreground text-center py-6">No items added yet. Go back to add items.</div>
      )}
    </div>
  );

  const renderStepContent = () => {
    if (wizardStep === 0) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-200">
            <div>
              <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide">96-Hour Prior Flight Passengers</div>
              <div className="text-3xl font-bold text-blue-800 mt-0.5">{PAX_96H.toLocaleString()}</div>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-blue-500">
              <Boxes className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold">Flight Type</Label>
            <div className="flex gap-4 mt-2">
              {["Domestic", "International", "Both"].map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="issueFlightType" value={type} checked={issueFlightType === type}
                    onChange={(e) => setIssueFlightType(e.target.value)} className="h-4 w-4 accent-primary" />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>
          {lastIssued && (
            <div className="border-t border-dashed border-border pt-3 mt-2">
              <p className="text-xs text-center text-muted-foreground">
                Last Issued by{" "}
                <span className="font-semibold text-slate-700">{lastIssued.issuedBy}</span>{" "}
                on <span className="font-semibold text-slate-700">{lastIssued.issuedAt}</span>
              </p>
            </div>
          )}
        </div>
      );
    }
    if (wizardStep >= 1 && wizardStep <= TOTAL_CAT_STEPS) {
      const cat = CATS[wizardStep - 1];
      return (
        <CategorySection
          cat={cat}
          items={categoryItems[cat]}
          pendingName={pendingName[cat]}
          pendingAmount={pendingAmount[cat]}
          onAdd={() => addItem(cat)}
          onRemove={(i) => removeItem(cat, i)}
          onNameChange={(v) => setPendingName((p) => ({ ...p, [cat]: v }))}
          onAmountChange={(v) => setPendingAmount((p) => ({ ...p, [cat]: v }))}
          skipHint
        />
      );
    }
    if (wizardStep === 5) return renderPreview();
    return null;
  };

  const renderFooter = () => {
    if (wizardStep === 0) return (
      <>
        <Button variant="outline" onClick={() => { setNewIssueOpen(false); resetForm(); }}>Cancel</Button>
        <Button onClick={handleNext}>Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
      </>
    );
    if (wizardStep >= 1 && wizardStep <= 3) return (
      <>
        <Button variant="outline" onClick={() => setWizardStep((s) => s - 1)}><ChevronLeft className="h-4 w-4 mr-1" /> Go Back</Button>
        <Button onClick={handleNext}>Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
      </>
    );
    if (wizardStep === 4) return (
      <>
        <Button variant="outline" onClick={() => setWizardStep((s) => s - 1)}><ChevronLeft className="h-4 w-4 mr-1" /> Go Back</Button>
        <Button variant="outline" onClick={() => setWizardStep(5)}>Preview</Button>
        <Button onClick={handleSaveAndIssue}>Save and Issue</Button>
      </>
    );
    if (wizardStep === 5) return (
      <>
        <Button variant="outline" onClick={() => setWizardStep((s) => s - 1)}><ChevronLeft className="h-4 w-4 mr-1" /> Go Back</Button>
        <Button onClick={handleSaveAndIssue}>Save and Issue</Button>
      </>
    );
    return null;
  };

  const stepLabel = () => {
    if (wizardStep === 0) return "New Amenities Issue";
    if (wizardStep === 5) return "Preview — All Items";
    const cat = CATS[wizardStep - 1];
    return `${CATEGORY_META[cat].label} Items — Step ${wizardStep} of ${TOTAL_CAT_STEPS}`;
  };

  return (
    <>
      <PageHeader
        title="Amenities"
        subtitle="Onboard non-food consumables — medicine kits, tissue & cutlery sets"
        actions={
          <Button onClick={() => setNewIssueOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> New Issue
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard label="SKU Count" value={amenitiesMedicine.length + amenitiesTissue.length + amenitiesCutlery.length} icon={Boxes} tone="navy" />
        <KpiCard label="Medicine SKUs" value={amenitiesMedicine.length} icon={Pill} tone="red" />
        <KpiCard label="Tissue SKUs" value={amenitiesTissue.length} icon={Scroll} tone="warning" />
        <KpiCard label="Cutlery SKUs" value={amenitiesCutlery.length} icon={Utensils} tone="success" />
      </div>

      {/* Issued Records */}
      {issuedRecords.length > 0 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Issued Records</div>
            <div className="text-[11px] text-emerald-600">{issuedRecords.length} issue(s)</div>
          </div>
          <div className="space-y-2.5">
            {issuedRecords.map((rec) => {
              const medTot = catTotal(rec.medicine);
              const tisTot = catTotal(rec.tissue);
              const cutTot = catTotal(rec.cutlery);
              const othTot = catTotal(rec.other);
              return (
                <div key={rec.id} className="bg-white rounded-lg border border-emerald-100 px-4 py-3">
                  <div className="flex items-center justify-between mb-2.5">
                    {/* Updated line format */}
                    <div className="text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{rec.flightType}</span>
                      {" · Issued By "}
                      <span className="font-semibold text-slate-700">{rec.issuedBy}</span>
                      {", "}{rec.issuedAt}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={() => openEdit(rec)}>
                        <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={() => setViewRecord(rec)}>
                        <Eye className="h-3.5 w-3.5 mr-1" /> View
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                    {medTot > 0 && (
                      <div className="flex items-center gap-1.5 text-sm">
                        <Pill className="h-3.5 w-3.5 text-red-500" />
                        <span className="text-slate-700">Medicines: <strong>{medTot} units</strong></span>
                        <Button size="sm" variant="outline" className="h-5 text-[11px] px-1.5 ml-0.5"
                          onClick={() => setViewCategory({ label: "Medicine", items: rec.medicine })}>View</Button>
                      </div>
                    )}
                    {tisTot > 0 && (
                      <div className="flex items-center gap-1.5 text-sm">
                        <Scroll className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-slate-700">Tissues: <strong>{tisTot} units</strong></span>
                        <Button size="sm" variant="outline" className="h-5 text-[11px] px-1.5 ml-0.5"
                          onClick={() => setViewCategory({ label: "Tissue", items: rec.tissue })}>View</Button>
                      </div>
                    )}
                    {cutTot > 0 && (
                      <div className="flex items-center gap-1.5 text-sm">
                        <Utensils className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-slate-700">Cutleries: <strong>{cutTot} units</strong></span>
                        <Button size="sm" variant="outline" className="h-5 text-[11px] px-1.5 ml-0.5"
                          onClick={() => setViewCategory({ label: "Cutlery", items: rec.cutlery })}>View</Button>
                      </div>
                    )}
                    {othTot > 0 && (
                      <div className="flex items-center gap-1.5 text-sm">
                        <Package className="h-3.5 w-3.5 text-blue-500" />
                        <span className="text-slate-700">Others: <strong>{othTot} units</strong></span>
                        <Button size="sm" variant="outline" className="h-5 text-[11px] px-1.5 ml-0.5"
                          onClick={() => setViewCategory({ label: "Other", items: rec.other })}>View</Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Inventory Tabs */}
      <Tabs defaultValue="medicine">
        <TabsList>
          <TabsTrigger value="medicine"><Pill className="h-4 w-4 mr-1" /> Medicine</TabsTrigger>
          <TabsTrigger value="tissue"><Scroll className="h-4 w-4 mr-1" /> Tissue</TabsTrigger>
          <TabsTrigger value="cutlery"><Utensils className="h-4 w-4 mr-1" /> Cutleries</TabsTrigger>
          <TabsTrigger value="other"><Package className="h-4 w-4 mr-1" /> Other</TabsTrigger>
        </TabsList>
        <TabsContent value="medicine" className="mt-4">{inventoryTable(amenitiesMedicine, { key: "brand", header: "Brand" })}</TabsContent>
        <TabsContent value="tissue" className="mt-4">{inventoryTable(amenitiesTissue)}</TabsContent>
        <TabsContent value="cutlery" className="mt-4">{inventoryTable(amenitiesCutlery)}</TabsContent>
        <TabsContent value="other" className="mt-4">
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground text-sm">
            No other amenity items in inventory. Items added via New Issue will appear here.
          </div>
        </TabsContent>
      </Tabs>

      {/* ── New Issue Wizard Modal ── */}
      <Dialog open={newIssueOpen} onOpenChange={(open) => { setNewIssueOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b shrink-0">
            <DialogTitle className="text-base font-semibold">{stepLabel()}</DialogTitle>
            {wizardStep >= 1 && wizardStep <= TOTAL_CAT_STEPS && (
              <div className="flex items-center gap-1 mt-2">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className={`h-1.5 rounded-full transition-all ${s <= wizardStep ? "bg-primary w-8" : "bg-muted w-4"}`} />
                ))}
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4">{renderStepContent()}</div>
          <div className="px-6 py-4 border-t shrink-0 flex justify-end gap-2">{renderFooter()}</div>
        </DialogContent>
      </Dialog>

      {/* ── Edit Issue Dialog ── */}
      <Dialog open={!!editRecord} onOpenChange={(v) => !v && setEditRecord(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b shrink-0">
            <DialogTitle className="text-base font-semibold">Edit Issue — {editRecord?.id}</DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Originally issued by {editRecord?.issuedBy}, {editRecord?.issuedAt}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Flight Type */}
            <div>
              <Label className="text-sm font-semibold">Flight Type</Label>
              <div className="flex gap-4 mt-2">
                {["Domestic", "International", "Both"].map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="editFlightType" value={type} checked={editFlightType === type}
                      onChange={(e) => setEditFlightType(e.target.value)} className="h-4 w-4 accent-primary" />
                    <span className="text-sm">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* All 4 categories editable */}
            {CATS.map((cat) => (
              <CategorySection
                key={cat}
                cat={cat}
                items={editItems[cat]}
                pendingName={editPendingName[cat]}
                pendingAmount={editPendingAmount[cat]}
                onAdd={() => addEditItem(cat)}
                onRemove={(i) => removeEditItem(cat, i)}
                onNameChange={(v) => setEditPendingName((p) => ({ ...p, [cat]: v }))}
                onAmountChange={(v) => setEditPendingAmount((p) => ({ ...p, [cat]: v }))}
              />
            ))}
          </div>
          <div className="px-6 py-4 border-t shrink-0 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditRecord(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── View Record Summary Modal ── */}
      <Dialog open={!!viewRecord} onOpenChange={(v) => !v && setViewRecord(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Issue Record</DialogTitle>
          </DialogHeader>
          {viewRecord && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-xs space-y-1">
                <div><span className="text-muted-foreground">Flight Type:</span> <strong>{viewRecord.flightType}</strong></div>
                <div><span className="text-muted-foreground">Issued By:</span> <strong>{viewRecord.issuedBy}</strong></div>
                <div><span className="text-muted-foreground">Date & Time:</span> {viewRecord.issuedAt}</div>
                <div><span className="text-muted-foreground">Passengers:</span> {viewRecord.paxCount.toLocaleString()}</div>
              </div>
              <div className="space-y-2">
                {CATS.map((cat) => {
                  const items = viewRecord[cat];
                  if (!items.length) return null;
                  const meta = CATEGORY_META[cat];
                  const Icon = meta.icon;
                  const tot = catTotal(items);
                  return (
                    <div key={cat} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Icon className={`h-4 w-4 ${meta.color}`} />
                        <span className="text-slate-700">{meta.label}s: <strong>{tot} units</strong></span>
                      </div>
                      <Button size="sm" variant="outline" className="h-6 text-xs px-2"
                        onClick={() => { setViewRecord(null); setViewCategory({ label: meta.label, items }); }}>
                        View
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewRecord(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── View Category Items Modal ── */}
      <Dialog open={!!viewCategory} onOpenChange={(v) => !v && setViewCategory(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{viewCategory?.label} — Item Breakdown</DialogTitle>
          </DialogHeader>
          {viewCategory && (
            <div className="space-y-2">
              {viewCategory.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-muted/30">
                  <span className="text-sm font-medium text-slate-700">{item.name}</span>
                  <span className="text-sm font-bold text-slate-800">{item.amount} units</span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-border pt-2 px-3">
                <span className="text-sm font-semibold">Total</span>
                <span className="text-sm font-bold text-slate-800">{catTotal(viewCategory.items)} units</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewCategory(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

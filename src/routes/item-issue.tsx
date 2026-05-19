import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useRef } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { KpiCard } from "@/components/common/KpiCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus, PackageCheck, Clock, CheckCircle2, Send, Search, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { inventory } from "@/lib/sample-data";
import { useWorkflow, type WfTransferNote, type WfDemandRequest } from "@/lib/workflow-store";
import { useRole } from "@/lib/roles";

export const Route = createFileRoute("/item-issue")({
  head: () => ({ meta: [{ title: "Item Issue" }] }),
  component: ItemIssuePage,
  validateSearch: (search: Record<string, unknown>) => ({
    demand: typeof search.demand === "string" ? search.demand : undefined,
  }),
});

const KITCHEN_SECTIONS = [
  "Hot Kitchen", "Cold Kitchen", "Veg Section", "Special Meal", "Bakery", "Packaging",
];

type IssueItem = { id: string; name: string; qty: number; uom: string };

function ItemIssuePage() {
  const { transferNotes, addTransferNote, acknowledgeTransfer, demands, updateDemandStatus } = useWorkflow();
  const { role } = useRole();
  const navigate = useNavigate();
  const { demand: demandParam } = Route.useSearch();

  const [selected, setSelected] = useState<WfTransferNote | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [preselectedDemand, setPreselectedDemand] = useState("");

  // Auto-open the create dialog when arriving with ?demand=<id>
  const consumedParam = useRef(false);
  useEffect(() => {
    if (demandParam && !consumedParam.current) {
      consumedParam.current = true;
      setPreselectedDemand(demandParam);
      setCreateOpen(true);
      navigate({ to: "/item-issue", search: { demand: undefined }, replace: true });
    }
  }, [demandParam, navigate]);

  const pendingDemands = useMemo(
    () =>
      demands.filter(
        (d) =>
          d.status === "Pending Store Review" ||
          d.status === "Partially Available" ||
          d.status === "Partially Issued",
      ),
    [demands],
  );

  const openIssueForDemand = (id: string) => {
    setPreselectedDemand(id);
    setCreateOpen(true);
  };

  const openIssueDirect = () => {
    setPreselectedDemand("");
    setCreateOpen(true);
  };

  const totalCount = transferNotes.length;
  const pendingCount = useMemo(
    () => transferNotes.filter(t => t.status === "Pending").length,
    [transferNotes],
  );
  const ackCount = totalCount - pendingCount;

  const cols: Column<WfTransferNote>[] = [
    { key: "id", header: "TN #" },
    {
      key: "demandRef", header: "Demand Ref",
      render: (t) => {
        const linked = demands.find((d) => d.id === t.demandRef);
        if (!linked) return <span className="text-muted-foreground">{t.demandRef}</span>;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{linked.id}</span>
            <span className="text-[10px] text-muted-foreground">{linked.status}</span>
          </div>
        );
      },
    },
    { key: "from", header: "From" },
    { key: "to",   header: "To" },
    {
      key: "items", header: "Items", className: "text-right",
      render: (t) => <span>{t.items.length}</span>,
    },
    { key: "issuedBy", header: "Issued By" },
    { key: "date",     header: "Date" },
    { key: "status",   header: "Status", render: (t) => <StatusBadge status={t.status} /> },
  ];

  const handleAcknowledge = (id: string) => {
    acknowledgeTransfer(id);
    setSelected(prev => prev && prev.id === id ? { ...prev, status: "Issued" } : prev);
    toast.success(`${id} marked as Issued.`);
  };

  const handleIssue = (data: {
    toSection: string;
    issuedBy: string;
    demandRef: string;
    items: IssueItem[];
  }) => {
    const tn: WfTransferNote = {
      id: `TN-${Date.now().toString().slice(-5)}`,
      demandRef: data.demandRef.trim() || "Direct Issue",
      grnRef: "Direct from Store",
      items: data.items,
      from: "Store",
      to: data.toSection,
      issuedBy: data.issuedBy.trim(),
      date: new Date().toLocaleString(),
      status: "Pending",
    };
    addTransferNote(tn);

    // Connect to the demand: move it forward in its workflow
    let demandUpdate = "";
    const linkedDemand = data.demandRef
      ? demands.find((d) => d.id === data.demandRef)
      : null;
    if (linkedDemand) {
      const fullyCovered = linkedDemand.items.every((reqItem) => {
        const issued = data.items.find((i) => i.id === reqItem.id);
        return !!issued && issued.qty >= reqItem.qty;
      });
      const anyPartial = linkedDemand.items.some((reqItem) => {
        const issued = data.items.find((i) => i.id === reqItem.id);
        return !!issued && issued.qty > 0 && issued.qty < reqItem.qty;
      });
      const someMissing = linkedDemand.items.some(
        (reqItem) => !data.items.find((i) => i.id === reqItem.id && i.qty >= reqItem.qty),
      );

      if (fullyCovered) {
        updateDemandStatus(linkedDemand.id, "Fulfilled");
        demandUpdate = ` · ${linkedDemand.id} marked Fulfilled`;
      } else if (anyPartial || someMissing) {
        updateDemandStatus(linkedDemand.id, "Partially Issued");
        demandUpdate = ` · ${linkedDemand.id} marked Partially Issued`;
      }
    }

    setCreateOpen(false);
    toast.success(
      `Item Issue ${tn.id} created — ${data.items.length} item${data.items.length > 1 ? "s" : ""} to ${data.toSection}${demandUpdate}.`,
    );
  };

  return (
    <>
      <PageHeader
        title="Item Issue"
        subtitle="Issue items from store to kitchen sections and track acknowledgment"
        actions={
          <Button onClick={openIssueDirect}>
            <Plus className="h-4 w-4 mr-1" /> New Issue
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard label="Total Issues"           value={totalCount}   icon={PackageCheck} tone="navy"    />
        <KpiCard label="Pending" value={pendingCount} icon={Clock}        tone="warning" />
        <KpiCard label="Issued"  value={ackCount}     icon={CheckCircle2} tone="success" />
      </div>

      {pendingDemands.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Pending Demands{" "}
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                ({pendingDemands.length} awaiting issuance)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="border border-border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider">Demand #</th>
                    <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider">Date</th>
                    <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider">Requested By</th>
                    <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider">From</th>
                    <th className="text-right px-3 py-2 text-[10px] uppercase tracking-wider">Items</th>
                    <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2 w-32" />
                  </tr>
                </thead>
                <tbody>
                  {pendingDemands.map((d) => (
                    <tr key={d.id} className="border-t border-border hover:bg-muted/20">
                      <td className="px-3 py-2 font-medium font-mono text-xs">{d.id}</td>
                      <td className="px-3 py-2">{d.date}</td>
                      <td className="px-3 py-2">{d.requestedBy}</td>
                      <td className="px-3 py-2 text-muted-foreground">{d.role}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{d.items.length}</td>
                      <td className="px-3 py-2"><StatusBadge status={d.status} /></td>
                      <td className="px-3 py-2 text-right">
                        <Button
                          size="sm"
                          onClick={() => openIssueForDemand(d.id)}
                          className="h-7 px-3 text-xs"
                        >
                          <Send className="h-3 w-3 mr-1" /> Issue Items
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <DataTable
        title="item-issue"
        data={transferNotes}
        columns={cols}
        searchKeys={["id", "demandRef", "to", "issuedBy", "status"]}
        selectable={false}
        actions={(t) => (
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2.5 text-xs"
            onClick={() => setSelected(t)}
          >
            View
          </Button>
        )}
      />

      <IssueDetailsDialog
        note={selected}
        onClose={() => setSelected(null)}
        onAcknowledge={handleAcknowledge}
      />

      <CreateIssueDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultIssuedBy={role}
        defaultDemandId={preselectedDemand}
        demands={demands}
        onCreate={handleIssue}
      />
    </>
  );
}

function IssueDetailsDialog({
  note, onClose, onAcknowledge,
}: {
  note: WfTransferNote | null;
  onClose: () => void;
  onAcknowledge: (id: string) => void;
}) {
  return (
    <Dialog open={!!note} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Item Issue
            {note && <span className="font-mono text-sm text-muted-foreground ml-2">— {note.id}</span>}
          </DialogTitle>
        </DialogHeader>

        {note && (
          <div className="space-y-4 mt-1">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 text-sm">
              <Field label="From" value={note.from} />
              <Field label="To"   value={note.to} bold />
              <Field label="Issued By" value={note.issuedBy} />
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Status</div>
                <div className="mt-1"><StatusBadge status={note.status} /></div>
              </div>
              <Field label="Demand Ref" value={note.demandRef} />
              <Field label="GRN Ref"    value={note.grnRef} />
              <Field label="Date"       value={note.date} />
              <Field label="Items"      value={note.items.length.toString()} />
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                Items to Transfer
              </div>
              <div className="border border-border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider w-12">SL</th>
                      <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider">Item</th>
                      <th className="text-right px-3 py-2 text-[10px] uppercase tracking-wider w-32">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {note.items.map((it, i) => (
                      <tr key={it.id} className="border-t border-border">
                        <td className="px-3 py-2">{i + 1}</td>
                        <td className="px-3 py-2 font-medium">{it.name}</td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {it.qty} <span className="text-[11px] text-muted-foreground">{it.uom}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="mt-4 flex-wrap gap-2">
          {note?.status === "Pending" && (
            <Button onClick={() => onAcknowledge(note.id)}>
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Mark as Issued
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateIssueDialog({
  open, onOpenChange, defaultIssuedBy, defaultDemandId, demands, onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultIssuedBy: string;
  defaultDemandId: string;
  demands: WfDemandRequest[];
  onCreate: (data: {
    toSection: string;
    issuedBy: string;
    demandRef: string;
    items: IssueItem[];
  }) => void;
}) {
  const [toSection, setToSection] = useState<string>(KITCHEN_SECTIONS[0]);
  const [issuedBy, setIssuedBy] = useState<string>(defaultIssuedBy);
  const [demandId, setDemandId] = useState(defaultDemandId);
  const [search, setSearch] = useState("");
  const [issuedMap, setIssuedMap] = useState<Record<string, string>>({});

  // Direct-issue add-line state
  const [addItemId, setAddItemId] = useState("");
  const [addItemQty, setAddItemQty] = useState("");
  const [manualIds, setManualIds] = useState<string[]>([]);

  const isDirect = !demandId;

  // Sync demandId with the pre-selection whenever the dialog opens
  useEffect(() => {
    if (open) setDemandId(defaultDemandId);
  }, [open, defaultDemandId]);

  useEffect(() => {
    if (!open) {
      setToSection(KITCHEN_SECTIONS[0]);
      setIssuedBy(defaultIssuedBy);
      setDemandId("");
      setSearch("");
      setIssuedMap({});
      setAddItemId("");
      setAddItemQty("");
      setManualIds([]);
    }
  }, [open, defaultIssuedBy]);

  // Reset entered amounts when the mode/demand changes
  useEffect(() => {
    setIssuedMap({});
    setManualIds([]);
    setAddItemId("");
    setAddItemQty("");
    setSearch("");
  }, [demandId]);

  const selectedDemand = useMemo(
    () => demands.find((d) => d.id === demandId) ?? null,
    [demands, demandId],
  );

  const requestedFor = (itemId: string): number =>
    selectedDemand?.items.find((i) => i.id === itemId)?.qty ?? 0;

  const setIssued = (id: string, value: string) => {
    setIssuedMap((prev) => ({ ...prev, [id]: value }));
  };

  // Rows shown in the table — depends on mode
  const visibleItems = useMemo(() => {
    let pool;
    if (selectedDemand) {
      pool = selectedDemand.items
        .map((it) => inventory.find((inv) => inv.id === it.id))
        .filter((x): x is (typeof inventory)[number] => !!x);
    } else {
      pool = manualIds
        .map((id) => inventory.find((inv) => inv.id === id))
        .filter((x): x is (typeof inventory)[number] => !!x);
    }
    if (!search.trim()) return pool;
    const q = search.toLowerCase();
    return pool.filter((i) => i.id.toLowerCase().includes(q) || i.name.toLowerCase().includes(q));
  }, [selectedDemand, manualIds, search]);

  const addManualLine = () => {
    const inv = inventory.find((i) => i.id === addItemId);
    if (!inv) { toast.error("Select an item."); return; }
    if (manualIds.includes(inv.id)) { toast.error(`${inv.name} is already added.`); return; }
    const qty = Number(addItemQty);
    if (!qty || qty <= 0) { toast.error("Quantity must be greater than zero."); return; }
    setManualIds((prev) => [...prev, inv.id]);
    setIssuedMap((prev) => ({ ...prev, [inv.id]: String(qty) }));
    setAddItemId("");
    setAddItemQty("");
  };

  const removeManualLine = (id: string) => {
    setManualIds((prev) => prev.filter((x) => x !== id));
    setIssuedMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const summary = useMemo(() => {
    let issuedItems = 0;
    let totalIssued = 0;
    let totalRemaining = 0;
    const ids = selectedDemand
      ? selectedDemand.items.map((i) => i.id)
      : manualIds;
    for (const id of ids) {
      const req = requestedFor(id);
      const iss = Number(issuedMap[id]) || 0;
      if (iss > 0) issuedItems += 1;
      totalIssued += iss;
      totalRemaining += Math.max(0, req - iss);
    }
    return { issuedItems, totalIssued, totalRemaining };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issuedMap, selectedDemand, manualIds]);

  const handleSubmit = () => {
    if (!issuedBy.trim()) { toast.error("Issued By is required."); return; }
    const idsInScope = selectedDemand
      ? selectedDemand.items.map((i) => i.id)
      : manualIds;
    const items: IssueItem[] = idsInScope
      .filter((id) => Number(issuedMap[id] ?? 0) > 0)
      .map((id) => {
        const inv = inventory.find((i) => i.id === id)!;
        return { id: inv.id, name: inv.name, qty: Number(issuedMap[id]), uom: inv.uom };
      });
    if (items.length === 0) {
      toast.error(isDirect
        ? "Add at least one item, then enter Issued Qty > 0."
        : "Enter Issued Qty > 0 on at least one item.",
      );
      return;
    }
    onCreate({ toSection, issuedBy, demandRef: demandId, items });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle>New Item Issue</DialogTitle>
        </DialogHeader>

        <div className="px-6 pt-5 pb-3 space-y-4 border-b border-border bg-muted/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>To (Kitchen Section) <span className="text-destructive">*</span></Label>
              <select
                value={toSection}
                onChange={(e) => setToSection(e.target.value)}
                className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {KITCHEN_SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <Label>Issued By <span className="text-destructive">*</span></Label>
              <Input
                value={issuedBy}
                onChange={(e) => setIssuedBy(e.target.value)}
                placeholder="Name"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Demand Reference</Label>
              <select
                value={demandId}
                onChange={(e) => setDemandId(e.target.value)}
                className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Direct Issue (no demand)</option>
                {demands
                  .filter((d) => d.status !== "Fulfilled" && d.status !== "Escalated to Supply Chain")
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.id} — {d.requestedBy} · {d.status} ({d.items.length} item{d.items.length > 1 ? "s" : ""})
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        <div className="px-6 pt-4 pb-3 border-b border-border space-y-3">
          {isDirect ? (
            <div className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-7">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Add Item
                </Label>
                <select
                  value={addItemId}
                  onChange={(e) => setAddItemId(e.target.value)}
                  className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select item...</option>
                  {inventory
                    .filter((i) => !manualIds.includes(i.id))
                    .map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.id} — {i.name} ({i.uom})
                      </option>
                    ))}
                </select>
              </div>
              <div className="col-span-3">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Qty
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={addItemQty}
                  onChange={(e) => setAddItemQty(e.target.value)}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Button variant="outline" onClick={addManualLine} className="w-full">
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search items..."
                className="pl-9 h-9"
              />
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            {summary.issuedItems} item{summary.issuedItems !== 1 ? "s" : ""} ready · Issued total <span className="font-semibold text-foreground tabular-nums">{summary.totalIssued}</span> · Remaining <span className="font-semibold text-foreground tabular-nums">{summary.totalRemaining}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 sticky top-0 z-10">
              <tr>
                <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider w-12">SL</th>
                <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider">Item</th>
                <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider w-16">UoM</th>
                <th className="text-right px-3 py-2 text-[10px] uppercase tracking-wider w-24">Stock</th>
                <th className="text-right px-3 py-2 text-[10px] uppercase tracking-wider w-28">Requested</th>
                <th className="text-right px-3 py-2 text-[10px] uppercase tracking-wider w-28">Issued</th>
                <th className="text-right px-3 py-2 text-[10px] uppercase tracking-wider w-28">Remaining</th>
                {isDirect && <th className="px-3 py-2 w-12" />}
              </tr>
            </thead>
            <tbody>
              {visibleItems.length === 0 ? (
                <tr>
                  <td colSpan={isDirect ? 8 : 7} className="text-center text-xs text-muted-foreground py-8">
                    {isDirect
                      ? "No items added yet — use the Add Item picker above."
                      : selectedDemand
                        ? "No items match the search."
                        : "Select a demand reference to load items."}
                  </td>
                </tr>
              ) : (
                visibleItems.map((inv, i) => {
                  const reqN = requestedFor(inv.id);
                  const issN = Number(issuedMap[inv.id]) || 0;
                  const remaining = Math.max(0, reqN - issN);
                  const over = issN > reqN && reqN > 0;
                  const lowStock = issN > 0 && issN > inv.stock;
                  const inDemand = reqN > 0;
                  return (
                    <tr key={inv.id} className={"border-t border-border hover:bg-muted/20" + (inDemand ? " bg-primary/[0.03]" : "")}>
                      <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                      <td className="px-3 py-2">
                        <div className="font-medium">{inv.name}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">{inv.id}</div>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{inv.uom}</td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        <span className={lowStock ? "text-destructive font-semibold" : ""}>
                          {inv.stock}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        <span className={inDemand ? "font-semibold text-foreground" : "text-muted-foreground"}>
                          {inDemand ? reqN : "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Input
                          type="number"
                          min={0}
                          value={issuedMap[inv.id] ?? ""}
                          onChange={(e) => setIssued(inv.id, e.target.value)}
                          placeholder="0"
                          className={"h-8 text-right tabular-nums" + (over ? " border-destructive" : "")}
                        />
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        <span className={over ? "text-destructive font-semibold" : remaining > 0 ? "text-warning" : "text-muted-foreground"}>
                          {over ? `+${issN - reqN}` : remaining}
                        </span>
                      </td>
                      {isDirect && (
                        <td className="px-3 py-2 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => removeManualLine(inv.id)}
                            aria-label={`Remove ${inv.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>
            <Send className="h-4 w-4 mr-1.5" /> Issue Items
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={"mt-1 text-sm text-foreground" + (bold ? " font-semibold" : "")}>
        {value}
      </div>
    </div>
  );
}

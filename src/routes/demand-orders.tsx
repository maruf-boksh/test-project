import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus, FileText, Clock, Send, ShoppingCart, AlertTriangle,
  CheckCircle2, ArrowUpRight, PackageCheck,
} from "lucide-react";
import { inventory, vendors } from "@/lib/sample-data";
import { KpiCard } from "@/components/common/KpiCard";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useWorkflow, type WfDemandRequest, type WfDemandStatus, type WfTransferNote } from "@/lib/workflow-store";
import { useRole } from "@/lib/roles";

export const Route = createFileRoute("/demand-orders")({
  head: () => ({ meta: [{ title: "Demand Requests" }] }),
  component: DemandOrders,
});

const KITCHEN_SECTIONS = ["Hot Kitchen", "Cold Kitchen", "Veg Section", "Special Meal", "Bakery", "Packaging"];

function DemandOrders() {
  const { role } = useRole();
  const wf = useWorkflow();
  const {
    demands, addDemands, updateDemandStatus,
    addRequisition, transferNotes, addTransferNote, grns,
  } = wf;

  const [selectedRequest, setSelectedRequest] = useState<WfDemandRequest | null>(null);
  const [needsPurchase, setNeedsPurchase] = useState<Record<string, boolean>>({});
  const [newOpen, setNewOpen] = useState(false);
  const [newRef, setNewRef] = useState("");
  const [newBy, setNewBy] = useState("");
  const [newNote, setNewNote] = useState("");

  // Transfer Note form state
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferTo, setTransferTo] = useState("Hot Kitchen");
  const [transferIssuedBy, setTransferIssuedBy] = useState<string>(role);

  // Derived counts
  const pending = useMemo(() => demands.filter(r => r.status === "Pending Store Review").length, [demands]);
  const escalated = useMemo(() => demands.filter(r => r.status === "Escalated to Supply Chain").length, [demands]);
  const fulfilled = useMemo(() => demands.filter(r => r.status === "Fulfilled").length, [demands]);

  const requestCols: Column<WfDemandRequest>[] = [
    { key: "id", header: "Request #" },
    { key: "reference", header: "Ref (PRD)" },
    { key: "requestedBy", header: "Requested By" },
    { key: "role", header: "From" },
    { key: "date", header: "Date" },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "items", header: "Items", render: (r) => r.items.length },
  ];

  // ── Step 2a: Fulfill directly from Store stock ──────────────────────────────
  const fulfillFromStore = () => {
    if (!selectedRequest) return;
    updateDemandStatus(selectedRequest.id, "Fulfilled");
    setSelectedRequest(prev => prev ? { ...prev, status: "Fulfilled" } : prev);
    toast.success(`Demand ${selectedRequest.id} fulfilled from Store stock.`);
  };

  // ── Step 2b: Escalate to Supply Chain → auto-create Requisition ─────────────
  const escalateToSupplyChain = () => {
    if (!selectedRequest) return;
    const reqId = `REQ-${Date.now().toString().slice(-5)}`;
    addRequisition({
      id: reqId,
      reference: selectedRequest.id,
      requestedBy: role,
      source: "Store",
      date: new Date().toLocaleString(),
      status: "Pending Accounts",
      items: selectedRequest.items.length,
      note: `Escalated from kitchen demand ${selectedRequest.id} — store stock insufficient. Items flagged for purchase.`,
      demandRef: selectedRequest.id,
      demandItems: selectedRequest.items,
    });
    updateDemandStatus(selectedRequest.id, "Escalated to Supply Chain");
    setSelectedRequest(prev => prev ? { ...prev, status: "Escalated to Supply Chain" } : prev);
    toast.success(`Demand ${selectedRequest.id} escalated → Requisition ${reqId} created in Supply Chain.`);
  };

  // ── Step 7: Issue Transfer Note ─────────────────────────────────────────────
  const issueTransferNote = () => {
    if (!selectedRequest) return;
    // Find the GRN linked to this demand (via grnRef or most recent GRN)
    const grnRef = selectedRequest.grnRef ?? grns[0]?.id ?? "Direct from Store";
    const tnId = `TN-${Date.now().toString().slice(-5)}`;
    const tn: WfTransferNote = {
      id: tnId,
      demandRef: selectedRequest.id,
      grnRef,
      items: selectedRequest.items.map(i => ({ id: i.id, name: i.name, qty: i.qty, uom: i.uom })),
      from: "Store",
      to: transferTo,
      issuedBy: transferIssuedBy,
      date: new Date().toLocaleString(),
      status: "Pending Acknowledgment",
    };
    addTransferNote(tn);
    setTransferOpen(false);
    toast.success(`Transfer Note ${tnId} issued to ${transferTo}. Kitchen can now acknowledge.`);
  };

  // ── New Demand dialog ────────────────────────────────────────────────────────
  const handleNewDemand = () => {
    if (!newRef || !newBy) { toast.error("Reference and Requested By are required."); return; }
    const req: WfDemandRequest = {
      id: `DR-${9000 + demands.length + 1}`,
      reference: newRef,
      requestedBy: newBy,
      role: "Store Executive",
      date: new Date().toLocaleString(),
      status: "Pending Store Review",
      items: [],
      note: newNote || "Demand request created from store.",
      source: "Store",
    };
    addDemands([req]);
    setNewOpen(false);
    setNewRef(""); setNewBy(""); setNewNote("");
    toast.success("Demand request created.");
  };

  return (
    <>
      <PageHeader
        title="Demand Requests"
        subtitle="Review incoming material demands from kitchen and production; fulfill or escalate to Supply Chain"
        actions={
          <Button onClick={() => setNewOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> New Demand
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Requests" value={demands.length} icon={FileText} tone="navy" />
        <KpiCard label="Pending Review" value={pending} icon={Clock} tone="warning" />
        <KpiCard label="Escalated to Supply Chain" value={escalated} icon={ArrowUpRight} tone="red" />
        <KpiCard label="Fulfilled" value={fulfilled} icon={PackageCheck} tone="success" />
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle>Demand Requests — Store Review</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
            {/* Table */}
            <div>
              <DataTable
                title="demand-requests"
                data={demands}
                columns={requestCols}
                searchKeys={["id", "reference", "requestedBy", "role", "status"]}
                actions={(row) => (
                  <Button size="sm" onClick={() => { setSelectedRequest(row); setNeedsPurchase({}); }}>
                    Review
                  </Button>
                )}
              />
            </div>

            {/* Review Panel */}
            <div className="space-y-4">
              {selectedRequest ? (
                <Card className="border border-border">
                  {/* Header */}
                  <div className="px-4 pt-4 pb-3 border-b border-border">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-base font-semibold">Request — {selectedRequest.id}</h3>
                      <StatusBadge status={selectedRequest.status} />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Ref: <strong>{selectedRequest.reference}</strong> · By <strong>{selectedRequest.requestedBy}</strong> ({selectedRequest.role}) · {selectedRequest.date}
                    </div>
                    {selectedRequest.note && (
                      <div className="mt-2 text-xs text-muted-foreground bg-muted/60 rounded px-2 py-1.5">
                        {selectedRequest.note}
                      </div>
                    )}
                  </div>

                  {/* Item analysis */}
                  <div className="px-4 pt-3 pb-1">
                    <div className="grid grid-cols-[1fr_80px_80px_80px_32px] gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      <span>Item</span>
                      <span className="text-center">In Stock</span>
                      <span className="text-center">Required</span>
                      <span className="text-center">Shortfall</span>
                      <span />
                    </div>

                    {selectedRequest.items.length > 0 ? (
                      <div className="space-y-2 pb-3">
                        {selectedRequest.items.map(item => {
                          const inv = inventory.find(i => i.id === item.id);
                          const currentStock = inv?.stock ?? 0;
                          const shortfall = item.qty - currentStock;
                          const insufficient = shortfall > 0;
                          const flagged = needsPurchase[item.id] ?? false;
                          return (
                            <div
                              key={item.id}
                              className={`rounded-lg border p-3 ${flagged ? "border-amber-400 bg-amber-50" : insufficient ? "border-red-200 bg-red-50/50" : "border-border bg-muted/40"}`}
                            >
                              <div className="grid grid-cols-[1fr_80px_80px_80px_32px] gap-2 items-center">
                                <div>
                                  <div className="font-semibold text-sm">{item.name}</div>
                                  <div className="text-[11px] text-muted-foreground">{item.type}</div>
                                </div>
                                <div className="text-center">
                                  <span className={`text-sm font-semibold ${insufficient ? "text-red-600" : "text-green-700"}`}>{currentStock}</span>
                                  <div className="text-[10px] text-muted-foreground">{item.uom}</div>
                                </div>
                                <div className="text-center">
                                  <span className="text-sm font-semibold">{item.qty}</span>
                                  <div className="text-[10px] text-muted-foreground">{item.uom}</div>
                                </div>
                                <div className="text-center">
                                  {insufficient ? (
                                    <>
                                      <span className="text-sm font-bold text-red-600">−{shortfall}</span>
                                      <div className="text-[10px] text-red-500">{item.uom} short</div>
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-sm font-bold text-green-600">OK</span>
                                      <div className="text-[10px] text-green-600">sufficient</div>
                                    </>
                                  )}
                                </div>
                                <div className="flex justify-center">
                                  <input
                                    type="checkbox"
                                    title="Mark as purchase required"
                                    checked={flagged}
                                    onChange={(e) => setNeedsPurchase(prev => ({ ...prev, [item.id]: e.target.checked }))}
                                    className="h-4 w-4 accent-amber-500 cursor-pointer"
                                  />
                                </div>
                              </div>
                              {insufficient && (
                                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-red-600">
                                  <AlertTriangle className="h-3 w-3 shrink-0" />
                                  Stock insufficient — {shortfall} {item.uom} must be procured
                                </div>
                              )}
                              {flagged && (
                                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-amber-700 font-medium">
                                  <ShoppingCart className="h-3 w-3 shrink-0" />
                                  Flagged for purchase — will be escalated to Supply Chain
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground py-3">No items attached to this request.</p>
                    )}

                    {/* Legend */}
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground pb-1">
                      <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-amber-400" /> Purchase flagged</span>
                      <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-red-200" /> Insufficient</span>
                      <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-muted border border-border" /> Sufficient</span>
                    </div>
                  </div>

                  {/* Action footer */}
                  <div className="px-4 pb-4 pt-2 border-t border-border space-y-2">
                    {selectedRequest.status === "Pending Store Review" || selectedRequest.status === "Partially Available" ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={fulfillFromStore}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1.5" />
                          Fulfill from Store
                        </Button>
                        <Button
                          className="bg-amber-500 hover:bg-amber-600 text-white"
                          onClick={escalateToSupplyChain}
                        >
                          <ArrowUpRight className="h-4 w-4 mr-1.5" />
                          Escalate to Supply Chain
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          {Object.values(needsPurchase).filter(Boolean).length} item(s) flagged
                        </span>
                      </div>
                    ) : selectedRequest.status === "Escalated to Supply Chain" ? (
                      <div className="flex items-center gap-2 text-xs text-amber-700 font-medium">
                        <Send className="h-3.5 w-3.5" />
                        Escalated — Requisition created in Supply Chain. Awaiting PO and GRN.
                      </div>
                    ) : selectedRequest.status === "Fulfilled" ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-2 text-xs text-green-700 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Fulfilled
                        </div>
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => setTransferOpen(true)}
                        >
                          <PackageCheck className="h-4 w-4 mr-1.5" />
                          Issue Transfer Note
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </Card>
              ) : (
                <div className="rounded-xl border border-border p-6 bg-muted/80 text-sm text-muted-foreground">
                  Select a demand request to review item details and take action.
                </div>
              )}

              {/* Transfer Notes history for selected request */}
              {selectedRequest && transferNotes.filter(t => t.demandRef === selectedRequest.id).length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Transfer Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {transferNotes.filter(t => t.demandRef === selectedRequest.id).map(tn => (
                      <div key={tn.id} className="rounded-lg border border-border p-3 bg-muted/40">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{tn.id}</span>
                          <StatusBadge status={tn.status} />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Store → {tn.to} · Issued by {tn.issuedBy} · {tn.date}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Demand Dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Demand Request</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label>Reference (Flight / PRD Order)</Label>
              <Input value={newRef} onChange={(e) => setNewRef(e.target.value)} placeholder="e.g. PRD-9004 or BS-203" className="mt-1" />
            </div>
            <div>
              <Label>Requested By</Label>
              <Input value={newBy} onChange={(e) => setNewBy(e.target.value)} placeholder="Name" className="mt-1" />
            </div>
            <div>
              <Label>Note</Label>
              <Textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} rows={3} placeholder="Demand details..." className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button onClick={handleNewDemand}>Create Demand</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Note Dialog */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Issue Transfer Note — {selectedRequest?.id}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground text-xs">Demand Ref</span>
                <div className="font-medium">{selectedRequest?.id}</div>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">From</span>
                <div className="font-medium">Store</div>
              </div>
            </div>
            <div>
              <Label>To (Kitchen Section)</Label>
              <select
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {KITCHEN_SECTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <Label>Issued By</Label>
              <Input value={transferIssuedBy} onChange={(e) => setTransferIssuedBy(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Items to Transfer</Label>
              <div className="mt-1 space-y-1 rounded-md border border-border p-2 bg-muted/40">
                {selectedRequest?.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm py-1 border-b border-border/40 last:border-0">
                    <span>{item.name}</span>
                    <span className="text-muted-foreground">{item.qty} {item.uom}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferOpen(false)}>Cancel</Button>
            <Button onClick={issueTransferNote}>Issue Transfer Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

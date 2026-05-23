import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ThermometerSun, ShieldCheck, AlertOctagon, ClipboardCheck, Factory, Check, X as XIcon, PackageCheck, Eye } from "lucide-react";
import { cookingTempLogs } from "@/lib/sample-data";
import { KpiCard } from "@/components/common/KpiCard";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useWorkflow, type WfProductionEntry } from "@/lib/workflow-store";
import { useArrivalFlash } from "@/lib/arrival-flash";

export const Route = createFileRoute("/cooking-temp")({
  head: () => ({ meta: [{ title: "Cooking Temp & Sensory Test" }] }),
  component: CookingTemp,
});

type CookingRecord = (typeof cookingTempLogs)[number] & { date: string };
type T = CookingRecord;

function CookingTemp() {
  useArrivalFlash();
  const { productionEntries, updateProductionEntryStatus, applyStockDeltas } = useWorkflow();
  const [records, setRecords] = useState<T[]>(
    cookingTempLogs.map(r => ({ ...r, date: "2026-05-22" }))
  );
  const [newRecordOpen, setNewRecordOpen] = useState(false);
  const [newRecordBatch, setNewRecordBatch] = useState("");
  const [newRecordItem, setNewRecordItem] = useState("");
  const [newRecordTime, setNewRecordTime] = useState("00:00");
  const [newRecordTemp, setNewRecordTemp] = useState(0);
  const [newRecordCookedBy, setNewRecordCookedBy] = useState("");
  const [newRecordSensory, setNewRecordSensory] = useState(true);
  const [newRecordStandardTemp, setNewRecordStandardTemp] = useState(75);

  // Filters
  const [filterDate, setFilterDate] = useState("");
  const [filterSensory, setFilterSensory] = useState<"" | "Pass" | "Fail">("");
  const [filterItem, setFilterItem] = useState("");

  // View record dialog
  const [viewRecord, setViewRecord] = useState<T | null>(null);

  // QC sign-off dialog (from production entries pending QC)
  const [qcOpen, setQcOpen] = useState(false);
  const [qcTarget, setQcTarget] = useState<WfProductionEntry | null>(null);
  const [qcTemp, setQcTemp] = useState(75);
  const [qcMeasured, setQcMeasured] = useState(75);
  const [qcCheckedBy, setQcCheckedBy] = useState("");
  const [qcCookedBy, setQcCookedBy] = useState("");

  const pendingQC = productionEntries.filter((e) => e.status === "Ready for QC");

  const openQc = (entry: WfProductionEntry) => {
    setQcTarget(entry);
    setQcTemp(75);
    setQcMeasured(75);
    setQcCheckedBy("");
    setQcCookedBy("");
    setQcOpen(true);
  };

  const signOff = (passed: boolean) => {
    if (!qcTarget) return;
    if (!qcCheckedBy.trim()) { toast.error("Checked By is required."); return; }
    const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
    const logId = `CT-${Date.now()}`;
    // Add to QC log
    setRecords((curr) => [
      {
        id: logId,
        batch: qcTarget.id,
        item: qcTarget.outputItemName ?? qcTarget.bom,
        cookingTime: "—",
        standardTemp: `≥${qcTemp}°C`,
        standardTempMin: qcTemp,
        measuredTemp: qcMeasured,
        cookedBy: qcCookedBy.trim() || "Kitchen Staff",
        sensoryPass: passed,
        checkedBy: qcCheckedBy.trim(),
        date: new Date().toISOString().slice(0, 10),
      } as T,
      ...curr,
    ]);

    if (passed) {
      // Flip to Completed and push to inventory
      updateProductionEntryStatus(qcTarget.id, "Completed", {
        qcLogId: logId,
        qcPassedAt: stamp,
        qcCheckedBy: qcCheckedBy.trim(),
        completedAt: stamp,
        inventoryAdded: true,
      });
      applyStockDeltas([{
        itemId: qcTarget.outputItemCode ?? qcTarget.outputItemName ?? qcTarget.id,
        delta: qcTarget.producedQty,
      }]);
      toast.success(`${qcTarget.id} passed QC — ${qcTarget.producedQty.toLocaleString()} units added to inventory.`);
    } else {
      // Send back for rework
      updateProductionEntryStatus(qcTarget.id, "In Preparation");
      toast.error(`${qcTarget.id} failed sensory check — sent back to In Preparation.`);
    }
    setQcOpen(false);
  };

  const cols: Column<T>[] = [
    { key: "id", header: "Log #" },
    { key: "batch", header: "Item Batch" },
    { key: "item", header: "Item" },
    { key: "cookingTime", header: "Cooking Time" },
    { key: "standardTemp", header: "Standard °C" },
    { key: "measuredTemp", header: "Measured °C", render: (r) => (
      <span className={r.measuredTemp >= r.standardTempMin ? "text-success font-medium" : "text-destructive font-medium"}>
        {r.measuredTemp}°C
      </span>
    ) },
    { key: "cookedBy", header: "Cooked By" },
    { key: "sensoryPass", header: "Sensory", render: (r) => (
      <StatusBadge status={r.sensoryPass ? "Pass" : "Fail"} />
    ) },
    { key: "checkedBy", header: "Checked By (Sup-Hygiene)" },
  ];

  const addNewRecord = () => {
    if (!newRecordBatch || !newRecordItem) {
      toast.error("Please provide item batch and item name.");
      return;
    }
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB").replace(/\//g, "-");
    const timeStr = now.toLocaleTimeString("en-GB");
    const newId = `CT-${Date.now()}`;
    setRecords((current) => [
      {
        id: newId,
        batch: newRecordBatch,
        item: newRecordItem,
        cookingTime: newRecordTime || "00:00",
        standardTemp: `≥${newRecordStandardTemp}°C`,
        standardTempMin: newRecordStandardTemp,
        measuredTemp: newRecordTemp,
        cookedBy: newRecordCookedBy || "Kitchen Staff",
        sensoryPass: newRecordSensory,
        checkedBy: `Senior Executive (Food and Hygiene), ${dateStr}, ${timeStr}`,
        date: now.toISOString().slice(0, 10),
      } as T,
      ...current,
    ]);
    setNewRecordOpen(false);
    setNewRecordBatch("");
    setNewRecordItem("");
    setNewRecordTime("00:00");
    setNewRecordTemp(0);
    setNewRecordCookedBy("");
    setNewRecordSensory(true);
    setNewRecordStandardTemp(75);
    toast.success("New test record added.");
  };

  const uniqueItems = Array.from(new Set(records.map(r => r.item))).sort();
  const uniqueDates = Array.from(new Set(records.map(r => r.date))).sort().reverse();

  const filteredRecords = records.filter(r => {
    if (filterDate && r.date !== filterDate) return false;
    if (filterSensory === "Pass" && !r.sensoryPass) return false;
    if (filterSensory === "Fail" && r.sensoryPass) return false;
    if (filterItem && r.item !== filterItem) return false;
    return true;
  });

  const passCount = records.filter((l) => l.sensoryPass).length;
  const passRate = records.length > 0 ? Math.round((passCount / records.length) * 100) : 0;
  const avgTemp = records.length > 0 ? Math.round(records.reduce((a, b) => a + b.measuredTemp, 0) / records.length) : 0;
  const failCount = records.filter((l) => !l.sensoryPass).length;

  return (
    <>
      <PageHeader
        title="Cooking Temperature & Sensory Test Record"
        subtitle="HACCP — verify cooking temperature, doneness & sensory acceptance per batch"
        actions={
          <Dialog open={newRecordOpen} onOpenChange={setNewRecordOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" /> New Test Record</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Test Record</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Batch</Label>
                    <Input value={newRecordBatch} onChange={(e) => setNewRecordBatch(e.target.value)} placeholder="Batch code" />
                  </div>
                  <div>
                    <Label>Item</Label>
                    <Input value={newRecordItem} onChange={(e) => setNewRecordItem(e.target.value)} placeholder="Food item" />
                  </div>
                </div>
                <div>
                  <Label>Standard Temp (°C)</Label>
                  <Input
                    type="number"
                    value={newRecordStandardTemp}
                    onChange={(e) => setNewRecordStandardTemp(Number(e.target.value))}
                    placeholder="e.g. 75"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Ref: Minimum internal cooking temperature per HACCP guidelines for this item (e.g. 75°C poultry, 63°C beef/pork, 70°C fish, 82°C reheated foods).
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Cooking Time</Label>
                    <Input type="time" value={newRecordTime} onChange={(e) => setNewRecordTime(e.target.value)} />
                  </div>
                  <div>
                    <Label>Measured Temp (°C)</Label>
                    <Input type="number" value={newRecordTemp} onChange={(e) => setNewRecordTemp(Number(e.target.value))} />
                  </div>
                </div>
                <div>
                  <Label>Cooked By</Label>
                  <Input value={newRecordCookedBy} onChange={(e) => setNewRecordCookedBy(e.target.value)} placeholder="Chef name" />
                </div>
                <div>
                  <Label>Sensory Result</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" checked={newRecordSensory} onChange={() => setNewRecordSensory(true)} />
                      Pass
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" checked={!newRecordSensory} onChange={() => setNewRecordSensory(false)} />
                      Fail
                    </label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={addNewRecord}>Save Test Record</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Tests Today" value={records.length} icon={ClipboardCheck} tone="navy" />
        <KpiCard label="Pass Rate" value={`${passRate}%`} icon={ShieldCheck} tone="success" />
        <KpiCard label="Avg Core Temp" value={`${avgTemp}°C`} icon={ThermometerSun} tone="warning" />
        <KpiCard label="Failed" value={failCount} icon={AlertOctagon} tone="red" />
      </div>

      <Card className="brand-accent-border-left mb-6">
        <CardContent className="pt-5">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider inline-flex items-center gap-2">
                <Factory className="h-4 w-4 text-primary" /> Batches Pending QC
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Production entries at <span className="font-medium">Ready for QC</span> — record the test and sign off.
              </p>
            </div>
            <Badge variant="outline" className="bg-warning/15 text-warning-foreground border-warning/40">
              {pendingQC.length} pending
            </Badge>
          </div>

          {pendingQC.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-6">
              No batches awaiting QC sign-off. All caught up.
            </div>
          ) : (
            <div className="space-y-2">
              {pendingQC.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-md border border-border p-3 hover:bg-muted/30 transition-colors flex-wrap gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-foreground">{p.id}</span>
                      <Badge variant="outline" className="text-[10px] font-normal">{p.bom}</Badge>
                    </div>
                    <div className="mt-1 text-sm font-medium">
                      {p.outputItemName ?? p.bom}
                      <span className="ml-2 text-xs text-muted-foreground tabular-nums">
                        × {p.producedQty.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">Produced on {p.date}</div>
                  </div>
                  <Button size="sm" onClick={() => openQc(p)}>
                    <ClipboardCheck className="h-3.5 w-3.5 mr-1.5" /> Record Test
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</label>
          <select
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">All</option>
            {uniqueDates.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sensory Filter</label>
          <select
            value={filterSensory}
            onChange={e => setFilterSensory(e.target.value as "" | "Pass" | "Fail")}
            className="h-8 rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">All</option>
            <option value="Pass">Pass</option>
            <option value="Fail">Fail</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Item</label>
          <select
            value={filterItem}
            onChange={e => setFilterItem(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">All</option>
            {uniqueItems.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
      </div>

      <div data-arrival-id="qc-issues">
        <DataTable
          title="cooking-temp"
          data={filteredRecords}
          columns={cols}
          searchKeys={["id", "batch", "item", "cookedBy", "checkedBy"]}
          actions={(row) => (
            <Button size="sm" variant="outline" onClick={() => setViewRecord(row)}>
              <Eye className="h-3.5 w-3.5 mr-1" /> View
            </Button>
          )}
        />
      </div>

      {/* View Record Dialog */}
      {viewRecord && (
        <Dialog open onOpenChange={(open) => { if (!open) setViewRecord(null); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Test Record — {viewRecord.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-1 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Item Batch</div>
                  <div className="font-medium">{viewRecord.batch}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Item</div>
                  <div className="font-medium">{viewRecord.item}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Cooking Time</div>
                  <div>{viewRecord.cookingTime}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Standard Temp</div>
                  <div>{viewRecord.standardTemp}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Measured Temp</div>
                  <div className={viewRecord.measuredTemp >= viewRecord.standardTempMin ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                    {viewRecord.measuredTemp}°C
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Sensory Result</div>
                  <StatusBadge status={viewRecord.sensoryPass ? "Pass" : "Fail"} />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Cooked By</div>
                  <div>{viewRecord.cookedBy}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Date</div>
                  <div>{viewRecord.date}</div>
                </div>
              </div>
              <div className="rounded-md border border-border bg-muted/40 px-3 py-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Checked By</div>
                <div className="text-sm">{viewRecord.checkedBy}</div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={qcOpen} onOpenChange={setQcOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>QC Sign-off — {qcTarget?.id}</DialogTitle>
            <DialogDescription>
              Record the cooking temperature & sensory result. Pass moves this batch to{" "}
              <span className="font-medium">Completed</span> and adds the produced quantity to inventory.
            </DialogDescription>
          </DialogHeader>

          {qcTarget && (
            <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
              <div className="font-semibold">{qcTarget.outputItemName ?? qcTarget.bom}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                BOM: {qcTarget.bom} · Qty: <span className="font-medium tabular-nums">{qcTarget.producedQty.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Standard °C</Label>
              <Input type="number" value={qcTemp}     onChange={(e) => setQcTemp(Number(e.target.value))}     className="mt-1 tabular-nums" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Measured °C</Label>
              <Input type="number" value={qcMeasured} onChange={(e) => setQcMeasured(Number(e.target.value))} className="mt-1 tabular-nums" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Cooked By</Label>
              <Input value={qcCookedBy} onChange={(e) => setQcCookedBy(e.target.value)} className="mt-1" placeholder="Chef name" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Checked By <span className="text-destructive">*</span></Label>
              <Input value={qcCheckedBy} onChange={(e) => setQcCheckedBy(e.target.value)} className="mt-1" placeholder="Hygiene lead" />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setQcOpen(false)}>Cancel</Button>
            <Button
              variant="outline"
              className="border-destructive/40 text-destructive hover:bg-destructive/10"
              onClick={() => signOff(false)}
            >
              <XIcon className="h-4 w-4 mr-1.5" /> Fail (Send Back)
            </Button>
            <Button
              className="bg-success text-success-foreground hover:bg-success/90"
              onClick={() => signOff(true)}
            >
              <Check className="h-4 w-4 mr-1.5" /> Pass & Complete
              <PackageCheck className="h-4 w-4 ml-1.5" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

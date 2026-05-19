import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, ThermometerSun, ShieldCheck, AlertOctagon, ClipboardCheck } from "lucide-react";
import { cookingTempLogs } from "@/lib/sample-data";
import { KpiCard } from "@/components/common/KpiCard";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/cooking-temp")({
  head: () => ({ meta: [{ title: "Cooking Temp & Sensory Test" }] }),
  component: CookingTemp,
});

type T = (typeof cookingTempLogs)[number];

function CookingTemp() {
  const [records, setRecords] = useState<T[]>(cookingTempLogs);
  const [newRecordOpen, setNewRecordOpen] = useState(false);
  const [newRecordBatch, setNewRecordBatch] = useState("");
  const [newRecordItem, setNewRecordItem] = useState("");
  const [newRecordTime, setNewRecordTime] = useState("00:00");
  const [newRecordTemp, setNewRecordTemp] = useState(0);
  const [newRecordCookedBy, setNewRecordCookedBy] = useState("");
  const [newRecordCheckedBy, setNewRecordCheckedBy] = useState("");
  const [newRecordSensory, setNewRecordSensory] = useState(true);
  const [newRecordStandardTemp, setNewRecordStandardTemp] = useState(75);

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
    const newId = `CT-${Date.now()}`;
    setRecords((current) => [
      {
        id: newId,
        batch: newRecordBatch,
        item: newRecordItem,
        cookingTime: newRecordTime || "00:00",
        standardTemp: newRecordStandardTemp,
        standardTempMin: newRecordStandardTemp,
        measuredTemp: newRecordTemp,
        cookedBy: newRecordCookedBy || "Kitchen Staff",
        sensoryPass: newRecordSensory,
        checkedBy: newRecordCheckedBy || "Hygiene Lead",
      } as T,
      ...current,
    ]);
    setNewRecordOpen(false);
    setNewRecordBatch("");
    setNewRecordItem("");
    setNewRecordTime("00:00");
    setNewRecordTemp(0);
    setNewRecordCookedBy("");
    setNewRecordCheckedBy("");
    setNewRecordSensory(true);
    setNewRecordStandardTemp(75);
    toast.success("New test record added.");
  };

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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Cooked By</Label>
                    <Input value={newRecordCookedBy} onChange={(e) => setNewRecordCookedBy(e.target.value)} placeholder="Chef name" />
                  </div>
                  <div>
                    <Label>Checked By</Label>
                    <Input value={newRecordCheckedBy} onChange={(e) => setNewRecordCheckedBy(e.target.value)} placeholder="Hygiene lead" />
                  </div>
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

      <DataTable
        title="cooking-temp"
        data={records}
        columns={cols}
        searchKeys={["id", "batch", "item", "cookedBy", "checkedBy"]}
      />
    </>
  );
}

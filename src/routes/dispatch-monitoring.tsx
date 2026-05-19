import { createFileRoute } from "@tanstack/react-router";
import { useState, Fragment } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus, Truck, Pencil, Trash2, ThermometerSun, ShieldCheck,
  AlertOctagon, AlertTriangle, PlaneTakeoff, PlaneLanding,
  Clock, User, CheckCircle2,
} from "lucide-react";
import { flights } from "@/lib/sample-data";
import { useRole } from "@/lib/roles";
import { KpiCard } from "@/components/common/KpiCard";

export const Route = createFileRoute("/dispatch-monitoring")({
  head: () => ({ meta: [{ title: "Dispatch Monitoring — Food Safety & QC" }] }),
  component: DispatchMonitoring,
});

// ── Constants ───────────────────────────────────────────────────────────────
const VEHICLES = ["HiLoader-02", "HiLoader-03", "HiLoader-05", "Van-11"];
const MEAL_TYPES = ["Regular", "Vegetarian (VGML)", "Child Meal (CHML)", "Diabetic (DBML)", "Kosher (KSML)", "Crew Meal", "Special"];
const SUPERVISORS = ["F. Begum", "A. Khan", "S. Islam", "R. Akter", "N. Hossain"];
const APT_EXECUTIVES = ["M. Hossain", "T. Ahmed", "K. Sultana", "A. Chowdhury", "R. Islam"];
const CATERING_STAFF = ["F. Begum", "A. Khan", "S. Islam", "R. Akter", "N. Hossain", "Chef R. Karim", "Chef N. Hasan", "Chef A. Rahim", "M. Karim"];
const CATERING_DESIGNATIONS = ["Executive — Production", "Sr. Executive — Production", "Hygiene Executive", "Supervisor — Hygiene", "Flight Kitchen Executive"];
const APT_DESIGNATIONS = ["APT Executive", "Sr. APT Executive", "Airport Supervisor", "Ground Operations Officer"];
const DEP_TIMES = [...new Set(flights.map((f) => f.dep))].sort();
const todayStr = new Date().toISOString().split("T")[0];

function nowTimeStr() {
  const now = new Date();
  return `${todayStr} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
}

// ── Types ───────────────────────────────────────────────────────────────────
type MealLine = { type: string; qty: string };
type DispatchEntry = {
  id: string; flightId: string; packagingDate: string; mealLines: MealLine[];
  vehicleNo: string; vehicleClean: "Yes" | "No"; chilledTemp: string; frozenTemp: string;
  loadStartTime: string; loadEndTime: string; vehicleTempBegin: string; vehicleTempEnd: string;
  resultSatisfy: "Yes" | "No"; checkedBySupervisor: string; gateTempGate08: string;
  unloadingTime: string; checkedByApt: string; comments: string; preventiveAction: string; remarks: string;
  dispatchedBy: string; dispatchedDesignation: string; dispatchedAt: string;
  receivedBy: string; receivedDesignation: string; receivedAt: string;
};
type FormState = {
  flightId: string; packagingDate: string; mealLines: MealLine[];
  vehicleNo: string; vehicleClean: "Yes" | "No" | ""; chilledTemp: string; frozenTemp: string;
  loadStartTime: string; loadEndTime: string; vehicleTempBegin: string; vehicleTempEnd: string;
  resultSatisfy: "Yes" | "No" | ""; checkedBySupervisor: string; gateTempGate08: string;
  unloadingTime: string; checkedByApt: string; comments: string; preventiveAction: string; remarks: string;
  ackChilled: boolean; ackFrozen: boolean; ackTempBegin: boolean; ackTempEnd: boolean; ackGate08: boolean;
  dispatcherName: string; dispatcherDesignation: string;
  receiverName: string; receiverDesignation: string;
};

const EMPTY_FORM: FormState = {
  flightId: "", packagingDate: todayStr, mealLines: [{ type: "Regular", qty: "" }],
  vehicleNo: "", vehicleClean: "", chilledTemp: "", frozenTemp: "",
  loadStartTime: "", loadEndTime: "", vehicleTempBegin: "", vehicleTempEnd: "",
  resultSatisfy: "", checkedBySupervisor: "", gateTempGate08: "",
  unloadingTime: "", checkedByApt: "", comments: "", preventiveAction: "", remarks: "",
  ackChilled: false, ackFrozen: false, ackTempBegin: false, ackTempEnd: false, ackGate08: false,
  dispatcherName: "", dispatcherDesignation: "",
  receiverName: "", receiverDesignation: "",
};

// ── Helpers ─────────────────────────────────────────────────────────────────
const chilledOOR = (v: string) => { const n = parseFloat(v); return v !== "" && !isNaN(n) && (n < 1 || n > 4); };
const frozenOOR  = (v: string) => { const n = parseFloat(v); return v !== "" && !isNaN(n) && (n < -12 || n > -8); };
const vehOOR     = (v: string) => { const n = parseFloat(v); return v !== "" && !isNaN(n) && n > 8; };
const totalQty   = (lines: MealLine[]) => lines.reduce((s, l) => s + (parseInt(l.qty) || 0), 0);
const flightLabel = (id: string) => { const f = flights.find((x) => x.id === id); return f ? `${f.flight} — ${f.sector}` : id; };

// ── UI Primitives ────────────────────────────────────────────────────────────
function TempHint({ note }: { note: string }) {
  return (
    <p className="text-[11px] text-blue-600/80 mt-0.5 italic flex items-center gap-1">
      <ThermometerSun className="h-3 w-3 shrink-0" />{note}
    </p>
  );
}

function YesNoBadge({ value }: { value: "Yes" | "No" }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${value === "Yes" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
      {value}
    </span>
  );
}

function TempCell({ value, oor }: { value: string; oor?: boolean }) {
  const flag = oor !== undefined ? oor : vehOOR(value);
  return <span className={flag ? "text-red-600 font-semibold" : ""}>{value ? `${value}°C` : "—"}</span>;
}

function OorAck({ show, checked, onChange, label }: { show: boolean; checked: boolean; onChange: (v: boolean) => void; label: string }) {
  if (!show) return null;
  return (
    <label className="flex items-center gap-2 mt-1.5 text-xs cursor-pointer select-none bg-red-50 border border-red-200 rounded p-2">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(!!v)} className="border-red-400" />
      <span className="text-red-700 font-medium">{label}</span>
    </label>
  );
}

function FieldErr({ msg }: { msg?: string }) {
  return msg ? <p className="text-xs text-red-500 mt-0.5">{msg}</p> : null;
}

function YesNoToggle({ value, onChange, error }: { value: "Yes" | "No" | ""; onChange: (v: "Yes" | "No") => void; error?: string }) {
  return (
    <>
      <div className="flex gap-2 mt-1">
        {(["Yes", "No"] as const).map((opt) => (
          <button key={opt} type="button" onClick={() => onChange(opt)}
            className={`flex-1 py-1.5 rounded-md border text-sm font-semibold transition-colors ${
              value === opt
                ? opt === "Yes" ? "bg-emerald-600 border-emerald-600 text-white" : "bg-red-600 border-red-600 text-white"
                : "border-border hover:bg-muted"}`}>
            {opt}
          </button>
        ))}
      </div>
      <FieldErr msg={error} />
    </>
  );
}

function MaxTempBanner() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 text-xs font-semibold mb-4">
      <ThermometerSun className="h-4 w-4 text-amber-500 shrink-0" />
      Max. Temp. Limit: +8°C — Cold chain integrity must be maintained throughout dispatch
    </div>
  );
}

function Divider({ label, color = "blue" }: { label: string; color?: "blue" | "emerald" | "slate" }) {
  const t = color === "blue" ? "text-blue-600" : color === "emerald" ? "text-emerald-600" : "text-slate-500";
  const l = color === "blue" ? "border-blue-100" : color === "emerald" ? "border-emerald-100" : "border-slate-200";
  return (
    <div className="flex items-center gap-2 mb-2 mt-1">
      <span className={`text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${t}`}>{label}</span>
      <div className={`flex-1 border-t ${l}`} />
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
function DispatchMonitoring() {
  useRole();

  const [entries, setEntries] = useState<DispatchEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [depTime, setDepTime] = useState("");
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const sf = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const filteredFlights = depTime ? flights.filter((f) => f.dep === depTime) : flights;
  const selectedFlight = flights.find((f) => f.id === form.flightId);

  const handleFlightSelect = (flightId: string) => {
    const f = flights.find((x) => x.id === flightId);
    setForm((prev) => ({
      ...prev,
      flightId,
      packagingDate: todayStr,
      mealLines: f ? [{ type: "Regular", qty: f.pax.toString() }] : prev.mealLines,
    }));
  };

  const resetForm = () => { setShowForm(false); setEditId(null); setForm({ ...EMPTY_FORM }); setDepTime(""); setErrors({}); };

  const openNew = () => {
    setForm({ ...EMPTY_FORM }); setDepTime(""); setEditId(null); setErrors({}); setShowForm(true);
    setTimeout(() => document.getElementById("dispatch-entry-form")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const openEdit = (entry: DispatchEntry) => {
    const fl = flights.find((f) => f.id === entry.flightId);
    setDepTime(fl?.dep ?? "");
    setForm({
      flightId: entry.flightId, packagingDate: entry.packagingDate,
      mealLines: entry.mealLines.length ? entry.mealLines : [{ type: "Regular", qty: "" }],
      vehicleNo: entry.vehicleNo, vehicleClean: entry.vehicleClean,
      chilledTemp: entry.chilledTemp, frozenTemp: entry.frozenTemp,
      loadStartTime: entry.loadStartTime, loadEndTime: entry.loadEndTime,
      vehicleTempBegin: entry.vehicleTempBegin, vehicleTempEnd: entry.vehicleTempEnd,
      resultSatisfy: entry.resultSatisfy, checkedBySupervisor: entry.checkedBySupervisor,
      gateTempGate08: entry.gateTempGate08, unloadingTime: entry.unloadingTime,
      checkedByApt: entry.checkedByApt, comments: entry.comments,
      preventiveAction: entry.preventiveAction, remarks: entry.remarks,
      ackChilled: false, ackFrozen: false, ackTempBegin: false, ackTempEnd: false, ackGate08: false,
      dispatcherName: entry.dispatchedBy, dispatcherDesignation: entry.dispatchedDesignation,
      receiverName: entry.receivedBy, receiverDesignation: entry.receivedDesignation,
    });
    setEditId(entry.id); setErrors({}); setShowForm(true);
    setTimeout(() => document.getElementById("dispatch-entry-form")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.flightId) e.flightId = "Flight is required.";
    if (!form.vehicleNo) e.vehicleNo = "Vehicle No. is required.";
    if (!form.vehicleClean) e.vehicleClean = "Vehicle cleanliness status is required.";
    if (!form.loadStartTime) e.loadStartTime = "Required.";
    if (!form.loadEndTime) e.loadEndTime = "Required.";
    if (form.loadStartTime && form.loadEndTime && form.loadEndTime <= form.loadStartTime) e.loadEndTime = "Must be after start.";
    if (!form.vehicleTempBegin) e.vehicleTempBegin = "Required.";
    if (!form.vehicleTempEnd) e.vehicleTempEnd = "Required.";
    if (!form.resultSatisfy) e.resultSatisfy = "Required.";
    if (!form.checkedBySupervisor) e.checkedBySupervisor = "Supervisor is required.";
    if (!form.dispatcherName) e.dispatcherName = "Name is required.";
    if (!form.dispatcherDesignation) e.dispatcherDesignation = "Designation is required.";
    if (chilledOOR(form.chilledTemp) && !form.ackChilled) e.ackChilled = "Acknowledge out-of-range reading.";
    if (frozenOOR(form.frozenTemp) && !form.ackFrozen) e.ackFrozen = "Acknowledge out-of-range reading.";
    if (vehOOR(form.vehicleTempBegin) && !form.ackTempBegin) e.ackTempBegin = "Acknowledge exceeds +8°C.";
    if (vehOOR(form.vehicleTempEnd) && !form.ackTempEnd) e.ackTempEnd = "Acknowledge exceeds +8°C.";
    if (vehOOR(form.gateTempGate08) && !form.ackGate08) e.ackGate08 = "Acknowledge exceeds +8°C.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveEntry = () => {
    if (!validate()) return;
    const label = flightLabel(form.flightId);
    const at = nowTimeStr();
    const existing = editId ? entries.find((e) => e.id === editId) : null;
    const base: Omit<DispatchEntry, "id"> = {
      flightId: form.flightId, packagingDate: form.packagingDate,
      mealLines: form.mealLines.filter((l) => l.qty),
      vehicleNo: form.vehicleNo, vehicleClean: form.vehicleClean as "Yes" | "No",
      chilledTemp: form.chilledTemp, frozenTemp: form.frozenTemp,
      loadStartTime: form.loadStartTime, loadEndTime: form.loadEndTime,
      vehicleTempBegin: form.vehicleTempBegin, vehicleTempEnd: form.vehicleTempEnd,
      resultSatisfy: form.resultSatisfy as "Yes" | "No",
      checkedBySupervisor: form.checkedBySupervisor,
      gateTempGate08: form.gateTempGate08, unloadingTime: form.unloadingTime,
      checkedByApt: form.checkedByApt, comments: form.comments,
      preventiveAction: form.preventiveAction, remarks: form.remarks,
      dispatchedBy: form.dispatcherName,
      dispatchedDesignation: form.dispatcherDesignation,
      dispatchedAt: existing?.dispatchedAt ?? at,
      receivedBy: form.receiverName,
      receivedDesignation: form.receiverDesignation,
      receivedAt: form.receiverName ? (existing?.receivedAt || at) : "",
    };
    if (editId) {
      setEntries((prev) => prev.map((e) => e.id === editId ? { ...e, ...base } : e));
      toast.success(`Entry updated — ${label}`);
    } else {
      setEntries((prev) => [{ id: `DSP-${Date.now()}`, ...base }, ...prev]);
      toast.success(`Dispatch entry saved — ${label}`);
    }
    resetForm();
  };

  const confirmDelete = () => {
    setEntries((prev) => prev.filter((e) => e.id !== deleteId));
    setDeleteOpen(false);
    toast.success("Entry deleted");
  };

  const deleteTarget = entries.find((e) => e.id === deleteId);
  const satisfiedCount = entries.filter((e) => e.resultSatisfy === "Yes").length;
  const unsatisfiedCount = entries.filter((e) => e.resultSatisfy === "No").length;
  const vehicleIssues = entries.filter((e) => e.vehicleClean === "No").length;

  return (
    <>
      <PageHeader
        title="Daily Product Dispatch Monitoring"
        subtitle="Cold chain integrity & vehicle hygiene verification per flight dispatch · USBA-FSH-PDM-01"
      />
      <p className="text-xs text-muted-foreground mb-5 -mt-1">Baunia Catering → Airport Catering</p>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Dispatches" value={entries.length} icon={Truck} tone="navy" />
        <KpiCard label="Result Satisfied" value={satisfiedCount} icon={ShieldCheck} tone="success" />
        <KpiCard label="Not Satisfied" value={unsatisfiedCount} icon={AlertOctagon} tone="red" />
        <KpiCard label="Vehicle Issues" value={vehicleIssues} icon={AlertTriangle} tone="warning" />
      </div>

      {/* Entries Table */}
      {entries.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-x-auto mb-6 shadow-sm">
          <table className="w-full text-xs border-collapse" style={{ minWidth: 1640 }}>
            <thead>
              <tr className="bg-slate-800 text-white">
                {([
                  ["Flight", true, false], ["Pkg. Date", false, false], ["Qty", false, false],
                  ["Vehicle", false, false], ["Clean", false, false],
                  ["Chilled (1–4°C)", false, false], ["Frozen (-10±2°C)", false, false],
                  ["Load Start", false, false], ["Load End", false, false],
                  ["Veh. Begin", false, false], ["Veh. End", false, false],
                  ["Result", false, false], ["Supervisor", false, false],
                  ["Gate 08 Temp", false, false], ["Unloading", false, false],
                  ["APT Exec.", false, false], ["Remarks", false, false],
                  ["", false, true],
                ] as [string, boolean, boolean][]).map(([h, sl, sr]) => (
                  <th key={h || "act"}
                    className={`px-3 py-2.5 text-left font-semibold whitespace-nowrap text-[11px] ${sl ? "sticky left-0 z-10 bg-slate-800" : sr ? "sticky right-0 z-10 bg-slate-800" : ""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <Fragment key={entry.id}>
                  <tr className={`border-b border-border/40 hover:bg-blue-50/40 transition-colors ${idx % 2 === 1 ? "bg-slate-50/60" : "bg-white"}`}>
                    <td className="px-3 py-2 sticky left-0 z-10 bg-inherit font-semibold whitespace-nowrap text-blue-700">{flightLabel(entry.flightId)}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{entry.packagingDate}</td>
                    <td className="px-3 py-2 font-medium">{totalQty(entry.mealLines)}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{entry.vehicleNo}</td>
                    <td className="px-3 py-2"><YesNoBadge value={entry.vehicleClean} /></td>
                    <td className="px-3 py-2"><span className={chilledOOR(entry.chilledTemp) ? "text-red-600 font-semibold" : ""}>{entry.chilledTemp ? `${entry.chilledTemp}°C` : "—"}</span></td>
                    <td className="px-3 py-2"><span className={frozenOOR(entry.frozenTemp) ? "text-red-600 font-semibold" : ""}>{entry.frozenTemp ? `${entry.frozenTemp}°C` : "—"}</span></td>
                    <td className="px-3 py-2">{entry.loadStartTime || "—"}</td>
                    <td className="px-3 py-2">{entry.loadEndTime || "—"}</td>
                    <td className="px-3 py-2"><TempCell value={entry.vehicleTempBegin} /></td>
                    <td className="px-3 py-2"><TempCell value={entry.vehicleTempEnd} /></td>
                    <td className="px-3 py-2"><YesNoBadge value={entry.resultSatisfy} /></td>
                    <td className="px-3 py-2 whitespace-nowrap">{entry.checkedBySupervisor || "—"}</td>
                    <td className="px-3 py-2"><TempCell value={entry.gateTempGate08} /></td>
                    <td className="px-3 py-2">{entry.unloadingTime || "—"}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{entry.checkedByApt || "—"}</td>
                    <td className="px-3 py-2 max-w-[90px] truncate" title={entry.remarks}>{entry.remarks || "—"}</td>
                    <td className="px-3 py-2 sticky right-0 z-10 bg-inherit">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={() => openEdit(entry)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => { setDeleteId(entry.id); setDeleteOpen(true); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {/* Log sub-row */}
                  <tr className={idx % 2 === 1 ? "bg-slate-50/60" : "bg-white"}>
                    <td colSpan={18} className="px-3 pb-2.5 border-b border-border/30">
                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold text-[10px]">
                            <PlaneTakeoff className="h-2.5 w-2.5" /> Dispatched
                          </span>
                          <User className="h-3 w-3 text-slate-400" />
                          <strong>{entry.dispatchedBy}</strong> · {entry.dispatchedDesignation} ·
                          <Clock className="h-3 w-3 text-slate-400 ml-1" /> {entry.dispatchedAt}
                        </span>
                        {entry.receivedBy ? (
                          <span className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-[10px]">
                              <CheckCircle2 className="h-2.5 w-2.5" /> Received
                            </span>
                            <User className="h-3 w-3 text-slate-400" />
                            <strong>{entry.receivedBy}</strong> · {entry.receivedDesignation} ·
                            <Clock className="h-3 w-3 text-slate-400 ml-1" /> {entry.receivedAt}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px]">
                            <Clock className="h-2.5 w-2.5" /> Awaiting Airport Receipt
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Inline Two-Panel Entry Form ──────────────────────────────────────── */}
      <div id="dispatch-entry-form" className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-slate-700">
            {showForm ? (editId ? "Editing Dispatch Entry" : "New Dispatch Entry") : ""}
          </span>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md" onClick={openNew}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Dispatch Entry
          </Button>
        </div>

        {!showForm && entries.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 py-20 text-center">
            <Truck className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No dispatch entries for today.</p>
            <p className="text-xs text-muted-foreground mt-1">Click <strong>+ Add Dispatch Entry</strong> above to begin.</p>
          </div>
        )}

        {showForm && (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

              {/* ══ LEFT: Catering Point ══════════════════════════════════════ */}
              <div className="rounded-xl border border-blue-300 bg-white shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <PlaneTakeoff className="h-5 w-5" />
                    <div>
                      <p className="font-bold text-sm">Catering Point Dispatch Entry</p>
                      <p className="text-[11px] text-blue-200 mt-0.5">Baunia Central Kitchen</p>
                    </div>
                  </div>
                  <span className="text-xs bg-blue-800/60 px-2.5 py-1 rounded-full">USBA-FSH-PDM-01</span>
                </div>

                <div className="p-5 space-y-4">
                  <MaxTempBanner />

                  {/* ─ Flight & Packaging ─ */}
                  <Divider label="Flight & Packaging" color="blue" />

                  {/* Row: dep time | flight | date */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Departure Time</Label>
                      <Select value={depTime} onValueChange={(v) => { setDepTime(v); sf("flightId", ""); }}>
                        <SelectTrigger className="mt-1 h-9 text-sm">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEP_TIMES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Flight Number *</Label>
                      <Select value={form.flightId} onValueChange={handleFlightSelect}>
                        <SelectTrigger className={`mt-1 h-9 text-sm ${errors.flightId ? "border-red-400" : ""}`}>
                          <SelectValue placeholder="Select flight" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredFlights.map((f) => <SelectItem key={f.id} value={f.id}>{f.flight} — {f.sector}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FieldErr msg={errors.flightId} />
                    </div>
                    <div>
                      <Label className="text-xs">Date of Packaging</Label>
                      <Input type="date" value={form.packagingDate} onChange={(e) => sf("packagingDate", e.target.value)} className="mt-1 h-9 text-sm" />
                    </div>
                  </div>

                  {/* Auto-fill chips */}
                  {selectedFlight && (
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: selectedFlight.sector, color: "blue" },
                        { label: selectedFlight.aircraft, color: "blue" },
                        { label: `DEP ${selectedFlight.dep}`, color: "indigo" },
                        { label: `${selectedFlight.pax} PAX`, color: "slate" },
                        { label: selectedFlight.window, color: "amber" },
                        { label: selectedFlight.status, color: selectedFlight.status === "Boarding" ? "emerald" : selectedFlight.status === "Delayed" ? "red" : "slate" },
                      ].map(({ label, color }) => (
                        <span key={label} className={`px-2.5 py-1 rounded-md border text-[11px] font-medium
                          ${color === "blue" ? "bg-blue-50 border-blue-200 text-blue-700" :
                            color === "indigo" ? "bg-indigo-50 border-indigo-200 text-indigo-700" :
                            color === "amber" ? "bg-amber-50 border-amber-200 text-amber-700" :
                            color === "emerald" ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                            color === "red" ? "bg-red-50 border-red-200 text-red-700" :
                            "bg-slate-50 border-slate-200 text-slate-700"}`}>
                          {label}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Meal lines */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs">Meal Types & Quantities</Label>
                      <span className="text-xs text-muted-foreground">Total: <strong className="text-blue-700">{totalQty(form.mealLines)}</strong> pax</span>
                    </div>
                    <div className="space-y-1.5">
                      {form.mealLines.map((line, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <Select value={line.type} onValueChange={(v) => sf("mealLines", form.mealLines.map((l, j) => j === i ? { ...l, type: v } : l))}>
                            <SelectTrigger className="flex-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>{MEAL_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                          </Select>
                          <Input type="number" min={0} placeholder="Qty" value={line.qty}
                            onChange={(e) => sf("mealLines", form.mealLines.map((l, j) => j === i ? { ...l, qty: e.target.value } : l))}
                            className="w-20 h-8 text-xs" />
                          {form.mealLines.length > 1 && (
                            <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400"
                              onClick={() => sf("mealLines", form.mealLines.filter((_, j) => j !== i))}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button type="button" size="sm" variant="outline" className="mt-2 h-7 text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
                      onClick={() => sf("mealLines", [...form.mealLines, { type: "Regular", qty: "" }])}>
                      <Plus className="h-3 w-3 mr-1" /> Add Meal Type
                    </Button>
                  </div>

                  {/* ─ Vehicle ─ */}
                  <Divider label="Vehicle Details" color="blue" />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Vehicle No. *</Label>
                      <Select value={form.vehicleNo} onValueChange={(v) => sf("vehicleNo", v)}>
                        <SelectTrigger className={`mt-1 h-9 ${errors.vehicleNo ? "border-red-400" : ""}`}>
                          <SelectValue placeholder="Select vehicle" />
                        </SelectTrigger>
                        <SelectContent>{VEHICLES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                      </Select>
                      <FieldErr msg={errors.vehicleNo} />
                    </div>
                    <div>
                      <Label className="text-xs">Vehicle Clean *</Label>
                      <YesNoToggle value={form.vehicleClean} onChange={(v) => sf("vehicleClean", v)} error={errors.vehicleClean} />
                      {form.vehicleClean === "No" && <p className="text-xs text-amber-600 mt-1 font-medium">⚠ Report to supervisor immediately</p>}
                    </div>
                  </div>

                  {/* ─ Core Temps ─ */}
                  <Divider label="Product Core Temperature" color="blue" />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Chilled Temp (°C)</Label>
                      <Input type="number" step="0.1" placeholder="e.g. 3.0" value={form.chilledTemp}
                        onChange={(e) => { sf("chilledTemp", e.target.value); sf("ackChilled", false); }}
                        className={`mt-1 h-9 ${chilledOOR(form.chilledTemp) ? "border-red-400 bg-red-50" : ""}`} />
                      <TempHint note="Standard: 1°C – 4°C for chilled products" />
                      {chilledOOR(form.chilledTemp) && <p className="text-xs text-red-600 mt-0.5 font-semibold">⚠ Out of range</p>}
                      <OorAck show={chilledOOR(form.chilledTemp)} checked={form.ackChilled} onChange={(v) => sf("ackChilled", v)} label="I acknowledge this reading is outside range" />
                      <FieldErr msg={errors.ackChilled} />
                    </div>
                    <div>
                      <Label className="text-xs">Frozen Temp (°C)</Label>
                      <Input type="number" step="0.1" placeholder="e.g. -10.0" value={form.frozenTemp}
                        onChange={(e) => { sf("frozenTemp", e.target.value); sf("ackFrozen", false); }}
                        className={`mt-1 h-9 ${frozenOOR(form.frozenTemp) ? "border-red-400 bg-red-50" : ""}`} />
                      <TempHint note="Standard: -12°C – -8°C for frozen items" />
                      {frozenOOR(form.frozenTemp) && <p className="text-xs text-red-600 mt-0.5 font-semibold">⚠ Out of range</p>}
                      <OorAck show={frozenOOR(form.frozenTemp)} checked={form.ackFrozen} onChange={(v) => sf("ackFrozen", v)} label="I acknowledge this reading is outside range" />
                      <FieldErr msg={errors.ackFrozen} />
                    </div>
                  </div>

                  {/* ─ Loading Times + Vehicle Temps — 4-col horizontal ─ */}
                  <Divider label="Loading Times & Vehicle Temperature" color="blue" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <Label className="text-xs">Load Start *</Label>
                      <Input type="time" value={form.loadStartTime} onChange={(e) => sf("loadStartTime", e.target.value)}
                        className={`mt-1 h-9 ${errors.loadStartTime ? "border-red-400" : ""}`} />
                      <FieldErr msg={errors.loadStartTime} />
                    </div>
                    <div>
                      <Label className="text-xs">Load End *</Label>
                      <Input type="time" value={form.loadEndTime} onChange={(e) => sf("loadEndTime", e.target.value)}
                        className={`mt-1 h-9 ${errors.loadEndTime ? "border-red-400" : ""}`} />
                      <FieldErr msg={errors.loadEndTime} />
                    </div>
                    <div>
                      <Label className="text-xs">Veh. Temp Begin (°C) *</Label>
                      <Input type="number" step="0.1" placeholder="e.g. 4.5" value={form.vehicleTempBegin}
                        onChange={(e) => { sf("vehicleTempBegin", e.target.value); sf("ackTempBegin", false); }}
                        className={`mt-1 h-9 ${errors.vehicleTempBegin || vehOOR(form.vehicleTempBegin) ? "border-red-400 bg-red-50" : ""}`} />
                      <TempHint note="Max: +8°C" />
                      {vehOOR(form.vehicleTempBegin) && <p className="text-xs text-red-600 font-semibold">⚠ Exceeds limit</p>}
                      <OorAck show={vehOOR(form.vehicleTempBegin)} checked={form.ackTempBegin} onChange={(v) => sf("ackTempBegin", v)} label="Acknowledge" />
                      <FieldErr msg={errors.vehicleTempBegin ?? errors.ackTempBegin} />
                    </div>
                    <div>
                      <Label className="text-xs">Veh. Temp End (°C) *</Label>
                      <Input type="number" step="0.1" placeholder="e.g. 5.0" value={form.vehicleTempEnd}
                        onChange={(e) => { sf("vehicleTempEnd", e.target.value); sf("ackTempEnd", false); }}
                        className={`mt-1 h-9 ${errors.vehicleTempEnd || vehOOR(form.vehicleTempEnd) ? "border-red-400 bg-red-50" : ""}`} />
                      <TempHint note="Max: +8°C" />
                      {vehOOR(form.vehicleTempEnd) && <p className="text-xs text-red-600 font-semibold">⚠ Exceeds limit</p>}
                      <OorAck show={vehOOR(form.vehicleTempEnd)} checked={form.ackTempEnd} onChange={(v) => sf("ackTempEnd", v)} label="Acknowledge" />
                      <FieldErr msg={errors.vehicleTempEnd ?? errors.ackTempEnd} />
                    </div>
                  </div>

                  {/* ─ Result + Supervisor ─ */}
                  <Divider label="Result & Supervisor Check" color="blue" />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Result Satisfy *</Label>
                      <YesNoToggle value={form.resultSatisfy} onChange={(v) => sf("resultSatisfy", v)} error={errors.resultSatisfy} />
                      {form.resultSatisfy === "No" && <p className="text-xs text-amber-600 mt-1 font-medium">⚠ Record preventive action below</p>}
                    </div>
                    <div>
                      <Label className="text-xs">Checked By (Supervisor-Hygiene) *</Label>
                      <Select value={form.checkedBySupervisor} onValueChange={(v) => sf("checkedBySupervisor", v)}>
                        <SelectTrigger className={`mt-1 h-9 ${errors.checkedBySupervisor ? "border-red-400" : ""}`}>
                          <SelectValue placeholder="Select supervisor" />
                        </SelectTrigger>
                        <SelectContent>{SUPERVISORS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                      </Select>
                      <FieldErr msg={errors.checkedBySupervisor} />
                    </div>
                  </div>

                  {/* ─ Comments, Preventive Action, Remarks — 3-col horizontal ─ */}
                  <Divider label="Comments & Remarks" color="blue" />
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Comments</Label>
                      <Textarea value={form.comments} onChange={(e) => sf("comments", e.target.value)}
                        placeholder="Observations during dispatch..." className="mt-1 min-h-[72px] text-xs" />
                    </div>
                    <div>
                      <Label className="text-xs">Preventive Action</Label>
                      <Textarea value={form.preventiveAction} onChange={(e) => sf("preventiveAction", e.target.value)}
                        placeholder="Corrective measures taken..."
                        className={`mt-1 min-h-[72px] text-xs ${form.resultSatisfy === "No" ? "border-amber-400 bg-amber-50/60" : ""}`} />
                      {form.resultSatisfy === "No" && <p className="text-xs text-amber-600 mt-0.5">Required when unsatisfied</p>}
                    </div>
                    <div>
                      <Label className="text-xs">Remarks</Label>
                      <Textarea value={form.remarks} onChange={(e) => sf("remarks", e.target.value)}
                        placeholder="Optional remarks..." className="mt-1 min-h-[72px] text-xs" />
                    </div>
                  </div>

                  {/* ─ Dispatch Log ─ */}
                  <Divider label="Dispatch Log" color="blue" />
                  <div className="rounded-lg bg-blue-50/70 border border-blue-200 p-3.5">
                    <p className="text-[11px] text-blue-700 font-bold mb-2.5 flex items-center gap-1.5">
                      <PlaneTakeoff className="h-3.5 w-3.5" /> Dispatched By (Catering)
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Name *</Label>
                        <Select value={form.dispatcherName} onValueChange={(v) => sf("dispatcherName", v)}>
                          <SelectTrigger className={`mt-1 h-9 ${errors.dispatcherName ? "border-red-400" : ""}`}>
                            <SelectValue placeholder="Select name" />
                          </SelectTrigger>
                          <SelectContent>{CATERING_STAFF.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                        </Select>
                        <FieldErr msg={errors.dispatcherName} />
                      </div>
                      <div>
                        <Label className="text-xs">Designation *</Label>
                        <Select value={form.dispatcherDesignation} onValueChange={(v) => sf("dispatcherDesignation", v)}>
                          <SelectTrigger className={`mt-1 h-9 ${errors.dispatcherDesignation ? "border-red-400" : ""}`}>
                            <SelectValue placeholder="Select designation" />
                          </SelectTrigger>
                          <SelectContent>{CATERING_DESIGNATIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                        </Select>
                        <FieldErr msg={errors.dispatcherDesignation} />
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Dispatch date & time auto-recorded on save
                    </p>
                  </div>
                </div>
              </div>

              {/* ══ RIGHT: Airport Point ══════════════════════════════════════ */}
              <div className="rounded-xl border border-emerald-300 bg-white shadow-sm overflow-hidden self-start">
                <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 text-white px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <PlaneLanding className="h-5 w-5" />
                    <div>
                      <p className="font-bold text-sm">Airport Point Receiving Entry</p>
                      <p className="text-[11px] text-emerald-200 mt-0.5">Airport Catering Unit — Gate No. 08</p>
                    </div>
                  </div>
                  <span className="text-xs bg-emerald-800/60 px-2.5 py-1 rounded-full">APT Verify</span>
                </div>

                <div className="p-5 space-y-4">
                  <MaxTempBanner />

                  {/* ─ Gate Details — 3-col horizontal ─ */}
                  <Divider label="Airport Gate Details — Gate No. 08" color="emerald" />
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Gate 08 Temp (°C)</Label>
                      <Input type="number" step="0.1" placeholder="e.g. 6.5" value={form.gateTempGate08}
                        onChange={(e) => { sf("gateTempGate08", e.target.value); sf("ackGate08", false); }}
                        className={`mt-1 h-9 ${vehOOR(form.gateTempGate08) ? "border-red-400 bg-red-50" : ""}`} />
                      <TempHint note="Max: +8°C at gate" />
                      {vehOOR(form.gateTempGate08) && <p className="text-xs text-red-600 mt-0.5 font-semibold">⚠ Exceeds +8°C</p>}
                      <OorAck show={vehOOR(form.gateTempGate08)} checked={form.ackGate08} onChange={(v) => sf("ackGate08", v)} label="Acknowledge" />
                      <FieldErr msg={errors.ackGate08} />
                    </div>
                    <div>
                      <Label className="text-xs">Time of Unloading</Label>
                      <Input type="time" value={form.unloadingTime} onChange={(e) => sf("unloadingTime", e.target.value)} className="mt-1 h-9" />
                      <TempHint note="Time when unloading begins at gate" />
                    </div>
                    <div>
                      <Label className="text-xs">Checked By (APT Executive)</Label>
                      <Select value={form.checkedByApt} onValueChange={(v) => sf("checkedByApt", v)}>
                        <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Select executive" /></SelectTrigger>
                        <SelectContent>{APT_EXECUTIVES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Protocol */}
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3.5">
                    <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mb-2">
                      <ShieldCheck className="h-3.5 w-3.5" /> Airport Receiving Protocol
                    </p>
                    <ul className="text-xs text-emerald-700 space-y-1">
                      <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-0.5">✔</span>Verify vehicle temperature at gate before unloading begins</li>
                      <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-0.5">✔</span>Check product seal integrity and packaging condition upon arrival</li>
                      <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-0.5">✔</span>Record unloading time accurately in the system</li>
                      <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-0.5">✔</span>APT executive must physically verify and countersign</li>
                      <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-0.5">✔</span>Any temperature breach must be escalated immediately</li>
                    </ul>
                  </div>

                  {/* Cold chain visual */}
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
                      <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-700 font-semibold">Catering Kitchen</span>
                      <span className="flex-1 border-t-2 border-dashed border-slate-300 relative">
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap">≤ +8°C</span>
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700 font-semibold">Airport Gate 08</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-3">Cold chain must be unbroken from kitchen to gate</p>
                  </div>

                  {/* ─ Receipt Log ─ */}
                  <Divider label="Receipt Log" color="emerald" />
                  <div className="rounded-lg bg-emerald-50/70 border border-emerald-200 p-3.5">
                    <p className="text-[11px] text-emerald-700 font-bold mb-2.5 flex items-center gap-1.5">
                      <PlaneLanding className="h-3.5 w-3.5" /> Received By (Airport)
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Name</Label>
                        <Select value={form.receiverName} onValueChange={(v) => sf("receiverName", v)}>
                          <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Select name" /></SelectTrigger>
                          <SelectContent>{APT_EXECUTIVES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Designation</Label>
                        <Select value={form.receiverDesignation} onValueChange={(v) => sf("receiverDesignation", v)}>
                          <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Select designation" /></SelectTrigger>
                          <SelectContent>{APT_DESIGNATIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Receipt date & time auto-recorded on save
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Save / Cancel */}
            <div className="mt-5 flex items-center justify-end gap-3 border-t border-border pt-4">
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 shadow-md" onClick={saveEntry}>
                <ShieldCheck className="h-4 w-4 mr-2" />
                {editId ? "Save Changes" : "Save Dispatch Entry"}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Delete confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Delete Dispatch Entry?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Delete entry for <span className="font-semibold text-foreground">{deleteTarget ? flightLabel(deleteTarget.flightId) : ""}</span>? This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

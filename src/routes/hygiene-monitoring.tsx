import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useRef } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Plus, Pencil, Trash2, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRole } from "@/lib/roles";

export const Route = createFileRoute("/hygiene-monitoring")({
  head: () => ({ meta: [{ title: "Daily Hygiene Monitoring" }] }),
  component: HygieneMonitoring,
});

// ── Dataset (unchanged) ────────────────────────────────────────────────────────
const CHECKLIST_ITEMS = [
  "All plastic curtains are in good position",
  "All aircutters are working properly",
  "Wastage has been disposed properly",
  "All cooking utensils are clean & good condition",
  "Any food item kept in danger zone",
  "All chiller/freezer/AC working properly",
  "Raw & cooked food kept separately in Kitchen/Chiller/freezer",
  "Maintaining FIFO properly in Kitchen/Chiller/Freezer/Pack/Bakery",
  "All open food are covered properly with Date code in Kitchen/Chiller/Freezer/Pack/Bakery",
  "Any expired/spoiled product found Kitchen/Chiller/Freezer/Pack/Bakery",
  "Any Cooked food, RM/PM are kept directly on the floor",
  "Packaging room temp. is below 15°C",
  "Date code check in packaging room",
  "Meal PKT Holding inside packaging room (Max. 10 Baskets)",
  "Presence of any pest/insects",
];

const TIME_SLOTS = ["6:00AM", "8:00AM", "10:00AM", "12:00PM", "2:00PM", "4:00PM", "6:00PM", "8:00PM", "10:00PM"];

const AUTHORIZED_PERSONNEL = [
  "Manager — Catering Operations",
  "Consultant — Food Safety",
  "QC Manager",
  "Head of Operations",
];

// ── Types ─────────────────────────────────────────────────────────────────────
type CellValue = "—" | "✓" | "✗";

type ChecklistRow = {
  id: string;
  item: string;
  values: Record<string, CellValue>;
  remarks: string;
};

type SlotSave = { savedAt: string; savedBy: string };

type LogEntry = {
  id: string;
  date: string;
  submittedBy: string;
  submittedAt: string;
  failCount: number;
  failItems: string[];
  rows: ChecklistRow[];
  slots: string[];
  authorizedBy?: string;
  authorizedAt?: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeRows(items: string[], slots: string[]): ChecklistRow[] {
  return items.map((item) => ({
    id: `r-${Math.random().toString(36).slice(2)}`,
    item,
    values: Object.fromEntries(slots.map((t) => [t, "—" as CellValue])),
    remarks: "",
  }));
}

function parseSlotMinutes(slot: string): number {
  const isPM = slot.endsWith("PM");
  const clean = slot.replace(/[AP]M$/, "");
  const parts = clean.split(":");
  const h = parseInt(parts[0]);
  const m = parts[1] ? parseInt(parts[1]) : 0;
  let hour = h;
  if (isPM && h !== 12) hour = h + 12;
  if (!isPM && h === 12) hour = 0;
  return hour * 60 + m;
}

function insertSlotSorted(slots: string[], newSlot: string): string[] {
  const newMin = parseSlotMinutes(newSlot);
  const idx = slots.findIndex((s) => parseSlotMinutes(s) > newMin);
  return idx === -1 ? [...slots, newSlot] : [...slots.slice(0, idx), newSlot, ...slots.slice(idx)];
}

function cycleCell(v: CellValue): CellValue {
  return v === "—" ? "✓" : v === "✓" ? "✗" : "—";
}

function cellCls(v: CellValue, locked: boolean, missed: boolean): string {
  if (missed) return "bg-amber-50 cursor-not-allowed";
  if (locked) {
    if (v === "✓") return "bg-green-100 cursor-default";
    if (v === "✗") return "bg-red-100 cursor-default";
    return "bg-muted/40 cursor-default";
  }
  if (v === "✓") return "bg-green-50 hover:bg-green-100 cursor-pointer";
  if (v === "✗") return "bg-red-50 hover:bg-red-100 cursor-pointer";
  return "hover:bg-muted cursor-pointer";
}

function cellContent(v: CellValue, missed: boolean) {
  if (missed) return <Lock className="h-3.5 w-3.5 text-amber-400" />;
  if (v === "✓") return <span className="text-green-700 font-bold text-base select-none">✓</span>;
  if (v === "✗") return <span className="text-red-700 font-bold text-base select-none">✗</span>;
  return <span className="text-muted-foreground select-none">—</span>;
}

// ── Component ─────────────────────────────────────────────────────────────────
function HygieneMonitoring() {
  const { role } = useRole();
  const todayStr = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [allSlots, setAllSlots] = useState<string[]>([...TIME_SLOTS]);
  const [editRows, setEditRows] = useState<ChecklistRow[]>(() => makeRows([...CHECKLIST_ITEMS], [...TIME_SLOTS]));
  const [savedSlots, setSavedSlots] = useState<Record<string, SlotSave>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [authPanelVisible, setAuthPanelVisible] = useState(false);
  const [currentLogId, setCurrentLogId] = useState<string | null>(null);

  // Modal open state
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [editRowOpen, setEditRowOpen] = useState(false);
  const [deleteRowOpen, setDeleteRowOpen] = useState(false);
  const [saveDraftOpen, setSaveDraftOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [viewLogOpen, setViewLogOpen] = useState(false);

  // Form fields
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemSlot, setNewItemSlot] = useState("");
  const [editRowIdx, setEditRowIdx] = useState<number | null>(null);
  const [editRowDesc, setEditRowDesc] = useState("");
  const [editRowSlot, setEditRowSlot] = useState("");
  const [deleteRowIdx, setDeleteRowIdx] = useState<number | null>(null);
  const [draftSlotPick, setDraftSlotPick] = useState("");
  const [authName, setAuthName] = useState("");
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [remarkErrors, setRemarkErrors] = useState<Set<number>>(new Set());

  // ── Computed ─────────────────────────────────────────────────────────────
  const missedSlots = useMemo<Set<string>>(() => {
    if (selectedDate !== todayStr) return new Set();
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    return new Set(
      allSlots.filter((slot) => {
        if (savedSlots[slot]) return false;
        return nowMin > parseSlotMinutes(slot) + 60;
      })
    );
  }, [selectedDate, todayStr, allSlots, savedSlots]);

  const availableToSave = useMemo(
    () => allSlots.filter((slot) => !savedSlots[slot] && !missedSlots.has(slot)),
    [allSlots, savedSlots, missedSlots]
  );

  const allSlotsFinalized = useMemo(
    () => allSlots.length > 0 && allSlots.every((slot) => savedSlots[slot] || missedSlots.has(slot)),
    [allSlots, savedSlots, missedSlots]
  );

  const failureSummary = useMemo(() => {
    const items: string[] = [];
    let count = 0;
    editRows.forEach((row) => {
      const fails = allSlots.filter((s) => row.values[s] === "✗").length;
      if (fails > 0) { items.push(row.item); count += fails; }
    });
    return { items, count };
  }, [editRows, allSlots]);

  const currentDateLog = useMemo(
    () => logs.find((l) => l.date === selectedDate && l.id === currentLogId) ?? null,
    [logs, selectedDate, currentLogId]
  );

  const rangedLogs = useMemo(
    () => logs.filter((l) => l.date >= selectedDate && l.date <= endDate).sort((a, b) => a.date.localeCompare(b.date)),
    [logs, selectedDate, endDate]
  );

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleCellClick = (rowIdx: number, slot: string) => {
    if (savedSlots[slot] || missedSlots.has(slot) || isSubmitted) return;
    setEditRows((prev) =>
      prev.map((row, i) =>
        i === rowIdx ? { ...row, values: { ...row.values, [slot]: cycleCell(row.values[slot]) } } : row
      )
    );
    setRemarkErrors(new Set());
  };

  const updateRemarks = (rowIdx: number, val: string) => {
    if (isSubmitted) return;
    setEditRows((prev) => prev.map((row, i) => (i === rowIdx ? { ...row, remarks: val } : row)));
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setAllSlots([...TIME_SLOTS]);
    setEditRows(makeRows([...CHECKLIST_ITEMS], [...TIME_SLOTS]));
    setSavedSlots({});
    setIsSubmitted(false);
    setAuthPanelVisible(false);
    setCurrentLogId(null);
    setRemarkErrors(new Set());
  };

  // Add item (optionally with a new time slot)
  const saveNewItem = () => {
    const desc = newItemDesc.trim();
    if (!desc) { toast.error("Description is required."); return; }

    let slots = allSlots;
    if (newItemSlot) {
      const [hStr, mStr] = newItemSlot.split(":");
      const h = parseInt(hStr);
      const m = (mStr || "00").padStart(2, "0");
      const period = h >= 12 ? "PM" : "AM";
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const slotLabel = `${h12}:${m}${period}`;
      if (!allSlots.includes(slotLabel)) {
        slots = insertSlotSorted(allSlots, slotLabel);
        setAllSlots(slots);
        setEditRows((prev) =>
          prev.map((row) => ({ ...row, values: { ...row.values, [slotLabel]: "—" as CellValue } }))
        );
      }
    }

    const newRow: ChecklistRow = {
      id: `r-${Date.now()}`,
      item: desc,
      values: Object.fromEntries(slots.map((t) => [t, "—" as CellValue])),
      remarks: "",
    };
    setEditRows((prev) => [...prev, newRow]);
    setNewItemDesc("");
    setNewItemSlot("");
    setAddItemOpen(false);
    toast.success("Checklist item added.");
  };

  // Edit row
  const openEditRow = (idx: number) => {
    setEditRowIdx(idx);
    setEditRowDesc(editRows[idx].item);
    setEditRowSlot("");
    setEditRowOpen(true);
  };
  const saveEditRow = () => {
    const desc = editRowDesc.trim();
    if (!desc) { toast.error("Description is required."); return; }

    let slots = allSlots;
    if (editRowSlot) {
      const [hStr, mStr] = editRowSlot.split(":");
      const h = parseInt(hStr);
      const m = (mStr || "00").padStart(2, "0");
      const period = h >= 12 ? "PM" : "AM";
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const slotLabel = `${h12}:${m}${period}`;
      if (!allSlots.includes(slotLabel)) {
        slots = insertSlotSorted(allSlots, slotLabel);
        setAllSlots(slots);
        setEditRows((prev) =>
          prev.map((row) => ({ ...row, values: { ...row.values, [slotLabel]: "—" as CellValue } }))
        );
      }
    }

    setEditRows((prev) => prev.map((row, i) => (i === editRowIdx ? { ...row, item: desc } : row)));
    setEditRowOpen(false);
    toast.success("Checklist item updated.");
  };

  // Delete row
  const openDeleteRow = (idx: number) => { setDeleteRowIdx(idx); setDeleteRowOpen(true); };
  const confirmDeleteRow = () => {
    setEditRows((prev) => prev.filter((_, i) => i !== deleteRowIdx));
    setDeleteRowOpen(false);
    toast.success("Checklist item removed.");
  };

  // Save Draft
  const openSaveDraft = () => {
    if (availableToSave.length === 0) { toast.info("No unsaved slots available."); return; }
    setDraftSlotPick(availableToSave[0]);
    setSaveDraftOpen(true);
  };
  const confirmSaveDraft = () => {
    const slot = draftSlotPick;
    const errors = new Set<number>();
    editRows.forEach((row, i) => {
      if (row.values[slot] === "✗" && !row.remarks.trim()) errors.add(i);
    });
    if (errors.size > 0) {
      setRemarkErrors(errors);
      setSaveDraftOpen(false);
      toast.error("Remark required for all failed items before saving.");
      return;
    }
    const now = new Date();
    const savedAt = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    setSavedSlots((prev) => ({ ...prev, [slot]: { savedAt, savedBy: role } }));
    setSaveDraftOpen(false);
    toast.success(`✅ Draft saved — ${slot} slot recorded at ${savedAt}`);
  };

  // Confirm & Submit
  const confirmSubmit = () => {
    const now = new Date();
    const submittedAt = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const logId = `LOG-${Date.now()}`;
    const logEntry: LogEntry = {
      id: logId,
      date: selectedDate,
      submittedBy: role,
      submittedAt,
      failCount: failureSummary.count,
      failItems: failureSummary.items,
      rows: editRows.map((r) => ({ ...r, values: { ...r.values } })),
      slots: [...allSlots],
    };
    setLogs((prev) => [logEntry, ...prev]);
    setCurrentLogId(logId);
    setIsSubmitted(true);
    setSubmitOpen(false);
    setAuthPanelVisible(true);
    toast.success("Checklist submitted successfully.");
  };

  const handleAuthorize = () => {
    if (!authName) { toast.error("Please select an authorized person."); return; }
    const now = new Date();
    const at = `${selectedDate} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    setLogs((prev) =>
      prev.map((log) =>
        log.id === currentLogId ? { ...log, authorizedBy: authName, authorizedAt: at } : log
      )
    );
    setAuthPanelVisible(false);
    toast.success(`Authorized by ${authName}.`);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <PageHeader
        title="Daily Food Safety & Hygiene Monitoring"
        subtitle="USBA-FSH-DFSHM-01 — Record checklist status for each time slot per day"
        actions={
          <div className="flex gap-2 flex-wrap">
            {!isSubmitted && (
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => { setNewItemDesc(""); setNewItemSlot(""); setAddItemOpen(true); }}
              >
                <Plus className="h-4 w-4 mr-1" /> Add New
              </Button>
            )}
            {!isSubmitted && !allSlotsFinalized && (
              <Button
                className="bg-amber-500 hover:bg-amber-600 text-white"
                onClick={openSaveDraft}
              >
                <ClipboardCheck className="h-4 w-4 mr-1" /> Save Draft
              </Button>
            )}
            {!isSubmitted && allSlotsFinalized && (
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setSubmitOpen(true)}>
                <ClipboardCheck className="h-4 w-4 mr-1" /> Confirm & Submit
              </Button>
            )}
          </div>
        }
      />

      {/* Instruction + Legend */}
      <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm">
        <div className="mb-2 space-y-1">
          <p className="text-[13px] font-medium text-blue-800">
            How to fill this checklist:
          </p>
          <p className="text-[12.5px] text-blue-700">
            <span className="font-semibold">Step 1 —</span> At each scheduled time, mark every item as Pass (✓) or Fail (✗), then click <span className="font-semibold">Save Draft</span> to lock that time slot.
          </p>
          <p className="text-[12.5px] text-blue-700">
            <span className="font-semibold">Step 2 —</span> After the last time slot of the day is saved, click <span className="font-semibold">Confirm & Submit</span> to record the final checklist for the day.
          </p>
        </div>
        <div className="flex items-center gap-5 text-xs flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="inline-flex w-6 h-6 items-center justify-center rounded bg-green-100 text-green-700 font-bold text-base">✓</span>
            <span><span className="font-semibold">1st click</span> — Pass</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-flex w-6 h-6 items-center justify-center rounded bg-red-100 text-red-700 font-bold text-base">✗</span>
            <span><span className="font-semibold">2nd click</span> — Fail</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-flex w-6 h-6 items-center justify-center rounded bg-muted text-muted-foreground">—</span>
            Not Checked
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-flex w-6 h-6 items-center justify-center rounded bg-amber-50">
              <Lock className="h-3.5 w-3.5 text-amber-400" />
            </span>
            Missed
          </span>
        </div>
      </div>

      {/* Date range picker */}
      <div className="mb-4 flex items-end gap-4 flex-wrap">
        <div>
          <Label className="text-xs mb-1 block">From</Label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              handleDateChange(e.target.value);
              if (e.target.value > endDate) setEndDate(e.target.value);
            }}
            className="w-44"
          />
        </div>
        <div>
          <Label className="text-xs mb-1 block">To</Label>
          <Input
            type="date"
            value={endDate}
            min={selectedDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-44"
          />
        </div>
        <span className="text-xs pb-2">
          {isSubmitted ? (
            <span className="text-green-600 font-medium">✅ Checklist submitted</span>
          ) : Object.keys(savedSlots).length > 0 ? (
            <span className="text-muted-foreground">{Object.keys(savedSlots).length}/{allSlots.length} slots draft-saved</span>
          ) : null}
        </span>
      </div>

      {/* Checklist Table */}
      <div className="rounded-xl border border-border bg-card overflow-x-auto mb-6">
        <table className="w-full text-sm border-collapse" style={{ minWidth: 1100 }}>
          <thead>
            <tr className="bg-muted/60 border-b border-border">
              <th className="text-center px-3 py-2.5 font-semibold w-10 text-xs">SL</th>
              <th className="text-left px-3 py-2.5 font-semibold" style={{ minWidth: 280 }}>Checklist</th>
              {allSlots.map((t) => {
                const saved = savedSlots[t];
                const missed = missedSlots.has(t);
                return (
                  <th key={t} className="text-center px-1 py-2 font-semibold whitespace-nowrap text-xs" style={{ minWidth: 76 }}>
                    <div className="flex flex-col items-center gap-0.5">
                      <span>{t}</span>
                      {saved && <span className="text-green-600 text-[9px] font-normal">✅ {saved.savedAt}</span>}
                    </div>
                  </th>
                );
              })}
              <th className="text-left px-3 py-2.5 font-semibold text-xs" style={{ minWidth: 140 }}>Remarks</th>
              <th className="text-center px-3 py-2.5 font-semibold text-xs" style={{ minWidth: 90 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {editRows.map((row, i) => {
              const hasFailure = allSlots.some((s) => row.values[s] === "✗");
              const hasRemarkError = remarkErrors.has(i);
              return (
                <tr key={row.id} className="border-b border-border hover:bg-muted/20">
                  <td className="px-3 py-1.5 text-center text-muted-foreground text-xs">{i + 1}</td>
                  <td className="px-3 py-1.5 text-[13px] leading-snug">{row.item}</td>
                  {allSlots.map((t) => {
                    const locked = !!savedSlots[t] || isSubmitted;
                    const missed = missedSlots.has(t);
                    const v = row.values[t];
                    return (
                      <td key={t} className="text-center px-1 py-1">
                        <button
                          type="button"
                          disabled={locked || missed || isSubmitted}
                          onClick={() => handleCellClick(i, t)}
                          className={`w-8 h-8 rounded flex items-center justify-center mx-auto transition-colors ${cellCls(v, locked || isSubmitted, missed)}`}
                          title={locked ? "Slot saved — locked" : missed ? "Slot missed" : "Click: Pass → Fail → Reset"}
                        >
                          {cellContent(v, missed)}
                        </button>
                      </td>
                    );
                  })}
                  <td className={`px-2 py-1.5 ${hasFailure ? "bg-amber-50/60" : ""}`}>
                    <div>
                      <input
                        type="text"
                        value={row.remarks}
                        onChange={(e) => updateRemarks(i, e.target.value)}
                        disabled={isSubmitted}
                        className={`w-full border rounded px-2 py-1 text-xs bg-background focus:outline-none focus:ring-1 focus:ring-ring ${
                          hasRemarkError
                            ? "border-red-400 bg-red-50"
                            : hasFailure
                            ? "border-amber-300 bg-amber-50 placeholder:text-amber-600"
                            : "border-border"
                        }`}
                        placeholder={hasFailure ? "Required for failures" : "—"}
                      />
                      {hasRemarkError && (
                        <p className="text-[10px] text-red-600 mt-0.5">Remark required</p>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-1.5 text-center">
                    {!isSubmitted && (
                      <div className="flex items-center gap-1 justify-center">
                        <Button
                          size="sm" variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => openEditRow(i)}
                          title="Edit item"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm" variant="ghost"
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                          onClick={() => openDeleteRow(i)}
                          title="Delete item"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex justify-between items-center px-4 py-2.5 border-t border-border bg-muted/20 text-xs text-muted-foreground">
          <span>Verified By — Executive (Food Safety &amp; Hygiene)</span>
          <span>Authorized By — Manager/Consultant (Catering)</span>
        </div>
      </div>

      {/* Logs List — date range */}
      {rangedLogs.length > 0 && (
        <div className="mb-4 space-y-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Submitted Reports ({rangedLogs.length})
          </div>
          {rangedLogs.map((log) => (
            <div key={log.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm">📋 {log.date}</span>
                <Button
                  size="sm" variant="outline"
                  onClick={() => { setSelectedLog(log); setViewLogOpen(true); }}
                >
                  View Full Record
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                Submitted by:{" "}
                <span className="font-medium text-foreground">{log.submittedBy}</span>
                {" "}— {log.submittedAt}
              </div>
              <div className="text-xs mt-1">
                Status:{" "}
                {log.failCount === 0 ? (
                  <span className="text-green-600 font-medium">All items passed ✅</span>
                ) : (
                  <span className="text-red-600 font-medium">
                    {log.failCount} failure{log.failCount !== 1 ? "s" : ""} recorded
                    {log.failItems.length > 0 && (
                      <span className="text-muted-foreground font-normal">
                        {" "}(Items: {log.failItems.slice(0, 2).join(", ")}
                        {log.failItems.length > 2 ? ` +${log.failItems.length - 2} more` : ""})
                      </span>
                    )}
                  </span>
                )}
              </div>
              {log.authorizedBy && (
                <div className="text-xs text-muted-foreground mt-1">
                  Authorized by:{" "}
                  <span className="font-medium text-foreground">{log.authorizedBy}</span>
                  {" "}— {log.authorizedAt}
                </div>
              )}
            </div>
          ))}
        </div>
      )}


      {/* ── Modals ─────────────────────────────────────────────────────────── */}

      {/* Add New Item */}
      <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add New Checklist Item</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Checklist Item Description *</Label>
              <Input
                value={newItemDesc}
                onChange={(e) => setNewItemDesc(e.target.value)}
                placeholder="Enter description"
                className="mt-1"
                onKeyDown={(e) => e.key === "Enter" && saveNewItem()}
              />
            </div>
            <div>
              <Label>Time Schedule <span className="text-muted-foreground font-normal">(Optional)</span></Label>
              <p className="text-xs text-muted-foreground mb-1">Select a time to also add a new inspection time slot for this item.</p>
              <Input
                type="time"
                value={newItemSlot}
                onChange={(e) => setNewItemSlot(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddItemOpen(false)}>Cancel</Button>
            <Button onClick={saveNewItem}>Save Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item */}
      <Dialog open={editRowOpen} onOpenChange={setEditRowOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Checklist Item</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Item Description *</Label>
              <Input
                value={editRowDesc}
                onChange={(e) => setEditRowDesc(e.target.value)}
                className="mt-1"
                onKeyDown={(e) => e.key === "Enter" && saveEditRow()}
              />
            </div>
            <div>
              <Label>Add Time Schedule <span className="text-muted-foreground font-normal">(Optional)</span></Label>
              <p className="text-xs text-muted-foreground mb-1">Select a time to also add a new inspection time slot.</p>
              <Input
                type="time"
                value={editRowSlot}
                onChange={(e) => setEditRowSlot(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRowOpen(false)}>Cancel</Button>
            <Button onClick={saveEditRow}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteRowOpen} onOpenChange={setDeleteRowOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Delete Checklist Item?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this checklist item?
            This will also remove all recorded data for this item.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteRowOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteRow}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Draft — Slot Picker */}
      <Dialog open={saveDraftOpen} onOpenChange={setSaveDraftOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Save Draft — Select Time Slot</DialogTitle></DialogHeader>
          <div>
            <Label>Time slot to lock</Label>
            <Select value={draftSlotPick} onValueChange={setDraftSlotPick}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select slot" />
              </SelectTrigger>
              <SelectContent>
                {availableToSave.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              This will lock the selected slot. All cells for that time column will become read-only.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDraftOpen(false)}>Cancel</Button>
            <Button onClick={confirmSaveDraft}>Save Draft</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm & Submit */}
      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Submit Today's Checklist?</DialogTitle></DialogHeader>
          <div className="text-sm space-y-3">
            <p className="text-muted-foreground">All {allSlots.length} time slots completed.</p>
            {failureSummary.count === 0 ? (
              <p className="text-green-600 font-medium">All items passed ✅</p>
            ) : (
              <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2">
                <p className="text-red-700 font-medium">
                  {failureSummary.count} failure{failureSummary.count !== 1 ? "s" : ""} recorded
                </p>
                <p className="text-red-600 text-xs mt-1">
                  Items: {failureSummary.items.slice(0, 3).join(", ")}
                  {failureSummary.items.length > 3 && ` +${failureSummary.items.length - 3} more`}
                </p>
              </div>
            )}
            <p className="text-xs text-muted-foreground border-t pt-2">
              Once submitted, the checklist will be locked and cannot be edited.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitOpen(false)}>Cancel</Button>
            <Button onClick={confirmSubmit}>Confirm & Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Full Record */}
      <Dialog open={viewLogOpen} onOpenChange={setViewLogOpen}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Full Record — {selectedLog?.date}</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <>
            <div className="overflow-x-auto">
              <div className="text-xs text-muted-foreground mb-3">
                Submitted by {selectedLog.submittedBy} at {selectedLog.submittedAt}
                {selectedLog.authorizedBy && (
                  <span> · Authorized by {selectedLog.authorizedBy} — {selectedLog.authorizedAt}</span>
                )}
              </div>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/60">
                    <th className="p-2 text-left font-semibold border">SL</th>
                    <th className="p-2 text-left font-semibold border" style={{ minWidth: 220 }}>Checklist Item</th>
                    {selectedLog.slots.map((s) => (
                      <th key={s} className="p-2 text-center font-semibold border whitespace-nowrap">{s}</th>
                    ))}
                    <th className="p-2 text-left font-semibold border">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedLog.rows.map((row, i) => (
                    <tr key={row.id} className="border-b hover:bg-muted/20">
                      <td className="p-2 text-center text-muted-foreground border">{i + 1}</td>
                      <td className="p-2 border">{row.item}</td>
                      {selectedLog.slots.map((s) => (
                        <td
                          key={s}
                          className={`p-2 text-center font-bold border ${
                            row.values[s] === "✓" ? "text-green-700 bg-green-50" :
                            row.values[s] === "✗" ? "text-red-700 bg-red-50" :
                            "text-muted-foreground"
                          }`}
                        >
                          {row.values[s]}
                        </td>
                      ))}
                      <td className="p-2 text-muted-foreground border">{row.remarks || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs space-y-1">
              <div className="font-semibold text-muted-foreground uppercase tracking-wide mb-2 text-[10px]">Verified By</div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground w-24">Name:</span>
                <span className="font-medium text-foreground">{selectedLog.submittedBy}</span>
                <span className="text-muted-foreground ml-1">— Executive (Food Safety &amp; Hygiene)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground w-24">Date:</span>
                <span className="font-medium text-foreground">{selectedLog.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground w-24">Timestamp:</span>
                <span className="font-medium text-foreground">{selectedLog.submittedAt}</span>
              </div>
            </div>
            </>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewLogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

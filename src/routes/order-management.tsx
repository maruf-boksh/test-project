import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { DataTable, type Column } from "@/components/common/DataTable";
import { RowActions } from "@/components/common/RowActions";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Plus, Upload, Download, Save, FileSpreadsheet, FileText, FileType,
  History, CheckCircle2, AlertCircle, Eye,
} from "lucide-react";
import { toast } from "sonner";
import { recentUploads, seedFlightOrders } from "@/lib/sample-data";

export const Route = createFileRoute("/order-management")({
  head: () => ({ meta: [{ title: "Order Management" }] }),
  component: OrderManagementPage,
});

type FlightOrder = {
  id: string;
  flight: string;
  airline: string;
  sector: string;
  date: string;
  etd: string;
  pax: number;
  crew: number;
  specialMeals: number;
  status: string;
};

const AIRLINES = ["US-Bangla", "Air Astra"];
const AIRPORTS: { code: string; name: string }[] = [
  { code: "DAC", name: "Dhaka" },
  { code: "CXB", name: "Cox's Bazar" },
  { code: "CGP", name: "Chattogram" },
  { code: "ZYL", name: "Sylhet" },
  { code: "JSR", name: "Jashore" },
  { code: "DXB", name: "Dubai" },
  { code: "DOH", name: "Doha" },
  { code: "LHR", name: "London Heathrow" },
  { code: "KUL", name: "Kuala Lumpur" },
  { code: "BKK", name: "Bangkok" },
  { code: "SIN", name: "Singapore" },
  { code: "CCU", name: "Kolkata" },
  { code: "DEL", name: "Delhi" },
  { code: "KTM", name: "Kathmandu" },
];

const seedOrders: FlightOrder[] = seedFlightOrders;

type ParsedRow = {
  row: number;
  id: string;
  flight: string;
  airline: string;
  sector: string;
  etd: string;
  pax: number;
  specialMeals: number;
  valid: boolean;
};

const SAMPLE_PARSED: ParsedRow[] = [
  { row: 1, id: "ORD-3501", flight: "BS-141", airline: "US-Bangla", sector: "DAC → CXB", etd: "08:15", pax: 72,  specialMeals: 4,  valid: true  },
  { row: 2, id: "ORD-3502", flight: "BS-225", airline: "US-Bangla", sector: "DAC → SIN", etd: "12:30", pax: 174, specialMeals: 14, valid: true  },
  { row: 3, id: "ORD-3503", flight: "BG-???", airline: "Air Astra", sector: "DAC → KTM", etd: "15:00", pax: 0,   specialMeals: 0,  valid: false },
  { row: 4, id: "ORD-3504", flight: "VQ-405", airline: "NovoAir",   sector: "DAC → CCU", etd: "17:45", pax: 96,  specialMeals: 6,  valid: true  },
];

const DAY_MEAL_PLAN = [
  { key: "day1", label: "Day 1 (24h)", date: "2026-05-20", meals: 462 },
  { key: "day2", label: "Day 2 (24h)", date: "2026-05-21", meals: 520 },
  { key: "day3", label: "Day 3 (24h)", date: "2026-05-22", meals: 498 },
  { key: "day4", label: "Day 4 (24h)", date: "2026-05-23", meals: 446 },
];

type MealPlan = Record<string, number>;
type ActivityEntry = { message: string; user: string; role: string; at: string };
type RecentUploadRow = (typeof recentUploads)[number];

function OrderManagementPage() {
  const [orders, setOrders] = useState<FlightOrder[]>(seedOrders);
  const [view, setView] = useState<"list" | "create" | "bulk">("list");
  const [selectedOrder, setSelectedOrder] = useState<FlightOrder | null>(null);

  const addOrder = (order: FlightOrder) => {
    setOrders((prev) => [order, ...prev]);
    setView("list");
  };

  const addOrdersBulk = (newOrders: FlightOrder[]) => {
    setOrders((prev) => [...newOrders, ...prev]);
    setView("list");
  };

  const pendingCount = orders.filter((o) => o.status === "Pending").length;

  return (
    <>
      <PageHeader
        title="Order Management"
        subtitle="Create, import and track flight orders"
        actions={
          view === "list" ? (
            <>
              <Button variant="outline" onClick={() => setView("bulk")}>
                <Upload className="h-4 w-4 mr-1" /> Bulk Upload
              </Button>
              <Button onClick={() => setView("create")}>
                <Plus className="h-4 w-4 mr-1" /> Create Order
              </Button>
            </>
          ) : (
            <Button onClick={() => setView("list")}>View List</Button>
          )
        }
      />

      {view === "list" && (
        <OrdersList orders={orders} pendingCount={pendingCount} onView={setSelectedOrder} />
      )}
      {view === "create" && <OrderCreate onSave={addOrder} nextNumber={orders.length + 3411} />}
      {view === "bulk" && <BulkUpload onImport={addOrdersBulk} />}

      <FlightOrderDetailsDialog
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </>
  );
}

function OrdersList({
  orders, pendingCount, onView,
}: {
  orders: FlightOrder[];
  pendingCount: number;
  onView: (o: FlightOrder) => void;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground">
            Flight Orders — Today
          </h3>
          {pendingCount > 0 && (
            <Badge className="bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/10">
              <span className="h-1.5 w-1.5 rounded-full bg-destructive mr-1.5" />
              {pendingCount} Pending
            </Badge>
          )}
        </div>

        <div className="border border-border rounded-md overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-xs uppercase tracking-wider">Order #</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Flight</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Airline</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Sector</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">ETD</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-right">PAX</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-right">Spec. Meals</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-8">
                    No flight orders yet.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((o) => (
                  <TableRow key={o.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs">{o.id}</TableCell>
                    <TableCell className="font-medium">{o.flight}</TableCell>
                    <TableCell>{o.airline}</TableCell>
                    <TableCell>{o.sector}</TableCell>
                    <TableCell>{o.etd}</TableCell>
                    <TableCell className="text-right tabular-nums">{o.pax}</TableCell>
                    <TableCell className="text-right tabular-nums">{o.specialMeals}</TableCell>
                    <TableCell><StatusBadge status={o.status} /></TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2.5 text-xs"
                        onClick={() => onView(o)}
                      >
                        <Eye className="h-3 w-3 mr-1" /> View
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
  );
}

const selectCls =
  "w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

function OrderCreate({
  onSave, nextNumber,
}: { onSave: (o: FlightOrder) => void; nextNumber: number }) {
  const [flight, setFlight] = useState("");
  const [airline, setAirline] = useState(AIRLINES[0]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [etd, setEtd] = useState("");
  const [pax, setPax] = useState("");
  const [specialMeals, setSpecialMeals] = useState("");

  const handleSave = () => {
    if (!flight.trim()) { toast.error("Flight number is required."); return; }
    if (!from || !to) { toast.error("Sector (From → To) is required."); return; }
    if (from === to) { toast.error("From and To must be different airports."); return; }
    const paxNum = Number(pax);
    if (!paxNum || paxNum <= 0) { toast.error("PAX must be greater than zero."); return; }
    const smNum = Number(specialMeals) || 0;

    const newOrder: FlightOrder = {
      id: `ORD-${nextNumber}`,
      flight: flight.trim().toUpperCase(),
      airline,
      sector: `${from} → ${to}`,
      date: new Date().toISOString().slice(0, 10),
      etd: etd || "—",
      pax: paxNum,
      crew: 16,
      specialMeals: smNum,
      status: "Pending",
    };
    onSave(newOrder);
    toast.success(`${newOrder.id} created.`);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground">
            Create Flight Order
          </h3>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-1.5" /> Save
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Flight Number <span className="text-destructive">*</span>
            </Label>
            <Input
              value={flight}
              onChange={(e) => setFlight(e.target.value)}
              placeholder="e.g. BS-203"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Airline
            </Label>
            <select
              value={airline}
              onChange={(e) => setAirline(e.target.value)}
              className={selectCls}
            >
              {AIRLINES.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              From <span className="text-destructive">*</span>
            </Label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className={selectCls}
            >
              <option value="">Select origin</option>
              {AIRPORTS.map((a) => (
                <option key={a.code} value={a.code}>{a.code} — {a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              To <span className="text-destructive">*</span>
            </Label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className={selectCls}
            >
              <option value="">Select destination</option>
              {AIRPORTS.map((a) => (
                <option key={a.code} value={a.code}>{a.code} — {a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              ETD
            </Label>
            <Input
              type="time"
              value={etd}
              onChange={(e) => setEtd(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              PAX <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              min={0}
              value={pax}
              onChange={(e) => setPax(e.target.value)}
              placeholder="0"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Special Meals
            </Label>
            <Input
              type="number"
              min={0}
              value={specialMeals}
              onChange={(e) => setSpecialMeals(e.target.value)}
              placeholder="0"
              className="mt-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BulkUpload({ onImport }: { onImport: (orders: FlightOrder[]) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [parsed, setParsed] = useState<ParsedRow[]>(SAMPLE_PARSED);
  const [mealOrder, setMealOrder] = useState<MealPlan>({ day1: 0, day2: 0, day3: 0, day4: 0 });
  const [orderVisible, setOrderVisible] = useState(false);
  const [forwarded, setForwarded] = useState(false);
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([
    { message: "Bulk upload ready for validation", user: "ops.user", role: "Flight Ops", at: "2026-05-19 06:12" },
  ]);

  const addLog = (message: string) => {
    const now = new Date();
    setActivityLog((current) => [
      { message, user: "GM/Admin", role: "General Manager", at: `${now.toLocaleDateString()} ${now.toLocaleTimeString()}` },
      ...current,
    ]);
  };

  const start = (f: File) => {
    setFile(f);
    setDone(false);
    setForwarded(false);
    setOrderVisible(false);
    setParsed(SAMPLE_PARSED);
    setProgress(0);
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(t);
          setDone(true);
          toast.success("File parsed — review and confirm import.");
          addLog("Bulk orders file parsed and validated");
          return 100;
        }
        return p + 10;
      });
    }, 100);
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) start(f);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0]; if (f) start(f);
  };

  const updateParsedField = (rowNum: number, field: keyof ParsedRow, value: string) => {
    setParsed((prev) =>
      prev.map((r) => (r.row === rowNum ? { ...r, [field]: value } : r)),
    );
  };

  const confirmImport = () => {
    const valid = parsed.filter((r) => r.valid);
    const today = new Date().toISOString().slice(0, 10);
    const orders: FlightOrder[] = valid.map((r) => ({
      id: r.id,
      flight: r.flight,
      airline: r.airline,
      sector: r.sector,
      date: today,
      etd: r.etd,
      pax: r.pax,
      crew: 16,
      specialMeals: r.specialMeals,
      status: "Pending",
    }));
    onImport(orders);
    addLog(`Confirmed import of ${orders.length} orders`);
    toast.success(`${orders.length} orders imported. ${parsed.length - valid.length} skipped.`);
  };

  const validCount = parsed.filter((r) => r.valid).length;
  const invalidCount = parsed.length - validCount;

  const uploadCols: Column<RecentUploadRow>[] = [
    { key: "id", header: "Upload ID" },
    { key: "file", header: "File" },
    { key: "rows", header: "Rows" },
    { key: "valid", header: "Valid" },
    { key: "errors", header: "Errors", render: (r) => <span className={r.errors > 0 ? "text-destructive font-medium" : ""}>{r.errors}</span> },
    { key: "by", header: "Uploaded By" },
    { key: "at", header: "Date" },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground">
              Bulk Upload
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => toast.success("Sample template downloaded.")}>
                <Download className="h-3.5 w-3.5 mr-1.5" /> Sample Template
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <History className="h-3.5 w-3.5 mr-1.5" /> Upload History
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  {recentUploads.map((u) => (
                    <DropdownMenuItem key={u.id} className="flex justify-between">
                      <span className="truncate">{u.file}</span>
                      <span className="text-xs text-muted-foreground ml-2">{u.at.split(" ")[0]}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" /> Excel
              </Button>
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                <FileText className="h-3.5 w-3.5 mr-1.5" /> CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                <FileType className="h-3.5 w-3.5 mr-1.5" /> DOC
              </Button>
            </div>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv,.doc,.docx"
            hidden
            onChange={onPick}
          />

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className="rounded-lg border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-transparent py-12 text-center"
          >
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 grid place-items-center mb-4">
              <FileSpreadsheet className="h-8 w-8 text-primary" />
            </div>
            <h4 className="text-base font-semibold">Drag & Drop Orders File</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Supported formats: .xlsx, .xls, .csv, .doc, .docx — Max 50 MB
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <Button onClick={() => fileRef.current?.click()}>
                <Upload className="h-4 w-4 mr-1" /> Select File
              </Button>
              <Button variant="outline">View Spec</Button>
            </div>

            {file && (
              <div className="mt-6 max-w-md mx-auto text-left">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium truncate">{file.name}</span>
                  <span className="text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} />
                <div className="mt-2 flex items-center gap-2 text-xs">
                  {done ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      Parsed. {validCount}/{parsed.length} rows valid.
                    </>
                  ) : (
                    <>Parsing file, validating fields...</>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {done && (
        <>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground">
                  Preview & Validate
                </h3>
                {invalidCount > 0 && (
                  <span className="inline-flex items-center text-xs text-muted-foreground">
                    <AlertCircle className="h-3.5 w-3.5 text-warning mr-1" />
                    {invalidCount} invalid row{invalidCount > 1 ? "s" : ""} highlighted
                  </span>
                )}
              </div>

              <div className="border border-border rounded-md overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="w-12 text-xs uppercase tracking-wider">#</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider">Order #</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider">Flight</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider">Airline</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider">Sector</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider">ETD</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-right">PAX</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-right">Spec. Meals</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider">Validation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsed.map((r) => (
                      <TableRow key={r.row} className={!r.valid ? "bg-destructive/10" : ""}>
                        <TableCell>{r.row}</TableCell>
                        <TableCell className="font-mono text-xs">{r.id}</TableCell>
                        <TableCell>
                          <input
                            value={r.flight}
                            onChange={(e) => updateParsedField(r.row, "flight", e.target.value)}
                            className="bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none w-full text-sm font-medium"
                          />
                        </TableCell>
                        <TableCell>{r.airline}</TableCell>
                        <TableCell>{r.sector}</TableCell>
                        <TableCell>{r.etd}</TableCell>
                        <TableCell className="text-right tabular-nums">{r.pax}</TableCell>
                        <TableCell className="text-right tabular-nums">{r.specialMeals}</TableCell>
                        <TableCell>
                          <StatusBadge status={r.valid ? "OK" : "Failed"} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => toast.success("Error report downloaded.")}>
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Error Report
                </Button>
                <Button onClick={confirmImport}>
                  Confirm Import
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground mb-4">
                Meal Order Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                {DAY_MEAL_PLAN.map((day) => (
                  <div key={day.key} className="rounded-lg border border-border p-4 bg-muted/40">
                    <div className="text-xs uppercase text-muted-foreground">{day.label}</div>
                    <div className="text-sm text-muted-foreground mb-2">{day.date}</div>
                    <div className="text-2xl font-semibold">{day.meals}</div>
                    <div className="text-sm text-muted-foreground">meals estimated</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={() => setOrderVisible((v) => !v)}>
                    {orderVisible ? "Hide Meal Order" : "Order Meal"}
                  </Button>
                  {forwarded && (
                    <span className="rounded-full bg-success/10 text-success px-3 py-1 text-sm">
                      Meal order forwarded to Production
                    </span>
                  )}
                </div>

                {orderVisible && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {DAY_MEAL_PLAN.map((day) => (
                        <div key={day.key} className="rounded-lg border border-border p-4">
                          <div className="text-sm font-semibold mb-2">{day.label}</div>
                          <Label className="text-xs text-muted-foreground">Meals for the day</Label>
                          <Input
                            type="number"
                            min={0}
                            value={mealOrder[day.key]}
                            onChange={(e) =>
                              setMealOrder((prev) => ({ ...prev, [day.key]: Number(e.target.value) }))
                            }
                            className="mt-1"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Button
                        onClick={() => {
                          setForwarded(true);
                          setOrderVisible(false);
                          addLog("Forwarded meal order to Production");
                          toast.success("Meal order forwarded to Production");
                        }}
                        disabled={Object.values(mealOrder).every((value) => value === 0)}
                      >
                        Forward to Production
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Enter daily meal quantities before forwarding.
                      </span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {activityLog.map((entry, index) => (
                  <div key={index} className="rounded-lg border border-border p-3 bg-muted/40">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{entry.user} — {entry.role}</span>
                      <span>{entry.at}</span>
                    </div>
                    <div className="mt-1 text-sm text-foreground">{entry.message}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground mb-4">
            Recent Uploads
          </h3>
          <DataTable
            title="uploads"
            data={recentUploads}
            columns={uploadCols}
            searchKeys={["file", "by", "status"]}
            actions={(row) => <RowActions row={row} actions={["view", "export", "delete"]} />}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function FlightOrderDetailsDialog({
  order, onClose,
}: { order: FlightOrder | null; onClose: () => void }) {
  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Order Details {order && <span className="font-mono text-sm text-muted-foreground ml-1">— {order.id}</span>}
          </DialogTitle>
        </DialogHeader>
        {order && (
          <div className="mt-2 space-y-3">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <DetailRow label="Order #" value={order.id} mono />
              <DetailRow label="Flight" value={order.flight} bold />
              <DetailRow label="Airline" value={order.airline} />
              <DetailRow label="Sector" value={order.sector} />
              <DetailRow label="ETD" value={order.etd} />
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Status</div>
                <div className="mt-1"><StatusBadge status={order.status} /></div>
              </div>
              <DetailRow label="Passengers" value={order.pax.toLocaleString()} />
              <DetailRow label="Special Meals" value={order.specialMeals.toString()} />
            </div>

            <div className="rounded-md bg-muted/40 px-3 py-2 mt-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total Meals (PAX + Special)</span>
              <span className="text-sm font-semibold text-foreground tabular-nums">
                {(order.pax + order.specialMeals).toLocaleString()}
              </span>
            </div>
          </div>
        )}
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({
  label, value, mono, bold,
}: { label: string; value: string; mono?: boolean; bold?: boolean }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={
          "mt-1 text-sm text-foreground" +
          (mono ? " font-mono text-xs" : "") +
          (bold ? " font-semibold" : "")
        }
      >
        {value}
      </div>
    </div>
  );
}

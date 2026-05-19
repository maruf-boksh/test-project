import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileSpreadsheet, FileText, FileType, Download, History, CheckCircle2, AlertCircle } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { DataTable, type Column } from "@/components/common/DataTable";
import { recentUploads } from "@/lib/sample-data";
import { StatusBadge } from "@/components/common/StatusBadge";
import { RowActions } from "@/components/common/RowActions";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/flight-upload")({
  head: () => ({ meta: [{ title: "Flight Data Upload" }] }),
  component: FlightUpload,
});

type UploadRow = (typeof recentUploads)[number];

const SAMPLE_PARSED = [
  { row: 1, flight: "BS-203", sector: "DAC-DXB", date: "2025-11-05", pax: 168, special: 12, valid: true },
  { row: 2, flight: "BS-307", sector: "DAC-KUL", date: "2025-11-05", pax: 282, special: 18, valid: true },
  { row: 3, flight: "BS-???", sector: "DAC-DOH", date: "2025-11-05", pax: 0, special: 0, valid: false },
  { row: 4, flight: "BS-141", sector: "DAC-CXB", date: "2025-11-05", pax: 72, special: 4, valid: true },
];

const DAY_MEAL_PLAN = [
  { key: "day1", label: "Day 1 (24h)", date: "2025-11-05", meals: 462 },
  { key: "day2", label: "Day 2 (24h)", date: "2025-11-06", meals: 520 },
  { key: "day3", label: "Day 3 (24h)", date: "2025-11-07", meals: 498 },
  { key: "day4", label: "Day 4 (24h)", date: "2025-11-08", meals: 446 },
];

type MealPlan = Record<string, number>;

function FlightUpload() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [done, setDone] = useState(false);
  const [orderVisible, setOrderVisible] = useState(false);
  const [mealOrder, setMealOrder] = useState<MealPlan>({ day1: 0, day2: 0, day3: 0, day4: 0 });
  const [forwarded, setForwarded] = useState(false);
  const [activityLog, setActivityLog] = useState([
    { message: "Manifest upload ready for validation", user: "ops.user", role: "Flight Ops", at: "2025-11-05 06:12" },
  ]);

  const addLog = (message: string) => {
    const now = new Date();
    setActivityLog((current) => [
      { message, user: "GM/Admin", role: "General Manager", at: `${now.toLocaleDateString()} ${now.toLocaleTimeString()}` },
      ...current,
    ]);
  };

  const start = (f: File) => {
    setFile(f); setDone(false); setForwarded(false); setOrderVisible(false); setProgress(0);
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(t);
          setDone(true);
          toast.success("Manifest imported & meal requirements generated");
          addLog("Flight manifest imported and meal totals calculated");
          return 100;
        }
        return p + 10;
      });
    }, 120);
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) start(f);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0]; if (f) start(f);
  };

  const cols: Column<UploadRow>[] = [
    { key: "id", header: "Upload ID" },
    { key: "file", header: "File" },
    { key: "rows", header: "Rows" },
    { key: "valid", header: "Valid" },
    { key: "errors", header: "Errors", render: r => <span className={r.errors > 0 ? "text-destructive font-medium" : ""}>{r.errors}</span> },
    { key: "by", header: "Uploaded By" },
    { key: "at", header: "Date" },
    { key: "status", header: "Status", render: r => <StatusBadge status={r.status} /> },
  ];

  return (
    <>
      <PageHeader
        title="Flight Data Upload"
        subtitle="Import passenger manifests in Excel, CSV or DOC formats"
        actions={
          <>
            <Button variant="outline"><Download className="h-4 w-4 mr-1" /> Sample Template</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="outline"><History className="h-4 w-4 mr-1" /> Upload History</Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                {recentUploads.map(u => (
                  <DropdownMenuItem key={u.id} className="flex justify-between">
                    <span className="truncate">{u.file}</span>
                    <span className="text-xs text-muted-foreground ml-2">{u.at.split(" ")[0]}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4 mr-1" /> Import Manifest</Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()}><FileSpreadsheet className="h-4 w-4 mr-1" /> Excel</Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()}><FileText className="h-4 w-4 mr-1" /> CSV</Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()}><FileType className="h-4 w-4 mr-1" /> DOC</Button>
          </>
        }
      />
      <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.doc,.docx" hidden onChange={onPick} />

      <Card
        className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-transparent"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <CardContent className="py-12 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 grid place-items-center mb-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Drag & Drop Manifest Here</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Supported formats: .xlsx, .xls, .csv, .doc, .docx — Max 50 MB
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <Button onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4 mr-1" /> Select File</Button>
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
                  <><CheckCircle2 className="h-4 w-4 text-success" /> Validated. 122/124 rows valid.</>
                ) : (
                  <>Parsing manifest, validating fields...</>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {done && (
        <>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Preview & Validate
                <span className="ml-auto text-sm font-normal text-muted-foreground">
                  <AlertCircle className="inline h-4 w-4 text-warning mr-1" />
                  1 invalid row highlighted
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted text-left">
                  <tr>
                    <th className="p-2">#</th><th className="p-2">Flight</th><th className="p-2">Sector</th>
                    <th className="p-2">Date</th><th className="p-2">PAX</th><th className="p-2">Special</th><th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_PARSED.map(r => (
                    <tr key={r.row} className={!r.valid ? "bg-destructive/10" : "hover:bg-muted/40"}>
                      <td className="p-2">{r.row}</td>
                      <td className="p-2"><input defaultValue={r.flight} className="bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none" /></td>
                      <td className="p-2">{r.sector}</td>
                      <td className="p-2">{r.date}</td>
                      <td className="p-2">{r.pax}</td>
                      <td className="p-2">{r.special}</td>
                      <td className="p-2">{r.valid ? <StatusBadge status="OK" /> : <StatusBadge status="Failed" />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end gap-2 mt-3">
                <Button variant="outline">Download Error Report</Button>
                <Button onClick={() => toast.success("Manifest imported. Meal requirements generated.")}>
                  Confirm Import
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Meal Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                {DAY_MEAL_PLAN.map((day) => (
                  <div key={day.key} className="rounded-lg border border-border p-4 bg-muted/80">
                    <div className="text-xs uppercase text-muted-foreground">{day.label}</div>
                    <div className="text-sm text-muted-foreground mb-2">{day.date}</div>
                    <div className="text-2xl font-semibold">{day.meals}</div>
                    <div className="text-sm text-muted-foreground">meals estimated</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => setOrderVisible((v) => !v)}>{orderVisible ? "Hide Meal Order" : "Order Meal"}</Button>
                  {forwarded && <span className="rounded-full bg-success/10 text-success px-3 py-1 text-sm">Meal order forwarded to Production</span>}
                </div>

                {orderVisible && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {DAY_MEAL_PLAN.map((day) => (
                      <div key={day.key} className="rounded-lg border border-border p-4">
                        <div className="text-sm font-semibold mb-2">{day.label}</div>
                        <label className="text-xs text-muted-foreground">Meals for the day</label>
                        <input
                          type="number"
                          min={0}
                          value={mealOrder[day.key]}
                          onChange={(e) => setMealOrder((prev) => ({ ...prev, [day.key]: Number(e.target.value) }))}
                          className="mt-1 w-full rounded-md border border-border px-3 py-2 bg-background text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {orderVisible && (
                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <Button onClick={() => {
                      setForwarded(true);
                      setOrderVisible(false);
                      addLog("Forwarded meal order to Production");
                      toast.success("Meal order forwarded to Production");
                    }} disabled={Object.values(mealOrder).every((value) => value === 0)}>
                      Forward to Production
                    </Button>
                    <span className="text-sm text-muted-foreground">Enter daily meal quantities before forwarding.</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activityLog.map((entry, index) => (
                  <div key={index} className="rounded-xl border border-border p-3 bg-muted/80">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{entry.user} — {entry.role}</span>
                      <span>{entry.at}</span>
                    </div>
                    <div className="mt-2 text-sm">{entry.message}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Recent Uploads</h2>
        <DataTable
          title="uploads"
          data={recentUploads}
          columns={cols}
          searchKeys={["file", "by", "status"]}
          actions={(row) => <RowActions row={row} actions={["view", "export", "delete"]} />}
        />
      </div>
    </>
  );
}

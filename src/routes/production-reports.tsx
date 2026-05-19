import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/common/KpiCard";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { cn } from "@/lib/utils";
import {
  Factory, Boxes, CheckCircle2, Clock, Download,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie,
  PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { toast } from "sonner";
import { seedProductionEntries, type ProductionEntryRow } from "@/lib/sample-data";

export const Route = createFileRoute("/production-reports")({
  head: () => ({ meta: [{ title: "Production Reports" }] }),
  component: ProductionReports,
});

const TODAY = new Date("2026-05-19");
const STATUS_COLORS: Record<string, string> = {
  "Closed":          "#94a3b8",
  "Approved":        "#10b981",
  "Ready for QC":    "#0EA5A4",
  "In Preparation":  "#F59E0B",
  "Draft":           "#cbd5e1",
};
const BAR_COLOR = "#1E3A8A";

type Period = "week" | "month" | "all";
const PERIODS: { value: Period; label: string }[] = [
  { value: "week",  label: "This Week"  },
  { value: "month", label: "This Month" },
  { value: "all",   label: "All Time"   },
];

function inPeriod(dateStr: string, period: Period): boolean {
  if (period === "all") return true;
  const d = new Date(dateStr);
  if (period === "month") {
    return d.getFullYear() === TODAY.getFullYear() && d.getMonth() === TODAY.getMonth();
  }
  const weekAgo = new Date(TODAY);
  weekAgo.setDate(weekAgo.getDate() - 7);
  return d >= weekAgo && d <= TODAY;
}

function ProductionReports() {
  const [period, setPeriod] = useState<Period>("month");

  const filtered = useMemo(
    () => seedProductionEntries.filter((e) => inPeriod(e.date, period)),
    [period],
  );

  const totalEntries = filtered.length;
  const totalQty = filtered.reduce((s, e) => s + e.producedQty, 0);
  const closedCount = filtered.filter((e) => e.status === "Closed").length;
  const inProgressCount = totalEntries - closedCount;

  const byBom = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of filtered) map.set(e.bom, (map.get(e.bom) ?? 0) + e.producedQty);
    return Array.from(map.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty);
  }, [filtered]);

  const byStatus = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of filtered) map.set(e.status, (map.get(e.status) ?? 0) + 1);
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const dailyTrend = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of filtered) map.set(e.date, (map.get(e.date) ?? 0) + e.producedQty);
    return Array.from(map.entries())
      .map(([date, qty]) => ({ date, qty }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filtered]);

  const cols: Column<ProductionEntryRow>[] = [
    { key: "id",          header: "Entry No" },
    { key: "date",        header: "Date" },
    { key: "bom",         header: "BOM" },
    { key: "producedQty", header: "Produced Qty", className: "text-right" },
    { key: "status",      header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <>
      <PageHeader
        title="Production Reports"
        subtitle="Output, status distribution and trend analytics across production entries"
        actions={
          <Button variant="outline" onClick={() => toast.success("Production report exported.")}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-1.5">
        {PERIODS.map((p) => {
          const active = p.value === period;
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => setPeriod(p.value)}
              className={cn(
                "h-8 rounded-full px-4 text-xs font-medium border transition-colors",
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:bg-muted",
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Entries"     value={totalEntries}                  icon={Factory}      tone="navy"    />
        <KpiCard label="Total Produced Qty" value={totalQty.toLocaleString()}    icon={Boxes}        tone="success" />
        <KpiCard label="Closed"            value={closedCount}                   icon={CheckCircle2} tone="success" />
        <KpiCard label="In Progress"       value={inProgressCount}               icon={Clock}        tone="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Production Output by BOM</CardTitle>
          </CardHeader>
          <CardContent>
            {byBom.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={byBom} layout="vertical" margin={{ left: 20, right: 16, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} horizontal={false} />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={140} />
                  <Tooltip />
                  <Bar dataKey="qty" fill={BAR_COLOR} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {byStatus.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95}>
                    {byStatus.map((s) => (
                      <Cell key={s.name} fill={STATUS_COLORS[s.name] ?? BAR_COLOR} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Daily Production Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {dailyTrend.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={dailyTrend}>
                <defs>
                  <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BAR_COLOR} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={BAR_COLOR} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="qty" stroke={BAR_COLOR} fill="url(#trend-fill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Entries in Period</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            title="production-report"
            data={filtered}
            columns={cols}
            searchKeys={["id", "bom", "status"]}
            selectable={false}
          />
        </CardContent>
      </Card>
    </>
  );
}

function EmptyChart() {
  return (
    <div className="grid place-items-center h-[260px] text-sm text-muted-foreground">
      No data for the selected period.
    </div>
  );
}

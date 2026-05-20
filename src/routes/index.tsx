import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { useRole } from "@/lib/roles";
import { Plane, UtensilsCrossed, AlertTriangle, ShoppingCart, ShieldAlert, Truck, DollarSign, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { flights, productionOrders, purchaseOrders } from "@/lib/sample-data";
import { cn } from "@/lib/utils";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Legend,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, PieChart, Pie,
} from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — US-Bangla Catering ERP" }] }),
  component: Dashboard,
});

type Period = "today" | "week";

// ── Data per period ─────────────────────────────────────────────────────────
const DATA = {
  today: {
    kpis: {
      flights:     { value: 42,    sub: "+8 vs yesterday" },
      meals:       { value: "3,920", sub: "98% of target" },
      delayed:     { value: 3,     sub: "2 catering related" },
      qcIssues:    { value: 1,     sub: "1 open, 4 resolved" },
      pendingPOs:  { value: 6,     sub: "৳ 7.5L pending" },
      invAlerts:   { value: 4,     sub: "2 critical" },
      dispatch:    { value: 9,     sub: "3 en route" },
      dailyCost:   { value: "৳ 14.2L", sub: "-3% MoM" },
    },
    trend: [
      { d: "06:00", meals: 280,  target: 350 },
      { d: "09:00", meals: 720,  target: 750 },
      { d: "12:00", meals: 1240, target: 1100 },
      { d: "15:00", meals: 1980, target: 1900 },
      { d: "18:00", meals: 2840, target: 2700 },
      { d: "21:00", meals: 3640, target: 3500 },
      { d: "Now",   meals: 3920, target: 3500 },
    ],
    trendTitle: "Meal Production Trend (Today)",
  },
  week: {
    kpis: {
      flights:     { value: 287,   sub: "+12 vs last week" },
      meals:       { value: "24,180", sub: "96% of target" },
      delayed:     { value: 18,    sub: "10 catering related" },
      qcIssues:    { value: 7,     sub: "5 resolved" },
      pendingPOs:  { value: 22,    sub: "৳ 28.4L pending" },
      invAlerts:   { value: 11,    sub: "4 critical" },
      dispatch:    { value: 61,    sub: "all completed" },
      dailyCost:   { value: "৳ 98.6L", sub: "-2% WoW" },
    },
    trend: [
      { d: "Mon", meals: 2840, target: 3000 },
      { d: "Tue", meals: 3120, target: 3000 },
      { d: "Wed", meals: 2980, target: 3000 },
      { d: "Thu", meals: 3340, target: 3000 },
      { d: "Fri", meals: 3680, target: 3500 },
      { d: "Sat", meals: 4120, target: 3500 },
      { d: "Sun", meals: 3920, target: 3500 },
    ],
    trendTitle: "Meal Production Trend (Last 7 Days)",
  },
} satisfies Record<Period, {
  kpis: Record<string, { value: number | string; sub: string }>;
  trend: { d: string; meals: number; target: number }[];
  trendTitle: string;
}>;

const sectionMix = [
  { name: "Hot Kitchen", v: 1840 },
  { name: "Cold Kitchen", v: 920 },
  { name: "Bakery", v: 640 },
  { name: "Beverage", v: 520 },
];

// US-Bangla brand palette (matches logo)
const BRAND_RED  = "oklch(0.58 0.23 25)";
const BRAND_BLUE = "#0824D9";
const BRAND_LEAF = "oklch(0.62 0.16 148)";
const BRAND_GOLD = "oklch(0.78 0.15 75)";
const CHART_COLORS = [BRAND_BLUE, BRAND_RED, BRAND_LEAF, BRAND_GOLD];

function Dashboard() {
  const { role } = useRole();
  const [period, setPeriod] = useState<Period>("today");
  const data = DATA[period];

  return (
    <>
      <PageHeader
        title={`${role} Dashboard`}
        subtitle="Live operational overview — US-Bangla Airlines Flight Catering"
        actions={
          <>
            <div className="inline-flex items-center rounded-md border border-border bg-card p-0.5 shadow-sm">
              <Button
                size="sm"
                variant={period === "today" ? "default" : "ghost"}
                className={cn("h-8 px-3", period === "today" && "shadow-sm")}
                onClick={() => setPeriod("today")}
              >
                Today
              </Button>
              <Button
                size="sm"
                variant={period === "week" ? "default" : "ghost"}
                className={cn("h-8 px-3", period === "week" && "shadow-sm")}
                onClick={() => setPeriod("week")}
              >
                This Week
              </Button>
            </div>
            <Button onClick={() => toast.success(`${period === "today" ? "Today's" : "Weekly"} report exported.`)}>
              Export Report
            </Button>
          </>
        }
      />

      {/* US-Bangla livery banner */}
      <div className="usb-livery-stripe h-1 rounded-full mb-5" aria-hidden />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Flights Today"   value={data.kpis.flights.value}  sub={data.kpis.flights.sub}  icon={Plane}            tone="navy"    />
        <KpiCard label="Meals Prepared"  value={data.kpis.meals.value}    sub={data.kpis.meals.sub}    icon={UtensilsCrossed}  tone="success" />
        <KpiCard label="Delayed Flights" value={data.kpis.delayed.value}  sub={data.kpis.delayed.sub}  icon={AlertTriangle}    tone="warning" />
        <KpiCard label="QC Issues"       value={data.kpis.qcIssues.value} sub={data.kpis.qcIssues.sub} icon={ShieldAlert}      tone="red"     />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <KpiCard label="Pending POs"      value={data.kpis.pendingPOs.value} sub={data.kpis.pendingPOs.sub} icon={ShoppingCart} tone="navy"    />
        <KpiCard label="Inventory Alerts" value={data.kpis.invAlerts.value}  sub={data.kpis.invAlerts.sub}  icon={Package}      tone="red"     />
        <KpiCard label="Dispatch Active"  value={data.kpis.dispatch.value}   sub={data.kpis.dispatch.sub}   icon={Truck}        tone="success" />
        <KpiCard label="Daily Cost"       value={data.kpis.dailyCost.value}  sub={data.kpis.dailyCost.sub}  icon={DollarSign}   tone="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2 brand-accent-border-left">
          <CardHeader><CardTitle>{data.trendTitle}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.trend}>
                <defs>
                  <linearGradient id="grad-meals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BRAND_BLUE} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={BRAND_BLUE} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="grad-target" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BRAND_RED} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={BRAND_RED} stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="d" stroke="currentColor" className="text-muted-foreground" fontSize={11} />
                <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="meals"  stroke={BRAND_BLUE} fill="url(#grad-meals)"  strokeWidth={2} />
                <Area type="monotone" dataKey="target" stroke={BRAND_RED}  fill="url(#grad-target)" strokeWidth={1.5} strokeDasharray="5 3" />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="navy-accent-border-left">
          <CardHeader><CardTitle>Production Mix</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={sectionMix} dataKey="v" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                  {sectionMix.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Card className="lg:col-span-2 leaf-accent-border-left">
          <CardHeader><CardTitle>Active Flights</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {flights.slice(0, 5).map((f) => (
              <div key={f.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/40 border border-border transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-md bg-navy text-navy-foreground grid place-items-center text-xs font-bold shadow-sm">
                    {f.flight.slice(-3)}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{f.flight} — {f.sector}</div>
                    <div className="text-xs text-muted-foreground">{f.aircraft} • {f.dep} → {f.arr} • {f.pax} pax</div>
                  </div>
                </div>
                <StatusBadge status={f.status} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="brand-accent-border-left">
          <CardHeader><CardTitle>Activity Feed</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { t: "06:14", e: "Manifest imported",  d: "BS-203 — 168 pax",                tone: "navy"    as const },
              { t: "06:08", e: "PO Approved",        d: "PO-2025-0450 by Accounts",        tone: "success" as const },
              { t: "05:52", e: "QC Failed",          d: "PRD-9006 visual inspection",      tone: "destructive" as const },
              { t: "05:30", e: "Production started", d: "Hot Kitchen — BS-307",            tone: "leaf"    as const },
              { t: "05:15", e: "Low stock alert",    d: "Tomato — 22 Kg",                  tone: "warning" as const },
            ].map((a, i) => {
              const borderClass = {
                navy:        "border-l-navy",
                success:     "border-l-success",
                destructive: "border-l-destructive",
                leaf:        "border-l-leaf",
                warning:     "border-l-warning",
              }[a.tone];
              return (
                <div key={i} className="flex gap-3">
                  <div className="text-xs text-muted-foreground w-12 mt-0.5 tabular-nums">{a.t}</div>
                  <div className={cn("flex-1 border-l-2 pl-3", borderClass)}>
                    <div className="font-medium text-foreground">{a.e}</div>
                    <div className="text-xs text-muted-foreground">{a.d}</div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <Card className="navy-accent-border-left">
          <CardHeader><CardTitle>Production Status by Section</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={productionOrders.map(p => ({ name: p.id, progress: p.progress }))}>
                <defs>
                  <linearGradient id="grad-bar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"  stopColor={BRAND_BLUE} stopOpacity={1} />
                    <stop offset="100%" stopColor={BRAND_BLUE} stopOpacity={0.65} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground" fontSize={11} />
                <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="progress" fill="url(#grad-bar)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="leaf-accent-border-left">
          <CardHeader><CardTitle>Procurement Pipeline</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {purchaseOrders.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center justify-between border border-border rounded-md p-2 text-sm hover:bg-muted/40 transition-colors">
                <div>
                  <div className="font-medium">{p.id} — {p.vendor}</div>
                  <div className="text-xs text-muted-foreground">{p.items} items • ৳ {p.amount.toLocaleString()}</div>
                </div>
                <StatusBadge status={p.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

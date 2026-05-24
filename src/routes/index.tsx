import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { useRole } from "@/lib/roles";
import { Plane, UtensilsCrossed, AlertTriangle, ShoppingCart, ShieldAlert, Truck, DollarSign, Package, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  flights, productionOrders, purchaseOrders, dispatch, qcChecks,
  seedFlightOrders, inventory, inventoryValue,
} from "@/lib/sample-data";
import { useWorkflow } from "@/lib/workflow-store";
import { flagArrival } from "@/lib/arrival-flash";
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

// US-Bangla brand palette (matches logo)
const BRAND_RED  = "oklch(0.58 0.23 25)";
const BRAND_BLUE = "#0824D9";
const BRAND_LEAF = "oklch(0.62 0.16 148)";
const BRAND_GOLD = "oklch(0.78 0.15 75)";
const CHART_COLORS = [BRAND_BLUE, BRAND_RED, BRAND_LEAF, BRAND_GOLD];

// ── Live KPI helpers ────────────────────────────────────────────────────────
function formatLakh(n: number): string {
  if (n >= 100000) return `৳ ${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `৳ ${(n / 1000).toFixed(1)}K`;
  return `৳ ${n.toLocaleString()}`;
}

type ActivityTone = "navy" | "success" | "destructive" | "leaf" | "warning";
type ActivityEntry = {
  t: string;
  e: string;
  d: string;
  tone: ActivityTone;
  to: "/order-management" | "/procurement" | "/inventory" | "/dispatch"
    | "/cooking-temp" | "/production-entry" | "/purchase-requisition" | "/transfer";
  highlight?: string;
};

function useDashboardKpis(period: Period) {
  const { wfRequisitions, wfPurchaseOrders, productionEntries, productionEntryRecords, transferNotes } = useWorkflow();

  // Treat the most recent date in seedFlightOrders as "today" so the data is
  // deterministic against the sample set. Previous distinct date = "yesterday".
  const allDates = Array.from(new Set(seedFlightOrders.map((o) => o.date))).sort();
  const today = allDates[allDates.length - 1] ?? "";
  const yesterday = allDates[allDates.length - 2] ?? "";
  const todayOrders = seedFlightOrders.filter((o) => o.date === today);
  const flightsToday = todayOrders.length;
  const flightsYesterday = seedFlightOrders.filter((o) => o.date === yesterday).length;
  const flightsWeek = seedFlightOrders.length;
  const flightsDelta = flightsToday - flightsYesterday;
  const flightsTodayIds = todayOrders.map((o) => o.id);
  const flightsAllIds = seedFlightOrders.map((o) => o.id);

  // Meals prepared = sum of producedQty from production-floor entries.
  const producedTotal = productionEntryRecords.reduce((s, r) => s + r.producedQty, 0);
  const targetTotal = productionEntries.reduce(
    (s, p) => s + (p.orderQty ?? p.producedQty),
    0,
  );
  const targetPct = targetTotal > 0 ? Math.round((producedTotal / targetTotal) * 100) : 0;
  const mealsRowIds = productionEntries.map((p) => p.id);

  // Delayed flights from the live flight roster. Cross-reference flight code
  // to order-management rows so the highlighter can hit visible rows.
  const delayedFlights = flights.filter((f) => f.status === "Delayed");
  const delayed = delayedFlights.length;
  const delayedFlightCodes = new Set(delayedFlights.map((f) => f.flight));
  const delayedRowIds = seedFlightOrders
    .filter((o) => delayedFlightCodes.has(o.flight))
    .map((o) => o.id);

  // QC issues = failed checks; resolved = passing checks.
  const qcFailed = qcChecks.filter((q) => q.result === "Fail");
  const qcOpen = qcFailed.length;
  const qcResolved = qcChecks.filter((q) => q.result === "Pass").length;
  const qcRowIds = qcFailed.map((q) => q.id);

  // Pending POs combines hard-coded seed POs and workflow requisitions/POs awaiting accounts.
  const pendingSeedPOs = purchaseOrders.filter((p) => p.status === "Pending Approval");
  const pendingWfPOs = wfPurchaseOrders.filter((p) => p.status === "Pending Approval");
  const pendingReqs = wfRequisitions.filter((r) => r.status === "Pending Accounts");
  const pendingPOCount = pendingSeedPOs.length + pendingReqs.length;
  const pendingPOAmount = pendingSeedPOs.reduce((s, p) => s + p.amount, 0);
  const pendingPORowIds = [
    ...pendingSeedPOs.map((p) => p.id),
    ...pendingWfPOs.map((p) => p.id),
    ...pendingReqs.map((r) => r.id),
  ];

  // Inventory alerts come straight from the FEFO-aware inventory list.
  const lowItems = inventory.filter((i) => i.status === "Low");
  const criticalItems = inventory.filter((i) => i.status === "Critical");
  const invAlerts = lowItems.length + criticalItems.length;
  const invAlertRowIds = [...criticalItems.map((i) => i.id), ...lowItems.map((i) => i.id)];

  // Dispatch: anything that isn't Delivered is still in-flight from a logistics view.
  const activeDispatch = dispatch.filter((d) => d.status !== "Delivered");
  const dispatchActive = activeDispatch.length;
  const dispatchEnRoute = dispatch.filter((d) => d.status === "En Route").length;
  const dispatchRowIds = activeDispatch.map((d) => d.id);

  // Daily cost = total FEFO inventory valuation (proxy for working-capital exposure).
  const stockValue = inventoryValue(inventory);

  // Production trend reuses productionOrders to derive realistic milestones.
  const trendToday = [
    { d: "06:00", meals: Math.round(producedTotal * 0.07), target: Math.round(targetTotal * 0.10) },
    { d: "09:00", meals: Math.round(producedTotal * 0.18), target: Math.round(targetTotal * 0.22) },
    { d: "12:00", meals: Math.round(producedTotal * 0.32), target: Math.round(targetTotal * 0.32) },
    { d: "15:00", meals: Math.round(producedTotal * 0.50), target: Math.round(targetTotal * 0.55) },
    { d: "18:00", meals: Math.round(producedTotal * 0.72), target: Math.round(targetTotal * 0.78) },
    { d: "21:00", meals: Math.round(producedTotal * 0.92), target: Math.round(targetTotal * 0.95) },
    { d: "Now",   meals: producedTotal,                     target: targetTotal },
  ];

  const trendWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => {
    const factor = 0.78 + ((i * 137) % 50) / 100; // 0.78 – 1.27, deterministic
    return {
      d,
      meals: Math.round(producedTotal * factor),
      target: Math.round(targetTotal * factor),
    };
  });

  const isWeek = period === "week";
  return {
    kpis: {
      flights: {
        value: isWeek ? flightsWeek : flightsToday,
        sub: isWeek
          ? `${allDates.length} days covered`
          : `${flightsDelta >= 0 ? "+" : ""}${flightsDelta} vs yesterday`,
        ids: isWeek ? flightsAllIds : flightsTodayIds,
      },
      meals: {
        value: producedTotal.toLocaleString(),
        sub: targetTotal > 0 ? `${targetPct}% of target` : "no targets yet",
        ids: mealsRowIds,
      },
      delayed: {
        value: delayed,
        sub: delayed > 0 ? `${Math.max(1, Math.floor(delayed * 0.66))} catering related` : "none",
        ids: delayedRowIds,
      },
      qcIssues: {
        value: qcOpen,
        sub: `${qcOpen} open, ${qcResolved} resolved`,
        ids: qcRowIds,
      },
      pendingPOs: {
        value: pendingPOCount,
        sub: pendingPOAmount > 0 ? `${formatLakh(pendingPOAmount)} pending` : "no value pending",
        ids: pendingPORowIds,
      },
      invAlerts: {
        value: invAlerts,
        sub: `${criticalItems.length} critical`,
        ids: invAlertRowIds,
      },
      dispatch: {
        value: dispatchActive,
        sub: `${dispatchEnRoute} en route`,
        ids: dispatchRowIds,
      },
      dailyCost: {
        value: formatLakh(stockValue),
        sub: "FEFO stock value",
        ids: [] as string[],
      },
    },
    trend: isWeek ? trendWeek : trendToday,
    trendTitle: isWeek ? "Meal Production Trend (Last 7 Days)" : "Meal Production Trend (Today)",
    sectionMix: computeSectionMix(),
    activeFlights: pickActiveFlights(),
    activityFeed: buildActivityFeed({
      wfRequisitions, productionEntryRecords, transferNotes,
    }),
  };
}

/** Active flight orders sorted by operational priority — kept long enough to
 * group into 5 distinct Order # blocks on the dashboard. */
function pickActiveFlights() {
  const priority: Record<string, number> = {
    Production: 0,
    Approved: 1,
    Dispatched: 2,
    Pending: 3,
    Completed: 4,
  };
  return [...seedFlightOrders]
    .sort((a, b) => {
      const pa = priority[a.status] ?? 99;
      const pb = priority[b.status] ?? 99;
      if (pa !== pb) return pa - pb;
      return a.etd.localeCompare(b.etd);
    })
    .slice(0, 24);
}

/** Group flight orders by Order #, preserving original sort, capped to N orders. */
function groupActiveByOrder(rows: ReturnType<typeof pickActiveFlights>, maxOrders = 5) {
  const map = new Map<string, typeof rows>();
  for (const r of rows) {
    const list = map.get(r.orderNo);
    if (list) list.push(r);
    else map.set(r.orderNo, [r]);
  }
  return Array.from(map.entries()).slice(0, maxOrders);
}

/** Production mix grouped by section, derived from productionOrders. */
function computeSectionMix(): { name: string; v: number }[] {
  const map = new Map<string, number>();
  for (const p of productionOrders) map.set(p.section, (map.get(p.section) ?? 0) + p.qty);
  return Array.from(map.entries()).map(([name, v]) => ({ name, v }));
}

/** Recent events feed assembled from inventory, QC, requisitions, transfers, and production entries. */
function buildActivityFeed({
  wfRequisitions, productionEntryRecords, transferNotes,
}: {
  wfRequisitions: ReturnType<typeof useWorkflow>["wfRequisitions"];
  productionEntryRecords: ReturnType<typeof useWorkflow>["productionEntryRecords"];
  transferNotes: ReturnType<typeof useWorkflow>["transferNotes"];
}): ActivityEntry[] {
  const out: ActivityEntry[] = [];

  // Low / Critical stock alerts (top 2 by severity)
  inventory
    .filter((i) => i.status === "Critical" || i.status === "Low")
    .slice(0, 2)
    .forEach((i) => {
      out.push({
        t: i.expiry === "—" ? "—" : i.expiry.slice(5),
        e: i.status === "Critical" ? "Critical stock" : "Low stock alert",
        d: `${i.name} — ${i.stock} ${i.uom}`,
        tone: i.status === "Critical" ? "destructive" : "warning",
        to: "/inventory",
        highlight: "inv-alerts",
      });
    });

  // QC failures
  qcChecks
    .filter((q) => q.result === "Fail")
    .slice(0, 1)
    .forEach((q) => {
      out.push({
        t: q.flight.slice(-3),
        e: "QC Failed",
        d: `${q.batch} — ${q.parameter}`,
        tone: "destructive",
        to: "/cooking-temp",
        highlight: "qc-issues",
      });
    });

  // Latest production entry
  productionEntryRecords.slice(0, 1).forEach((r) => {
    out.push({
      t: r.date.slice(11, 16) || r.date.slice(5, 10),
      e: "Production logged",
      d: `${r.productionOrderId} — ${r.producedQty} units${r.shift ? ` (${r.shift})` : ""}`,
      tone: "leaf",
      to: "/production-entry",
      highlight: "production-list",
    });
  });

  // Latest workflow requisition (PR awaiting approval)
  wfRequisitions
    .filter((r) => r.status === "Pending Accounts")
    .slice(0, 1)
    .forEach((r) => {
      out.push({
        t: r.date.slice(5, 10),
        e: "PR pending approval",
        d: `${r.id} — ${r.requestedBy}`,
        tone: "navy",
        to: "/purchase-requisition",
        highlight: "pr-list",
      });
    });

  // Approved PO (most recent)
  purchaseOrders
    .filter((p) => p.status === "Approved")
    .slice(0, 1)
    .forEach((p) => {
      out.push({
        t: p.date.slice(5),
        e: "PO Approved",
        d: `${p.id} — ${p.vendor}`,
        tone: "success",
        to: "/procurement",
        highlight: "po-list",
      });
    });

  // Latest issued transfer
  transferNotes.slice(0, 1).forEach((tn) => {
    out.push({
      t: tn.date.slice(11, 16) || tn.date.slice(5, 10),
      e: tn.status === "Issued" ? "Transfer issued" : "Transfer pending",
      d: `${tn.id} — ${tn.from} → ${tn.to}`,
      tone: tn.status === "Issued" ? "success" : "warning",
      to: "/transfer",
      highlight: "transfer-list",
    });
  });

  return out.slice(0, 6);
}

function Dashboard() {
  const { role } = useRole();
  const [period, setPeriod] = useState<Period>("today");
  const data = useDashboardKpis(period);

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
        <KpiLink to="/order-management" highlight="active-orders" ids={data.kpis.flights.ids}>
          <KpiCard label="Flights Today"   value={data.kpis.flights.value}  sub={data.kpis.flights.sub}  icon={Plane}            tone="navy"    />
        </KpiLink>
        <KpiLink to="/production-entry" highlight="production-list" ids={data.kpis.meals.ids}>
          <KpiCard label="Meals Prepared"  value={data.kpis.meals.value}    sub={data.kpis.meals.sub}    icon={UtensilsCrossed}  tone="success" />
        </KpiLink>
        <KpiLink to="/order-management" highlight="active-orders" ids={data.kpis.delayed.ids}>
          <KpiCard label="Delayed Flights" value={data.kpis.delayed.value}  sub={data.kpis.delayed.sub}  icon={AlertTriangle}    tone="warning" />
        </KpiLink>
        <KpiLink to="/cooking-temp" highlight="qc-issues" ids={data.kpis.qcIssues.ids}>
          <KpiCard label="QC Issues"       value={data.kpis.qcIssues.value} sub={data.kpis.qcIssues.sub} icon={ShieldAlert}      tone="red"     />
        </KpiLink>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <KpiLink to="/procurement" highlight="po-list" ids={data.kpis.pendingPOs.ids}>
          <KpiCard label="Pending POs"      value={data.kpis.pendingPOs.value} sub={data.kpis.pendingPOs.sub} icon={ShoppingCart} tone="navy"    />
        </KpiLink>
        <KpiLink to="/inventory" highlight="inv-alerts" ids={data.kpis.invAlerts.ids}>
          <KpiCard label="Inventory Alerts" value={data.kpis.invAlerts.value}  sub={data.kpis.invAlerts.sub}  icon={Package}      tone="red"     />
        </KpiLink>
        <KpiLink to="/dispatch" highlight="dispatch-list" ids={data.kpis.dispatch.ids}>
          <KpiCard label="Dispatch Active"  value={data.kpis.dispatch.value}   sub={data.kpis.dispatch.sub}   icon={Truck}        tone="success" />
        </KpiLink>
        <KpiLink to="/inventory" highlight="inv-value">
          <KpiCard label="Daily Cost"       value={data.kpis.dailyCost.value}  sub={data.kpis.dailyCost.sub}  icon={DollarSign}   tone="warning" />
        </KpiLink>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2 leaf-accent-border-left">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Active Orders</CardTitle>
            <Link
              to="/order-management"
              onClick={() => flagArrival("active-orders")}
              className="text-xs text-primary hover:underline"
            >
              View all →
            </Link>
          </CardHeader>
          <CardContent>
            <ActiveOrdersTabs rows={data.activeFlights} />
          </CardContent>
        </Card>
        <Card className="navy-accent-border-left">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Production Mix</CardTitle>
            <Link
              to="/production-entry"
              onClick={() => flagArrival("production-list")}
              className="text-xs text-primary hover:underline"
            >
              Open →
            </Link>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={data.sectionMix} dataKey="v" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                  {data.sectionMix.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
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
        <Card className="lg:col-span-2 brand-accent-border-left">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{data.trendTitle}</CardTitle>
            <Link
              to="/production-entry"
              onClick={() => flagArrival("production-list")}
              className="text-xs text-primary hover:underline"
            >
              Open Production →
            </Link>
          </CardHeader>
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
        <Card className="brand-accent-border-left">
          <CardHeader><CardTitle>Activity Feed</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {data.activityFeed.length === 0 ? (
              <div className="text-xs text-muted-foreground py-4 text-center">No recent activity.</div>
            ) : (
              data.activityFeed.map((a, i) => {
                const borderClass = {
                  navy:        "border-l-navy",
                  success:     "border-l-success",
                  destructive: "border-l-destructive",
                  leaf:        "border-l-leaf",
                  warning:     "border-l-warning",
                }[a.tone];
                return (
                  <Link
                    key={i}
                    to={a.to}
                    onClick={() => a.highlight && flagArrival(a.highlight)}
                    className="flex gap-3 group"
                  >
                    <div className="text-xs text-muted-foreground w-12 mt-0.5 tabular-nums">{a.t}</div>
                    <div className={cn("flex-1 border-l-2 pl-3 group-hover:bg-muted/40 rounded-r-md transition-colors", borderClass)}>
                      <div className="font-medium text-foreground">{a.e}</div>
                      <div className="text-xs text-muted-foreground">{a.d}</div>
                    </div>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <Card className="navy-accent-border-left">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Production Progress</CardTitle>
            <Link
              to="/production-entry"
              onClick={() => flagArrival("production-list")}
              className="text-xs text-primary hover:underline"
            >
              View orders →
            </Link>
          </CardHeader>
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Procurement Pipeline</CardTitle>
            <Link
              to="/procurement"
              onClick={() => flagArrival("po-list")}
              className="text-xs text-primary hover:underline"
            >
              View all →
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {purchaseOrders.slice(0, 5).map(p => (
              <Link
                key={p.id}
                to="/procurement"
                onClick={() => flagArrival("po-list")}
                className="flex items-center justify-between border border-border rounded-md p-2 text-sm hover:bg-muted/40 transition-colors"
              >
                <div>
                  <div className="font-medium">{p.id} — {p.vendor}</div>
                  <div className="text-xs text-muted-foreground">{p.items} items • ৳ {p.amount.toLocaleString()}</div>
                </div>
                <StatusBadge status={p.status} />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

/**
 * Active-orders panel: groups legs by Order # (matching the Order Management
 * page) and exposes Flight / Crew tabs so the user can pivot the same orders
 * between pax-focused and crew-focused views. Sized to match the Meal
 * Production Trend chart (~260px scroll area).
 */
function ActiveOrdersTabs({ rows }: { rows: ReturnType<typeof pickActiveFlights> }) {
  const [tab, setTab] = useState<"flight" | "crew">("flight");
  const groups = groupActiveByOrder(rows, 5);

  if (groups.length === 0) {
    return <div className="py-6 text-center text-xs text-muted-foreground">No active orders.</div>;
  }

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as "flight" | "crew")}>
      <TabsList className="h-auto bg-transparent p-0 border-b border-border w-full justify-start rounded-none mb-2">
        <TabsTrigger
          value="flight"
          className="text-[11px] uppercase tracking-wider rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none px-3 pb-1.5"
        >
          Flight Orders
        </TabsTrigger>
        <TabsTrigger
          value="crew"
          className="text-[11px] uppercase tracking-wider rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none px-3 pb-1.5"
        >
          Crew Orders
        </TabsTrigger>
      </TabsList>

      <TabsContent value="flight" className="mt-0">
        <div className="h-[260px] overflow-y-auto space-y-1.5 pr-1">
          {groups.map(([orderNo, legs]) => (
            <OrderGroupCard key={`flight-${orderNo}`} orderNo={orderNo} legs={legs} mode="flight" />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="crew" className="mt-0">
        <div className="h-[260px] overflow-y-auto space-y-1.5 pr-1">
          {groups.map(([orderNo, legs]) => (
            <OrderGroupCard key={`crew-${orderNo}`} orderNo={orderNo} legs={legs} mode="crew" />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}

/** A single Order # block: header line + one leg row per flight. Compact. */
function OrderGroupCard({
  orderNo, legs, mode,
}: {
  orderNo: string;
  legs: ReturnType<typeof pickActiveFlights>;
  mode: "flight" | "crew";
}) {
  const status = legs[0]?.status;
  const legIds = legs.map((l) => l.id);
  const totalPax = legs.reduce((s, l) => s + l.pax, 0);
  const totalCrew = legs.reduce((s, l) => s + l.crew, 0);

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <Link
        to="/order-management"
        onClick={() => flagArrival({ target: "active-orders", ids: legIds })}
        className="flex items-center justify-between bg-primary/5 hover:bg-primary/10 px-2.5 py-1 border-b border-border transition-colors"
      >
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <span className="font-mono text-xs font-semibold text-primary">{orderNo}</span>
          {legs.length > 1 && (
            <Badge variant="outline" className="h-4 px-1 text-[9px] tabular-nums border-primary/30 bg-card text-primary">
              {legs.length} legs
            </Badge>
          )}
          <span className="text-[10px] text-muted-foreground tabular-nums">
            · {mode === "flight" ? `${totalPax} pax` : `${totalCrew} crew`}
          </span>
        </div>
        {status && <StatusBadge status={status} />}
      </Link>

      <div className="divide-y divide-border/60">
        {legs.map((l) => (
          <Link
            key={l.id}
            to="/order-management"
            onClick={() => flagArrival({ target: "active-orders", ids: [l.id] })}
            className="flex items-center gap-2 px-2.5 py-1 hover:bg-muted/40 transition-colors"
          >
            <div className="h-5 w-9 rounded bg-navy text-navy-foreground grid place-items-center text-[9px] font-bold shadow-sm shrink-0">
              {l.flight.slice(-3)}
            </div>
            <div className="flex-1 min-w-0 text-xs truncate">
              <span className="font-medium">{l.flight}</span>
              <span className="text-muted-foreground"> · {l.sector}</span>
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums shrink-0 flex items-center gap-0.5">
              {l.etd}
              <span className="text-border mx-0.5">·</span>
              {mode === "flight"
                ? `${l.pax}p`
                : <><Users className="h-2.5 w-2.5" />{l.crew}</>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/** Wraps a KpiCard in a router link so the whole card becomes clickable. */
function KpiLink({
  to, highlight, ids, children,
}: {
  to: "/order-management" | "/production-entry" | "/cooking-temp"
    | "/procurement" | "/inventory" | "/dispatch";
  highlight?: string;
  ids?: string[];
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      onClick={() => {
        if (highlight) flagArrival({ target: highlight, ids });
      }}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
    >
      {children}
    </Link>
  );
}

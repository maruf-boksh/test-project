import { Link } from "react-router-dom";
import { useState, type ReactNode } from "react";
import { Card, Button, Tag, Input, Popover, Tabs, DatePicker } from "antd";
import {
  RocketOutlined,
  CoffeeOutlined,
  WarningOutlined,
  ShoppingCartOutlined,
  SafetyCertificateOutlined,
  CarOutlined,
  DollarOutlined,
  InboxOutlined,
  TeamOutlined,
  CalendarOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useRole } from "@/lib/roles";
import {
  flights, productionOrders, purchaseOrders, dispatch, qcChecks,
  seedFlightOrders, inventory, inventoryValue,
} from "@/lib/sample-data";
import { useWorkflow } from "@/lib/workflow-store";
import { flagArrival } from "@/lib/arrival-flash";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Legend,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, PieChart, Pie,
} from "recharts";
import { toast } from "sonner";

type Period = "today" | "week" | "custom";

type DateRange = { from: string; to: string };

// Vizyon chart palette — teal/amber/status colors per DESIGN.md §3.
const CHART_PRIMARY  = "#0F766E"; // teal
const CHART_AMBER    = "#D97706"; // amber accent
const CHART_SUCCESS  = "#16A34A"; // green status
const CHART_INFO     = "#0EA5E9"; // sky info
const CHART_COLORS = [CHART_PRIMARY, CHART_AMBER, CHART_SUCCESS, CHART_INFO];

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

function useDashboardKpis(period: Period, range?: DateRange) {
  const { wfRequisitions, wfPurchaseOrders, productionEntries, productionEntryRecords, transferNotes } = useWorkflow();

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

  const customOrders = range
    ? seedFlightOrders.filter((o) =>
        (!range.from || o.date >= range.from) &&
        (!range.to || o.date <= range.to),
      )
    : [];
  const flightsCustom = customOrders.length;
  const flightsCustomIds = customOrders.map((o) => o.id);
  const customDayCount = range
    ? new Set(customOrders.map((o) => o.date)).size
    : 0;

  const producedTotal = productionEntryRecords.reduce((s, r) => s + r.producedQty, 0);
  const targetTotal = productionEntries.reduce(
    (s, p) => s + (p.orderQty ?? p.producedQty),
    0,
  );
  const targetPct = targetTotal > 0 ? Math.round((producedTotal / targetTotal) * 100) : 0;
  const mealsRowIds = productionEntries.map((p) => p.id);

  const delayedFlights = flights.filter((f) => f.status === "Delayed");
  const delayed = delayedFlights.length;
  const delayedFlightCodes = new Set(delayedFlights.map((f) => f.flight));
  const delayedRowIds = seedFlightOrders
    .filter((o) => delayedFlightCodes.has(o.flight))
    .map((o) => o.id);

  const qcFailed = qcChecks.filter((q) => q.result === "Fail");
  const qcOpen = qcFailed.length;
  const qcResolved = qcChecks.filter((q) => q.result === "Pass").length;
  const qcRowIds = qcFailed.map((q) => q.id);

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

  const lowItems = inventory.filter((i) => i.status === "Low");
  const criticalItems = inventory.filter((i) => i.status === "Critical");
  const invAlerts = lowItems.length + criticalItems.length;
  const invAlertRowIds = [...criticalItems.map((i) => i.id), ...lowItems.map((i) => i.id)];

  const activeDispatch = dispatch.filter((d) => d.status !== "Delivered");
  const dispatchActive = activeDispatch.length;
  const dispatchEnRoute = dispatch.filter((d) => d.status === "En Route").length;
  const dispatchRowIds = activeDispatch.map((d) => d.id);

  const stockValue = inventoryValue(inventory);

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
    const factor = 0.78 + ((i * 137) % 50) / 100;
    return {
      d,
      meals: Math.round(producedTotal * factor),
      target: Math.round(targetTotal * factor),
    };
  });

  const isWeek = period === "week";
  const isCustom = period === "custom" && !!range;

  const flightsValue = isCustom ? flightsCustom : isWeek ? flightsWeek : flightsToday;
  const flightsSub = isCustom
    ? `${customDayCount} day${customDayCount === 1 ? "" : "s"} in range`
    : isWeek
      ? `${allDates.length} days covered`
      : `${flightsDelta >= 0 ? "+" : ""}${flightsDelta} vs yesterday`;
  const flightsIds = isCustom ? flightsCustomIds : isWeek ? flightsAllIds : flightsTodayIds;

  return {
    kpis: {
      flights: { value: flightsValue, sub: flightsSub, ids: flightsIds },
      meals:   { value: producedTotal.toLocaleString(), sub: targetTotal > 0 ? `${targetPct}% of target` : "no targets yet", ids: mealsRowIds },
      delayed: { value: delayed, sub: delayed > 0 ? `${Math.max(1, Math.floor(delayed * 0.66))} catering related` : "none", ids: delayedRowIds },
      qcIssues:{ value: qcOpen, sub: `${qcOpen} open, ${qcResolved} resolved`, ids: qcRowIds },
      pendingPOs:{ value: pendingPOCount, sub: pendingPOAmount > 0 ? `${formatLakh(pendingPOAmount)} pending` : "no value pending", ids: pendingPORowIds },
      invAlerts:{ value: invAlerts, sub: `${criticalItems.length} critical`, ids: invAlertRowIds },
      dispatch: { value: dispatchActive, sub: `${dispatchEnRoute} en route`, ids: dispatchRowIds },
      dailyCost:{ value: formatLakh(stockValue), sub: "FEFO stock value", ids: [] as string[] },
    },
    trend: isCustom ? buildCustomTrend(range!, producedTotal, targetTotal) : isWeek ? trendWeek : trendToday,
    trendTitle: isCustom
      ? `Meal Production Trend (${range!.from || "…"} → ${range!.to || "…"})`
      : isWeek ? "Meal Production Trend (Last 7 Days)" : "Meal Production Trend (Today)",
    sectionMix: computeSectionMix(),
    activeFlights: pickActiveFlights(),
    activityFeed: buildActivityFeed({
      wfRequisitions, productionEntryRecords, transferNotes,
    }),
  };
}

function buildCustomTrend(range: DateRange, producedTotal: number, targetTotal: number) {
  const from = range.from ? new Date(range.from) : new Date();
  const to = range.to ? new Date(range.to) : new Date();
  if (isNaN(from.getTime()) || isNaN(to.getTime()) || from > to) {
    return [{ d: "—", meals: producedTotal, target: targetTotal }];
  }
  const dayMs = 24 * 60 * 60 * 1000;
  const dayCount = Math.min(31, Math.floor((to.getTime() - from.getTime()) / dayMs) + 1);
  const dailyMeals = producedTotal / dayCount;
  const dailyTarget = targetTotal / dayCount;
  return Array.from({ length: dayCount }, (_, i) => {
    const cursor = new Date(from.getTime() + i * dayMs);
    const factor = 0.65 + ((i * 173) % 55) / 100;
    return {
      d: cursor.toISOString().slice(5, 10),
      meals: Math.round(dailyMeals * factor),
      target: Math.round(dailyTarget * factor),
    };
  });
}

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

function groupActiveByOrder(rows: ReturnType<typeof pickActiveFlights>, maxOrders = 5) {
  const map = new Map<string, typeof rows>();
  for (const r of rows) {
    const list = map.get(r.orderNo);
    if (list) list.push(r);
    else map.set(r.orderNo, [r]);
  }
  return Array.from(map.entries()).slice(0, maxOrders);
}

function computeSectionMix(): { name: string; v: number }[] {
  const map = new Map<string, number>();
  for (const p of productionOrders) map.set(p.section, (map.get(p.section) ?? 0) + p.qty);
  return Array.from(map.entries()).map(([name, v]) => ({ name, v }));
}

function buildActivityFeed({
  wfRequisitions, productionEntryRecords, transferNotes,
}: {
  wfRequisitions: ReturnType<typeof useWorkflow>["wfRequisitions"];
  productionEntryRecords: ReturnType<typeof useWorkflow>["productionEntryRecords"];
  transferNotes: ReturnType<typeof useWorkflow>["transferNotes"];
}): ActivityEntry[] {
  const out: ActivityEntry[] = [];

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

// Vizyon card surface — used as the consistent wrapper for every dashboard panel.
function PanelCard({
  title,
  link,
  linkLabel,
  highlight,
  children,
}: {
  title: string;
  link?: Parameters<typeof Link>[0]["to"];
  linkLabel?: string;
  highlight?: string;
  children: ReactNode;
}) {
  return (
    <Card
      variant="borderless"
      style={{
        borderRadius: 12,
        border: "1px solid var(--color-border)",
        boxShadow: "0 1px 2px 0 rgba(15, 23, 42, 0.04)",
        background: "var(--color-card)",
        height: "100%",
      }}
      styles={{ body: { padding: 16 } }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-foreground)" }}>{title}</div>
        {link && (
          <Link
            to={link}
            onClick={() => highlight && flagArrival(highlight)}
            style={{ fontSize: 12, color: "var(--color-primary)", textDecoration: "none" }}
          >
            {linkLabel ?? "Open →"}
          </Link>
        )}
      </div>
      {children}
    </Card>
  );
}

export default function Dashboard() {
  const { role } = useRole();
  const [period, setPeriod] = useState<Period>("today");
  const [range, setRange] = useState<DateRange | null>(null);
  const data = useDashboardKpis(period, range ?? undefined);

  const periodLabel =
    period === "today" ? "Today's"
    : period === "week" ? "Weekly"
    : range ? `${range.from} → ${range.to}` : "Custom";

  return (
    <>
      <PageHeader
        title={`${role} Dashboard`}
        subtitle="Live operational overview — US-Bangla Airlines Flight Catering"
        actions={
          <>
            <Button.Group>
              <Button
                type={period === "today" ? "primary" : "default"}
                onClick={() => { setPeriod("today"); setRange(null); }}
              >
                Today
              </Button>
              <Button
                type={period === "week" ? "primary" : "default"}
                onClick={() => { setPeriod("week"); setRange(null); }}
              >
                This Week
              </Button>
              <CustomRangePicker
                active={period === "custom"}
                range={range}
                onApply={(r) => { setRange(r); setPeriod("custom"); }}
                onClear={() => { setRange(null); setPeriod("today"); }}
              />
            </Button.Group>
            <Button
              type="primary"
              onClick={() => toast.success(`${periodLabel} report exported.`)}
            >
              Export Report
            </Button>
          </>
        }
      />

      {/* Vizyon decorative tri-band stripe */}
      <div className="usb-livery-stripe" style={{ height: 4, borderRadius: 4, marginBottom: 20 }} aria-hidden />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiLink to="/order-management" highlight="active-orders" ids={data.kpis.flights.ids}>
          <KpiCard label="Flights Today"   value={data.kpis.flights.value}   sub={data.kpis.flights.sub}   icon={RocketOutlined}            tone="navy"    />
        </KpiLink>
        <KpiLink to="/production-entry" highlight="production-list" ids={data.kpis.meals.ids}>
          <KpiCard label="Meals Prepared"  value={data.kpis.meals.value}     sub={data.kpis.meals.sub}     icon={CoffeeOutlined}            tone="success" />
        </KpiLink>
        <KpiLink to="/order-management" highlight="active-orders" ids={data.kpis.delayed.ids}>
          <KpiCard label="Delayed Flights" value={data.kpis.delayed.value}   sub={data.kpis.delayed.sub}   icon={WarningOutlined}           tone="warning" />
        </KpiLink>
        <KpiLink to="/cooking-temp" highlight="qc-issues" ids={data.kpis.qcIssues.ids}>
          <KpiCard label="QC Issues"       value={data.kpis.qcIssues.value}  sub={data.kpis.qcIssues.sub}  icon={SafetyCertificateOutlined} tone="red"     />
        </KpiLink>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <KpiLink to="/procurement" highlight="po-list" ids={data.kpis.pendingPOs.ids}>
          <KpiCard label="Pending POs"      value={data.kpis.pendingPOs.value} sub={data.kpis.pendingPOs.sub} icon={ShoppingCartOutlined} tone="navy"    />
        </KpiLink>
        <KpiLink to="/inventory" highlight="inv-alerts" ids={data.kpis.invAlerts.ids}>
          <KpiCard label="Inventory Alerts" value={data.kpis.invAlerts.value}  sub={data.kpis.invAlerts.sub}  icon={InboxOutlined}        tone="red"     />
        </KpiLink>
        <KpiLink to="/dispatch" highlight="dispatch-list" ids={data.kpis.dispatch.ids}>
          <KpiCard label="Dispatch Active"  value={data.kpis.dispatch.value}   sub={data.kpis.dispatch.sub}   icon={CarOutlined}          tone="success" />
        </KpiLink>
        <KpiLink to="/inventory" highlight="inv-value">
          <KpiCard label="Daily Cost"       value={data.kpis.dailyCost.value}  sub={data.kpis.dailyCost.sub}  icon={DollarOutlined}       tone="warning" />
        </KpiLink>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <div className="lg:col-span-2">
          <PanelCard title="Active Orders" link="/order-management" linkLabel="View all →" highlight="active-orders">
            <ActiveOrdersTabs rows={data.activeFlights} />
          </PanelCard>
        </div>
        <PanelCard title="Production Mix" link="/production-entry" linkLabel="Open →" highlight="production-list">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.sectionMix} dataKey="v" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                {data.sectionMix.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </PanelCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <div className="lg:col-span-2">
          <PanelCard title={data.trendTitle} link="/production-entry" linkLabel="Open Production →" highlight="production-list">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.trend}>
                <defs>
                  <linearGradient id="grad-meals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_PRIMARY} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={CHART_PRIMARY} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="grad-target" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_AMBER} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={CHART_AMBER} stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="d" stroke="currentColor" className="text-muted-foreground" fontSize={11} />
                <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="meals"  stroke={CHART_PRIMARY} fill="url(#grad-meals)"  strokeWidth={2} />
                <Area type="monotone" dataKey="target" stroke={CHART_AMBER}   fill="url(#grad-target)" strokeWidth={1.5} strokeDasharray="5 3" />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </AreaChart>
            </ResponsiveContainer>
          </PanelCard>
        </div>
        <PanelCard title="Activity Feed">
          {data.activityFeed.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--color-muted-foreground)", fontSize: 12, padding: "16px 0" }}>
              No recent activity.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {data.activityFeed.map((a, i) => {
                const accent = {
                  navy: "#0F766E",
                  success: "#16A34A",
                  destructive: "#DC2626",
                  leaf: "#16A34A",
                  warning: "#D97706",
                }[a.tone];
                return (
                  <Link
                    key={i}
                    to={a.to}
                    onClick={() => a.highlight && flagArrival(a.highlight)}
                    style={{ display: "flex", gap: 12, textDecoration: "none", color: "inherit" }}
                  >
                    <div style={{ fontSize: 11, color: "var(--color-muted-foreground)", width: 48, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
                      {a.t}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        borderLeft: `2px solid ${accent}`,
                        paddingLeft: 12,
                        transition: "background-color 150ms ease",
                        borderRadius: "0 6px 6px 0",
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-foreground)" }}>{a.e}</div>
                      <div style={{ fontSize: 12, color: "var(--color-muted-foreground)" }}>{a.d}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </PanelCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <PanelCard title="Production Progress" link="/production-entry" linkLabel="View orders →" highlight="production-list">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={productionOrders.map(p => ({ name: p.id, progress: p.progress }))}>
              <defs>
                <linearGradient id="grad-bar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"  stopColor={CHART_PRIMARY} stopOpacity={1} />
                  <stop offset="100%" stopColor={CHART_PRIMARY} stopOpacity={0.65} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground" fontSize={11} />
              <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="progress" fill="url(#grad-bar)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </PanelCard>
        <PanelCard title="Procurement Pipeline" link="/procurement" linkLabel="View all →" highlight="po-list">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {purchaseOrders.slice(0, 5).map((p) => (
              <Link
                key={p.id}
                to="/procurement"
                onClick={() => flagArrival("po-list")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  padding: 8,
                  fontSize: 13,
                  textDecoration: "none",
                  color: "inherit",
                  transition: "background-color 150ms ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>{p.id} — {p.vendor}</div>
                  <div style={{ fontSize: 12, color: "var(--color-muted-foreground)" }}>
                    {p.items} items • ৳ {p.amount.toLocaleString()}
                  </div>
                </div>
                <StatusBadge status={p.status} />
              </Link>
            ))}
          </div>
        </PanelCard>
      </div>
    </>
  );
}

function ActiveOrdersTabs({ rows }: { rows: ReturnType<typeof pickActiveFlights> }) {
  const [tab, setTab] = useState<"flight" | "crew">("flight");
  const groups = groupActiveByOrder(rows, 5);

  if (groups.length === 0) {
    return (
      <div style={{ padding: "24px 0", textAlign: "center", fontSize: 12, color: "var(--color-muted-foreground)" }}>
        No active orders.
      </div>
    );
  }

  return (
    <Tabs
      activeKey={tab}
      onChange={(k) => setTab(k as "flight" | "crew")}
      size="small"
      items={[
        {
          key: "flight",
          label: "Flight Orders",
          children: (
            <div style={{ maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6, paddingRight: 4 }}>
              {groups.map(([orderNo, legs]) => (
                <OrderGroupCard key={`flight-${orderNo}`} orderNo={orderNo} legs={legs} mode="flight" />
              ))}
            </div>
          ),
        },
        {
          key: "crew",
          label: "Crew Orders",
          children: (
            <div style={{ maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6, paddingRight: 4 }}>
              {groups.map(([orderNo, legs]) => (
                <OrderGroupCard key={`crew-${orderNo}`} orderNo={orderNo} legs={legs} mode="crew" />
              ))}
            </div>
          ),
        },
      ]}
    />
  );
}

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
    <div
      style={{
        borderRadius: 8,
        border: "1px solid var(--color-border)",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <Link
        to="/order-management"
        onClick={() => flagArrival({ target: "active-orders", ids: legIds })}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--accent)",
          padding: "4px 10px",
          borderBottom: "1px solid var(--color-border)",
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: "var(--color-primary)" }}>
            {orderNo}
          </span>
          {legs.length > 1 && (
            <Tag
              bordered
              style={{
                height: 16,
                padding: "0 4px",
                fontSize: 9,
                fontVariantNumeric: "tabular-nums",
                background: "var(--color-card)",
                color: "var(--color-primary)",
                borderColor: "rgba(15, 118, 110, 0.30)",
                margin: 0,
                lineHeight: "14px",
              }}
            >
              {legs.length} legs
            </Tag>
          )}
          <span style={{ fontSize: 10, color: "var(--color-muted-foreground)", fontVariantNumeric: "tabular-nums" }}>
            · {mode === "flight" ? `${totalPax} pax` : `${totalCrew} crew`}
          </span>
        </div>
        {status && <StatusBadge status={status} />}
      </Link>

      <div>
        {legs.map((l, idx) => (
          <Link
            key={l.id}
            to="/order-management"
            onClick={() => flagArrival({ target: "active-orders", ids: [l.id] })}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 10px",
              minHeight: 32,
              background: "#ffffff",
              borderTop: idx > 0 ? "1px solid var(--color-border)" : "none",
              textDecoration: "none",
              color: "inherit",
              transition: "background-color 150ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F0FDFA")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
          >
            <div
              style={{
                height: 20,
                width: 36,
                borderRadius: 4,
                background: "#0F766E",
                color: "white",
                display: "grid",
                placeItems: "center",
                fontSize: 9,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {l.flight.slice(-3)}
            </div>
            <div style={{ flex: 1, minWidth: 0, fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              <span style={{ fontWeight: 500 }}>{l.flight}</span>
              <span style={{ color: "var(--color-muted-foreground)" }}> · {l.sector}</span>
            </div>
            <div style={{ fontSize: 10, color: "var(--color-muted-foreground)", fontVariantNumeric: "tabular-nums", flexShrink: 0, display: "flex", alignItems: "center", gap: 2 }}>
              {l.etd}
              <span style={{ color: "var(--color-border)", margin: "0 2px" }}>·</span>
              {mode === "flight" ? `${l.pax}p` : <><TeamOutlined style={{ fontSize: 10 }} />{l.crew}</>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function CustomRangePicker({
  active, range, onApply, onClear,
}: {
  active: boolean;
  range: DateRange | null;
  onApply: (r: DateRange) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(range?.from ?? "");
  const [draftTo, setDraftTo] = useState(range?.to ?? "");

  const handleApply = () => {
    if (!draftFrom || !draftTo) {
      toast.error("Pick both From and To dates.");
      return;
    }
    if (draftFrom > draftTo) {
      toast.error("From date must be on or before To date.");
      return;
    }
    onApply({ from: draftFrom, to: draftTo });
    setOpen(false);
    toast.success(`Filtered to ${draftFrom} → ${draftTo}.`);
  };

  const showLabel = active && range ? `${range.from.slice(5)} → ${range.to.slice(5)}` : "Custom";

  const content = (
    <div style={{ width: 280 }}>
      <div className="field-label" style={{ marginBottom: 8 }}>Custom Date Range</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        <div>
          <div className="field-label" style={{ marginBottom: 4 }}>From</div>
          <Input
            type="date"
            value={draftFrom}
            onChange={(e) => setDraftFrom(e.target.value)}
            max={draftTo || undefined}
            size="small"
          />
        </div>
        <div>
          <div className="field-label" style={{ marginBottom: 4 }}>To</div>
          <Input
            type="date"
            value={draftTo}
            onChange={(e) => setDraftTo(e.target.value)}
            min={draftFrom || undefined}
            size="small"
          />
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
        {([
          { label: "Last 7d",    days: 7 },
          { label: "Last 14d",   days: 14 },
          { label: "Last 30d",   days: 30 },
          { label: "This Month", days: -1 },
        ] as const).map((preset) => (
          <Button
            key={preset.label}
            size="small"
            type="default"
            shape="round"
            style={{ fontSize: 10 }}
            onClick={() => {
              const today = new Date();
              let from: Date;
              if (preset.days === -1) {
                from = new Date(today.getFullYear(), today.getMonth(), 1);
              } else {
                from = new Date(today.getTime() - (preset.days - 1) * 86400000);
              }
              setDraftFrom(from.toISOString().slice(0, 10));
              setDraftTo(today.toISOString().slice(0, 10));
            }}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 8, borderTop: "1px solid var(--color-border)" }}>
        <Button size="small" type="text" onClick={() => setOpen(false)}>Cancel</Button>
        <Button size="small" type="primary" onClick={handleApply}>Apply</Button>
      </div>
    </div>
  );

  // Avoid unused-import warning while still keeping DatePicker accessible to
  // any future inline calendar variant.
  void DatePicker;

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) { setDraftFrom(range?.from ?? ""); setDraftTo(range?.to ?? ""); }
      }}
      content={content}
      trigger="click"
      placement="bottomRight"
    >
      <Button
        type={active ? "primary" : "default"}
        icon={<CalendarOutlined />}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {showLabel}
        {active && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onClear();
              }
            }}
            style={{
              marginLeft: 4,
              marginRight: -4,
              padding: 2,
              borderRadius: 4,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
            }}
            aria-label="Clear custom range"
            title="Clear"
          >
            <CloseOutlined style={{ fontSize: 10 }} />
          </span>
        )}
      </Button>
    </Popover>
  );
}

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
      style={{ display: "block", textDecoration: "none", color: "inherit", borderRadius: 12 }}
    >
      {children}
    </Link>
  );
}

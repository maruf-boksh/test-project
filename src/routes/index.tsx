import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { useRole } from "@/lib/roles";
import { Plane, UtensilsCrossed, AlertTriangle, ShoppingCart, ShieldAlert, Truck, DollarSign, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { flights, productionOrders, purchaseOrders } from "@/lib/sample-data";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Legend,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, PieChart, Pie,
} from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — US-Bangla Catering ERP" }] }),
  component: Dashboard,
});

const mealTrend = [
  { d: "Mon", meals: 2840, target: 3000 }, { d: "Tue", meals: 3120, target: 3000 },
  { d: "Wed", meals: 2980, target: 3000 }, { d: "Thu", meals: 3340, target: 3000 },
  { d: "Fri", meals: 3680, target: 3500 }, { d: "Sat", meals: 4120, target: 3500 },
  { d: "Sun", meals: 3920, target: 3500 },
];
const sectionMix = [
  { name: "Hot Kitchen", v: 1840 }, { name: "Cold Kitchen", v: 920 },
  { name: "Bakery", v: 640 }, { name: "Beverage", v: 520 },
];
const COLORS = ["#1E3A8A", "#B91C1C", "#0EA5A4", "#F59E0B"];

function Dashboard() {
  const { role } = useRole();
  return (
    <>
      <PageHeader
        title={`${role} Dashboard`}
        subtitle="Live operational overview — US-Bangla Airlines Flight Catering"
        actions={
          <>
            <Button variant="outline">Today</Button>
            <Button variant="outline">This Week</Button>
            <Button>Export Report</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Flights Today" value={42} sub="+8 vs yesterday" icon={Plane} tone="navy" />
        <KpiCard label="Meals Prepared" value="3,920" sub="98% of target" icon={UtensilsCrossed} tone="success" />
        <KpiCard label="Delayed Flights" value={3} sub="2 catering related" icon={AlertTriangle} tone="warning" />
        <KpiCard label="QC Issues" value={1} sub="1 open, 4 resolved" icon={ShieldAlert} tone="red" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <KpiCard label="Pending POs" value={6} sub="৳ 7.5L pending" icon={ShoppingCart} tone="navy" />
        <KpiCard label="Inventory Alerts" value={4} sub="2 critical" icon={Package} tone="red" />
        <KpiCard label="Dispatch Active" value={9} sub="3 en route" icon={Truck} tone="success" />
        <KpiCard label="Daily Cost" value="৳ 14.2L" sub="-3% MoM" icon={DollarSign} tone="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Meal Production Trend (Last 7 Days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={mealTrend}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1E3A8A" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#1E3A8A" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="d" /><YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="meals" stroke="#1E3A8A" fill="url(#g1)" strokeWidth={2} />
                <Area type="monotone" dataKey="target" stroke="#B91C1C" fill="transparent" strokeDasharray="5 3" />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Production Mix</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={sectionMix} dataKey="v" nameKey="name" innerRadius={50} outerRadius={90}>
                  {sectionMix.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Active Flights</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {flights.slice(0, 5).map((f) => (
              <div key={f.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 border border-border">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded bg-navy text-navy-foreground grid place-items-center text-xs font-bold">
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
        <Card>
          <CardHeader><CardTitle>Activity Feed</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { t: "06:14", e: "Manifest imported", d: "BS-203 — 168 pax" },
              { t: "06:08", e: "PO Approved", d: "PO-2025-0450 by Accounts" },
              { t: "05:52", e: "QC Failed", d: "PRD-9006 visual inspection" },
              { t: "05:30", e: "Production started", d: "Hot Kitchen — BS-307" },
              { t: "05:15", e: "Low stock alert", d: "Tomato — 22 Kg" },
            ].map((a, i) => (
              <div key={i} className="flex gap-3">
                <div className="text-xs text-muted-foreground w-12 mt-0.5">{a.t}</div>
                <div className="flex-1 border-l-2 border-primary/30 pl-3">
                  <div className="font-medium">{a.e}</div>
                  <div className="text-xs text-muted-foreground">{a.d}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <Card>
          <CardHeader><CardTitle>Production Status by Section</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={productionOrders.map(p => ({ name: p.id, progress: p.progress }))}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" /><YAxis />
                <Tooltip /><Bar dataKey="progress" fill="#1E3A8A" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Procurement Pipeline</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {purchaseOrders.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center justify-between border border-border rounded-md p-2 text-sm">
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

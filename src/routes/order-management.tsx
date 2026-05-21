import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, Fragment } from "react";
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
  History, CheckCircle2, AlertCircle, Eye, CalendarRange, X, Plane, ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  recentUploads, seedFlightOrders,
  FLIGHT_ORDER_STATUS_FLOW, nextFlightStatus,
  MEAL_SLOTS, getMealSlot, isDomesticSector,
  SPECIAL_MEAL_CODES, SPECIAL_MEAL_BY_CODE,
  type FlightDirection, type FlightOrderStatus, type MealSlot,
  type SpecialMealEntry, type SpecialMealCategory,
} from "@/lib/sample-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function OrderStatusBadges({ legs }: { legs: { status: FlightOrderStatus }[] }) {
  if (legs.length === 0) return null;
  return <StatusBadge status={legs[0].status} />;
}

export const Route = createFileRoute("/order-management")({
  head: () => ({ meta: [{ title: "Order Management" }] }),
  component: OrderManagementPage,
});

type FlightOrder = {
  id: string;        // unique row id (one row = one flight)
  orderNo: string;   // the displayed Order # — repeats across legs of the same order
  flight: string;
  airline: string;
  sector: string;
  date: string;
  etd: string;
  pax: number;
  crew: number;
  specialMeals: number;
  status: FlightOrderStatus;
  direction: FlightDirection;
  specialMealRoster?: SpecialMealEntry[];
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
  const [view, setView] = useState<"list" | "create" | "bulk" | "crew-create">("list");
  const [selectedOrder, setSelectedOrder] = useState<FlightOrder | null>(null);
  const [activeTab, setActiveTab] = useState<"flights" | "crew">("flights");

  // When the user clicks View on any leg, surface ALL legs of that order
  // in the details dialog by filtering against orderNo.
  const selectedLegs = selectedOrder
    ? orders.filter((o) => o.orderNo === selectedOrder.orderNo)
    : [];

  const addOrder = (legs: FlightOrder[]) => {
    setOrders((prev) => [...legs, ...prev]);
    setView("list");
  };

  const addOrdersBulk = (newOrders: FlightOrder[]) => {
    setOrders((prev) => [...newOrders, ...prev]);
    setView("list");
  };

  const advanceStatus = (rowId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== rowId) return o;
        const next = nextFlightStatus(o.status);
        if (!next) {
          toast.info(`${o.flight} is already Completed.`);
          return o;
        }
        toast.success(`${o.flight} moved to ${next}.`);
        return { ...o, status: next };
      }),
    );
  };

  const advanceOrderStatus = (orderNo: string) => {
    setOrders((prev) => {
      let moved = 0;
      const updated = prev.map((o) => {
        if (o.orderNo !== orderNo) return o;
        const next = nextFlightStatus(o.status);
        if (!next) return o;
        moved += 1;
        return { ...o, status: next };
      });
      if (moved > 0) toast.success(`${orderNo} — advanced ${moved} ${moved === 1 ? "leg" : "legs"}.`);
      else toast.info(`${orderNo} is already Completed.`);
      return updated;
    });
  };

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
              <Button
                onClick={() => {
                  setView(activeTab === "crew" ? "crew-create" : "create");
                }}
              >
                <Plus className="h-4 w-4 mr-1" /> Create Order
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setView("list")}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          )
        }
      />

      {view === "list" && (
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "flights" | "crew")}
          className="space-y-4"
        >
          <TabsList className="h-auto bg-transparent p-0 border-b border-border w-full justify-start rounded-none">
            <TabsTrigger
              value="flights"
              className="text-xs uppercase tracking-wider rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none px-4 pb-3"
            >
              Flight Orders
            </TabsTrigger>
            <TabsTrigger
              value="crew"
              className="text-xs uppercase tracking-wider rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none px-4 pb-3"
            >
              Crew Meals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flights" className="mt-0">
            <OrdersList orders={orders} onView={setSelectedOrder} />
          </TabsContent>

          <TabsContent value="crew" className="mt-0">
            <CrewMealsView orders={orders} />
          </TabsContent>
        </Tabs>
      )}
      {view === "create" && (
        <OrderCreate
          onSave={addOrder}
          nextOrderNo={`ORD-${(Math.max(
            3410,
            ...orders.map((o) => Number(o.orderNo.split("-").pop()) || 0),
          )) + 1}`}
          nextRowSeq={orders.length + 1}
        />
      )}
      {view === "crew-create" && (
        <CrewMealCreate
          onSave={addOrder}
          nextOrderNo={`ORD-${(Math.max(
            3410,
            ...orders.map((o) => Number(o.orderNo.split("-").pop()) || 0),
          )) + 1}`}
          nextRowSeq={orders.length + 1}
        />
      )}
      {view === "bulk" && <BulkUpload onImport={addOrdersBulk} />}

      <FlightOrderDetailsDialog
        order={selectedOrder}
        legs={selectedLegs}
        onAdvanceLeg={advanceStatus}
        onAdvanceOrder={advanceOrderStatus}
        onClose={() => setSelectedOrder(null)}
      />
    </>
  );
}

function CrewMealsView({ orders }: { orders: FlightOrder[] }) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState<string>(today);
  const [scope, setScope] = useState<"Domestic" | "International" | "All">("Domestic");

  const filtered = orders.filter((o) => {
    if (date && o.date !== date) return false;
    if (scope === "Domestic" && !isDomesticSector(o.sector)) return false;
    if (scope === "International" && isDomesticSector(o.sector)) return false;
    return true;
  });

  // Group by meal slot
  const groups = new Map<MealSlot, FlightOrder[]>();
  MEAL_SLOTS.forEach((s) => groups.set(s.name, []));
  filtered.forEach((o) => {
    const slot = getMealSlot(o.etd);
    groups.get(slot)!.push(o);
  });
  MEAL_SLOTS.forEach((s) => {
    groups.get(s.name)!.sort((a, b) => a.etd.localeCompare(b.etd));
  });

  const grandCrew = filtered.reduce((s, o) => s + o.crew, 0);
  const grandPax = filtered.reduce((s, o) => s + o.pax, 0);

  return (
    <Card>
      <CardContent className="pt-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground">
              Meal for {scope === "All" ? "All" : scope} Flights
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cabin-crew meal orders grouped by meal slot — derived from each flight's ETD.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 shadow-sm">
              <CalendarRange className="h-3.5 w-3.5 text-muted-foreground" />
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-7 w-[140px] border-0 shadow-none px-1 focus-visible:ring-0"
              />
            </div>
            <div className="inline-flex rounded-md border border-input bg-background p-0.5 shadow-sm">
              {(["Domestic", "International", "All"] as const).map((s) => {
                const active = scope === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setScope(s)}
                    className={
                      "px-3 py-1.5 text-xs font-medium rounded-sm transition-colors " +
                      (active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground")
                    }
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No {scope.toLowerCase()} flights on {date || "the selected date"}.
          </div>
        ) : (
          <>
            <div className="border border-border rounded-md overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="text-xs uppercase tracking-wider w-32">Flight No</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider">Sector</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider w-20">ETD</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-right w-24">PAX</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-right w-28">No of Crew</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MEAL_SLOTS.map((slot) => {
                    const slotRows = groups.get(slot.name)!;
                    if (slotRows.length === 0) return null;
                    const slotCrew = slotRows.reduce((s, o) => s + o.crew, 0);

                    // Group rows in this slot by Order #
                    const slotOrderGroups = new Map<string, FlightOrder[]>();
                    slotRows.forEach((o) => {
                      const list = slotOrderGroups.get(o.orderNo);
                      if (list) list.push(o);
                      else slotOrderGroups.set(o.orderNo, [o]);
                    });

                    return (
                      <Fragment key={slot.name}>
                        <TableRow className="bg-primary/5 border-t-2 border-t-primary/40 hover:bg-primary/10">
                          <TableCell colSpan={5} className="py-2">
                            <span className="font-semibold text-primary uppercase tracking-wider text-xs">
                              {slot.name}
                            </span>
                            <span className="ml-2 text-[10px] text-muted-foreground tabular-nums">
                              {slot.range}
                            </span>
                          </TableCell>
                        </TableRow>
                        {Array.from(slotOrderGroups.entries()).map(([orderNo, legs]) => (
                          <Fragment key={`${slot.name}-${orderNo}`}>
                            <TableRow className="bg-muted/40 hover:bg-muted/50">
                              <TableCell colSpan={5} className="pl-4 py-1.5">
                                <div className="flex items-center flex-wrap gap-2">
                                  <span className="font-mono text-sm font-semibold text-primary">{orderNo}</span>
                                  {legs.length > 1 && (
                                    <Badge
                                      variant="outline"
                                      className="h-5 px-1.5 text-[10px] tabular-nums border-primary/30 bg-card text-primary"
                                    >
                                      {legs.length} legs
                                    </Badge>
                                  )}
                                  <OrderStatusBadges legs={legs} />
                                </div>
                              </TableCell>
                            </TableRow>
                            {legs.map((o) => (
                              <TableRow key={o.id} className="hover:bg-muted/30">
                                <TableCell className="font-mono text-xs pl-8">
                                  <span className="inline-flex items-center gap-1.5">
                                    {o.flight}
                                    <DirectionBadge direction={o.direction} />
                                  </span>
                                </TableCell>
                                <TableCell>{o.sector}</TableCell>
                                <TableCell className="tabular-nums">{o.etd}</TableCell>
                                <TableCell className="text-right tabular-nums">{o.pax}</TableCell>
                                <TableCell className="text-right tabular-nums font-semibold">{o.crew}</TableCell>
                              </TableRow>
                            ))}
                          </Fragment>
                        ))}
                        <TableRow className="bg-muted/30 font-semibold">
                          <TableCell colSpan={4} className="text-right uppercase text-[10px] tracking-wider">
                            {slot.name} Total
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-primary">{slotCrew}</TableCell>
                        </TableRow>
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Flights</div>
                <div className="mt-1 text-lg font-semibold tabular-nums">{filtered.length}</div>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Passenger Meals</div>
                <div className="mt-1 text-lg font-semibold tabular-nums">{grandPax}</div>
              </div>
              <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Crew Meals</div>
                <div className="mt-1 text-lg font-semibold tabular-nums text-primary">{grandCrew}</div>
              </div>
            </div>
          </>
        )}
      </CardContent>

    </Card>
  );
}

function WorkflowStrip({
  statuses, counts,
}: {
  statuses: FlightOrderStatus[];
  counts: Record<FlightOrderStatus, number>;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
        Status Workflow
      </div>
      <div className="flex items-center gap-1 overflow-x-auto">
        {statuses.map((s, i) => {
          const count = counts[s] ?? 0;
          const active = count > 0;
          return (
            <div key={s} className="flex items-center gap-1 flex-shrink-0">
              <div
                className={
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs border " +
                  (active
                    ? "bg-primary/5 border-primary/30 text-foreground font-medium"
                    : "bg-muted/40 border-border text-muted-foreground")
                }
              >
                <span
                  className={
                    "inline-flex items-center justify-center h-4 w-4 rounded-full text-[9px] font-semibold " +
                    (active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")
                  }
                >
                  {i + 1}
                </span>
                {s}
                {count > 0 && (
                  <span className="text-[10px] tabular-nums text-muted-foreground ml-0.5">
                    ({count})
                  </span>
                )}
              </div>
              {i < statuses.length - 1 && (
                <span className="text-muted-foreground text-xs">→</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DirectionBadge({ direction }: { direction: FlightDirection }) {
  const isReturn = direction === "Return";
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium border " +
        (isReturn
          ? "border-navy/30 bg-navy/5 text-navy"
          : "border-success/30 bg-success/5 text-success")
      }
      title={isReturn ? "Return flight" : "Outbound flight"}
    >
      {isReturn ? "↺" : "↗"} {direction}
    </span>
  );
}

function OrdersList({
  orders, onView,
}: {
  orders: FlightOrder[];
  onView: (o: FlightOrder) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [airline, setAirline] = useState<string>("All");

  const airlineOptions = Array.from(new Set(orders.map((o) => o.airline))).sort();

  const filteredOrders = orders.filter((o) => {
    if (from && o.date < from) return false;
    if (to && o.date > to) return false;
    if (airline !== "All" && o.airline !== airline) return false;
    return true;
  });

  const pendingCount = filteredOrders.filter((o) => o.status === "Pending").length;
  const rangeActive = from !== "" || to !== "";
  const filtersActive = rangeActive || airline !== "All";
  const rangeLabel =
    from && to
      ? from === to
        ? from === today ? "Today" : from
        : `${from} → ${to}`
      : from
      ? `From ${from}`
      : to
      ? `Until ${to}`
      : "All Dates";

  const clearRange = () => { setFrom(""); setTo(""); };
  const setToday = () => { setFrom(today); setTo(today); };
  const clearAll = () => { setFrom(""); setTo(""); setAirline("All"); };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground">
            Flight Orders — {rangeLabel}
            {airline !== "All" && <span className="text-muted-foreground normal-case font-normal"> · {airline}</span>}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 shadow-sm">
              <CalendarRange className="h-3.5 w-3.5 text-muted-foreground" />
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">From</Label>
              <Input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                max={to || undefined}
                className="h-7 w-[140px] border-0 shadow-none px-1 focus-visible:ring-0"
              />
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">To</Label>
              <Input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                min={from || undefined}
                className="h-7 w-[140px] border-0 shadow-none px-1 focus-visible:ring-0"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-2.5 text-xs"
              onClick={setToday}
            >
              Today
            </Button>
            {rangeActive && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-xs text-muted-foreground"
                onClick={clearRange}
                aria-label="Clear date range"
              >
                <X className="h-3.5 w-3.5 mr-1" /> Date
              </Button>
            )}
            <div className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 shadow-sm">
              <Plane className="h-3.5 w-3.5 text-muted-foreground" />
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Airline</Label>
              <select
                value={airline}
                onChange={(e) => setAirline(e.target.value)}
                className="h-7 bg-transparent border-0 text-sm focus:outline-none focus:ring-0 pr-1"
              >
                <option value="All">All</option>
                {airlineOptions.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            {filtersActive && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-xs text-muted-foreground"
                onClick={clearAll}
                aria-label="Clear all filters"
              >
                <X className="h-3.5 w-3.5 mr-1" /> Clear All
              </Button>
            )}
            {pendingCount > 0 && (
              <Badge className="bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/10">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive mr-1.5" />
                {pendingCount} Pending
              </Badge>
            )}
          </div>
        </div>

        <div className="text-xs text-muted-foreground mb-2">
          Showing <strong className="text-foreground tabular-nums">{filteredOrders.length}</strong> of {orders.length} order{orders.length === 1 ? "" : "s"}
        </div>

        <div className="border border-border rounded-md overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-xs uppercase tracking-wider">Flight</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Airline</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Sector</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Date</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">ETD</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-right">PAX</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-right">Spec. Meals</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">
                    No flight orders match the selected filters.
                  </TableCell>
                </TableRow>
              ) : (() => {
                // Group rows by Order # (preserving the order they first appear in)
                const grouped = new Map<string, FlightOrder[]>();
                filteredOrders.forEach((o) => {
                  const list = grouped.get(o.orderNo);
                  if (list) list.push(o);
                  else grouped.set(o.orderNo, [o]);
                });

                const rows: React.ReactNode[] = [];
                grouped.forEach((legs, orderNo) => {
                  rows.push(
                    <TableRow
                      key={`grp-${orderNo}`}
                      className="bg-primary/5 hover:bg-primary/10 border-t-2 border-t-primary/40"
                    >
                      <TableCell
                        colSpan={8}
                        className="font-mono text-sm font-semibold text-foreground py-2"
                      >
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="text-primary">{orderNo}</span>
                          {legs.length > 1 && (
                            <Badge
                              variant="outline"
                              className="h-5 px-1.5 text-[10px] tabular-nums border-primary/30 bg-card text-primary"
                            >
                              {legs.length} legs
                            </Badge>
                          )}
                          <OrderStatusBadges legs={legs} />
                        </div>
                      </TableCell>
                    </TableRow>,
                  );
                  legs.forEach((o) => {
                    const isReturn = o.direction === "Return";
                    rows.push(
                      <TableRow key={o.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium pl-6">
                          <div className="flex items-center gap-1.5">
                            {o.flight}
                            <DirectionBadge direction={o.direction} />
                          </div>
                        </TableCell>
                        <TableCell>{o.airline}</TableCell>
                        <TableCell>
                          <span className={isReturn ? "text-muted-foreground" : undefined}>
                            {o.sector}
                          </span>
                        </TableCell>
                        <TableCell className="tabular-nums text-xs">{o.date}</TableCell>
                        <TableCell>{o.etd}</TableCell>
                        <TableCell className="text-right tabular-nums">{o.pax}</TableCell>
                        <TableCell className="text-right tabular-nums">{o.specialMeals}</TableCell>
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
                      </TableRow>,
                    );
                  });
                });
                return rows;
              })()}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

const selectCls =
  "w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

type LegDraft = {
  flight: string;
  sector: string;
  etd: string;
  pax: number;
  specialMeals: number;
  status: FlightOrderStatus;
  direction: FlightDirection;
  roster: SpecialMealEntry[];
};

type RosterDraft = Omit<SpecialMealEntry, "id">;

const EMPTY_ROSTER_ROW: RosterDraft = { pnr: "", passengerName: "", seat: "", mealCode: "AVML" };

let rosterIdSeq = 9000;
const nextRosterId = () => `SM-${++rosterIdSeq}`;

function OrderCreate({
  onSave, nextOrderNo, nextRowSeq,
}: {
  onSave: (legs: FlightOrder[]) => void;
  nextOrderNo: string;
  nextRowSeq: number;
}) {
  const [scope, setScope] = useState<"Domestic" | "International">("Domestic");
  const [flight, setFlight] = useState("");
  const [airline, setAirline] = useState(AIRLINES[0]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [etd, setEtd] = useState("");
  const [pax, setPax] = useState("");
  const [direction, setDirection] = useState<FlightDirection>("Outbound");
  const [roster, setRoster] = useState<SpecialMealEntry[]>([]);
  const [bulkPaste, setBulkPaste] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [legs, setLegs] = useState<LegDraft[]>([]);

  const domesticCodes = ["DAC", "CGP", "CXB", "ZYL", "JSR"];
  const airportChoices = scope === "Domestic"
    ? AIRPORTS.filter((a) => domesticCodes.includes(a.code))
    : AIRPORTS;

  const onScopeChange = (next: "Domestic" | "International") => {
    setScope(next);
    // If the currently-picked airport doesn't belong to the new scope, clear it.
    const isDomCode = (code: string) => domesticCodes.includes(code);
    if (next === "Domestic") {
      if (from && !isDomCode(from)) setFrom("");
      if (to && !isDomCode(to)) setTo("");
    }
    // For International we keep whatever was selected — all codes are valid.
  };

  const resetForm = () => {
    setFlight(""); setFrom(""); setTo("");
    setEtd(""); setPax("");
    setDirection("Outbound");
    setRoster([]);
    setBulkPaste("");
    setShowBulk(false);
  };

  const addRosterRow = () =>
    setRoster((prev) => [...prev, { id: nextRosterId(), ...EMPTY_ROSTER_ROW }]);

  const updateRosterRow = (id: string, patch: Partial<RosterDraft>) =>
    setRoster((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const removeRosterRow = (id: string) =>
    setRoster((prev) => prev.filter((r) => r.id !== id));

  // Bulk paste: TSV/CSV in column order PNR, Name, Seat, Code
  const applyBulkPaste = () => {
    const lines = bulkPaste.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      toast.error("Paste at least one row.");
      return;
    }
    const validCodes = new Set(SPECIAL_MEAL_CODES.map((m) => m.code));
    const parsed: SpecialMealEntry[] = [];
    let skipped = 0;
    lines.forEach((line) => {
      const parts = line.split(/[,\t]/).map((p) => p.trim());
      if (parts.length < 4) { skipped += 1; return; }
      const [pnr, passengerName, seat, mealCode] = parts;
      const code = mealCode.toUpperCase();
      if (!validCodes.has(code)) { skipped += 1; return; }
      parsed.push({ id: nextRosterId(), pnr, passengerName, seat, mealCode: code });
    });
    if (parsed.length === 0) {
      toast.error("No valid rows. Format: PNR, Name, Seat, Code (one per line).");
      return;
    }
    setRoster((prev) => [...prev, ...parsed]);
    setBulkPaste("");
    setShowBulk(false);
    toast.success(`Imported ${parsed.length} passenger${parsed.length === 1 ? "" : "s"}.${skipped ? ` ${skipped} skipped.` : ""}`);
  };

  const addLeg = () => {
    if (!flight.trim()) { toast.error("Flight number is required."); return; }
    if (!from || !to) { toast.error("Sector (From → To) is required."); return; }
    if (from === to) { toast.error("From and To must be different airports."); return; }
    const paxNum = Number(pax);
    if (!paxNum || paxNum <= 0) { toast.error("PAX must be greater than zero."); return; }
    // Drop any roster rows the user left blank
    const cleanRoster = roster.filter((r) => r.pnr.trim() && r.passengerName.trim() && r.seat.trim() && r.mealCode);
    setLegs((prev) => [
      ...prev,
      {
        flight: flight.trim().toUpperCase(),
        sector: `${from} → ${to}`,
        etd: etd || "—",
        pax: paxNum,
        specialMeals: cleanRoster.length,
        status: "Pending",
        direction,
        roster: cleanRoster,
      },
    ]);
    resetForm();
  };

  const removeLeg = (i: number) =>
    setLegs((prev) => prev.filter((_, idx) => idx !== i));

  // Pre-fill the form with the return-flight version of the last added Outbound:
  // swap From/To, bump the flight number (e.g. BG-401 → BG-402), clear ETD/PAX.
  const prefillReturn = () => {
    const lastOutbound = [...legs].reverse().find((l) => l.direction === "Outbound");
    if (!lastOutbound) {
      toast.error("Add an Outbound leg first.");
      return;
    }
    const [origFrom, origTo] = lastOutbound.sector.split(" → ");
    if (!origFrom || !origTo) return;
    const flightMatch = lastOutbound.flight.match(/^(.+?)(\d+)$/);
    const nextFlight = flightMatch
      ? `${flightMatch[1]}${Number(flightMatch[2]) + 1}`
      : `${lastOutbound.flight}-R`;
    setFrom(origTo);
    setTo(origFrom);
    setFlight(nextFlight);
    setEtd("");
    setPax("");
    setRoster([]);
    setDirection("Return");
    toast.info(`Pre-filled return for ${lastOutbound.flight} — review and click Add Leg.`);
  };

  const handleSave = () => {
    if (legs.length === 0) {
      toast.error("Add at least one flight leg.");
      return;
    }
    const rows: FlightOrder[] = legs.map((l, i) => ({
      id: `FO-${String(nextRowSeq + i).padStart(3, "0")}`,
      orderNo: nextOrderNo,
      flight: l.flight,
      airline,
      sector: l.sector,
      date,
      etd: l.etd,
      pax: l.pax,
      crew: 16,
      specialMeals: l.specialMeals,
      status: l.status,
      direction: l.direction,
      specialMealRoster: l.roster.length > 0 ? l.roster : undefined,
    }));
    onSave(rows);
    toast.success(`${nextOrderNo} created with ${legs.length} ${legs.length === 1 ? "leg" : "legs"}.`);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground">
              Create Flight Order
              <span className="ml-2 font-mono text-xs text-primary normal-case tracking-normal">
                {nextOrderNo}
              </span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              All flights added below share this Order # — each leg becomes its own row in the list.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={addLeg}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Leg
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-1.5" /> Save
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 mb-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Scope</Label>
            <div className="mt-1 inline-flex rounded-md border border-input bg-background p-0.5 shadow-sm">
              {(["Domestic", "International"] as const).map((s) => {
                const active = scope === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onScopeChange(s)}
                    className={
                      "px-3 py-1.5 text-xs font-medium rounded-sm transition-colors " +
                      (active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")
                    }
                  >
                    {s}
                  </button>
                );
              })}
            </div>
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
              Date
            </Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div className="border-t border-border pt-4 mb-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
            New Leg
          </h4>
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
              From <span className="text-destructive">*</span>
            </Label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className={selectCls}
            >
              <option value="">Select origin</option>
              {airportChoices.map((a) => (
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
              {airportChoices.map((a) => (
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
            <div className="mt-1 h-9 rounded-md border border-input bg-muted/40 px-3 flex items-center justify-between text-sm">
              <span className="tabular-nums font-semibold text-foreground">{roster.length}</span>
              <span className="text-[11px] text-muted-foreground">auto from roster below</span>
            </div>
          </div>

          <div className="md:col-span-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Direction
            </Label>
            <div className="mt-1 inline-flex rounded-md border border-input bg-background p-0.5 shadow-sm">
              {(["Outbound", "Return"] as FlightDirection[]).map((d) => {
                const active = direction === d;
                const isReturn = d === "Return";
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDirection(d)}
                    className={
                      "px-3 py-1.5 text-xs font-medium rounded-sm transition-colors " +
                      (active
                        ? isReturn
                          ? "bg-navy/10 text-navy"
                          : "bg-success/10 text-success"
                        : "text-muted-foreground hover:text-foreground")
                    }
                  >
                    {isReturn ? "↺" : "↗"} {d}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={prefillReturn}
                disabled={!legs.some((l) => l.direction === "Outbound")}
                className="ml-2 px-3 py-1.5 text-xs font-medium rounded-sm border border-dashed border-navy/30 text-navy hover:bg-navy/5 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Pre-fill return flight from the last outbound"
              >
                + Add Return Flight
              </button>
            </div>
          </div>
        </div>

        {/* ── Special Meal Roster (per leg) ──────────────────────────────── */}
        <div className="mt-6 border-t border-border pt-4">
          <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Special Meal Roster
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Optional — one row per passenger requiring a special meal on this leg.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={() => setShowBulk((v) => !v)}
              >
                <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
                {showBulk ? "Hide Paste" : "Bulk Paste"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={addRosterRow}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Passenger
              </Button>
            </div>
          </div>

          {showBulk && (
            <div className="mb-3 rounded-md border border-dashed border-border bg-muted/30 p-3">
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Paste from spreadsheet — one passenger per line
              </Label>
              <p className="text-[10px] text-muted-foreground mt-0.5 mb-1.5 font-mono">
                PNR, Passenger Name, Seat, Meal Code   (comma or tab separated)
              </p>
              <textarea
                value={bulkPaste}
                onChange={(e) => setBulkPaste(e.target.value)}
                rows={4}
                className="w-full text-xs font-mono rounded-md border border-input bg-background px-3 py-2 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder={"09QIBQ, NILAVRO SARKAR DIP, 21A, AVML\n09QI6J1, MD SHOJIB, 22A, FPML"}
              />
              <div className="mt-2 flex items-center justify-end gap-2">
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setBulkPaste(""); setShowBulk(false); }}>
                  Cancel
                </Button>
                <Button size="sm" className="h-7 text-xs" onClick={applyBulkPaste}>
                  Import {bulkPaste.split(/\r?\n/).filter((l) => l.trim()).length || 0} Rows
                </Button>
              </div>
            </div>
          )}

          <div className="border border-border rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-10 text-[10px] uppercase tracking-wider">SL</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider w-32">PNR</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider">Passenger Name</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider w-20">Seat</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider w-40">Meal Type</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {roster.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-6">
                      No special meals on this leg. Click <strong className="text-foreground">+ Add Passenger</strong> or <strong className="text-foreground">Bulk Paste</strong> to attach a manifest.
                    </TableCell>
                  </TableRow>
                ) : (
                  roster.map((r, i) => {
                    const meta = SPECIAL_MEAL_BY_CODE[r.mealCode];
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="text-xs tabular-nums text-muted-foreground">{i + 1}</TableCell>
                        <TableCell>
                          <Input
                            value={r.pnr}
                            onChange={(e) => updateRosterRow(r.id, { pnr: e.target.value.toUpperCase() })}
                            placeholder="09QIBQ"
                            className="h-8 font-mono text-xs"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={r.passengerName}
                            onChange={(e) => updateRosterRow(r.id, { passengerName: e.target.value })}
                            placeholder="PASSENGER NAME"
                            className="h-8 text-xs"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={r.seat}
                            onChange={(e) => updateRosterRow(r.id, { seat: e.target.value.toUpperCase() })}
                            placeholder="21A"
                            className="h-8 font-mono text-xs"
                          />
                        </TableCell>
                        <TableCell>
                          <select
                            value={r.mealCode}
                            onChange={(e) => updateRosterRow(r.id, { mealCode: e.target.value })}
                            className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            title={meta?.name}
                          >
                            {SPECIAL_MEAL_CODES.map((m) => (
                              <option key={m.code} value={m.code}>{m.code} — {m.name}</option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => removeRosterRow(r.id)}
                            aria-label="Remove passenger"
                          >
                            <X className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Flight Legs
            </h4>
            <span className="text-xs text-muted-foreground">
              {legs.length === 0 ? "No legs added yet" : `${legs.length} ${legs.length === 1 ? "leg" : "legs"} on this order`}
            </span>
          </div>
          <div className="border border-border rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-14 text-xs uppercase tracking-wider">Leg</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Flight</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Sector</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">ETD</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-right">PAX</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-right">Spec. Meals</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {legs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                      Fill the form above and click <strong className="text-foreground">Add Leg</strong> to attach a flight to this order.
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {legs.map((l, i) => (
                      <TableRow key={i}>
                        <TableCell className="tabular-nums text-xs">{i + 1}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-1.5">
                            {l.flight}
                            <DirectionBadge direction={l.direction} />
                          </div>
                        </TableCell>
                        <TableCell>{l.sector}</TableCell>
                        <TableCell>{l.etd}</TableCell>
                        <TableCell className="text-right tabular-nums">{l.pax}</TableCell>
                        <TableCell className="text-right tabular-nums">{l.specialMeals}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => removeLeg(i)}
                            aria-label={`Remove leg ${i + 1}`}
                          >
                            <X className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/30 font-semibold">
                      <TableCell colSpan={4} className="text-right uppercase text-xs tracking-wider">
                        Total
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {legs.reduce((s, l) => s + l.pax, 0)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {legs.reduce((s, l) => s + l.specialMeals, 0)}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CrewMealCreate({
  onSave, nextOrderNo, nextRowSeq,
}: {
  onSave: (legs: FlightOrder[]) => void;
  nextOrderNo: string;
  nextRowSeq: number;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [scope, setScope] = useState<"Domestic" | "International">("Domestic");
  const [airline, setAirline] = useState(AIRLINES[0]);
  const [date, setDate] = useState(today);

  const [mealSlot, setMealSlot] = useState<MealSlot>("Breakfast");
  const [flight, setFlight] = useState("");
  const [from, setFrom] = useState("DAC");
  const [to, setTo] = useState("CGP");
  const [etd, setEtd] = useState("");
  const [pax, setPax] = useState("");
  const [crew, setCrew] = useState("4");
  const [specialMeals, setSpecialMeals] = useState("0");
  const [direction, setDirection] = useState<FlightDirection>("Outbound");

  const [legs, setLegs] = useState<LegDraft[]>([]);

  const domesticCodes = ["DAC", "CGP", "CXB", "ZYL", "JSR"];
  const airports = scope === "Domestic"
    ? AIRPORTS.filter((a) => domesticCodes.includes(a.code))
    : AIRPORTS;

  // Slot derived from ETD wins for display once the user has typed a time;
  // before that the explicit Meal Slot picker drives the badge.
  const derivedSlot = etd ? getMealSlot(etd) : null;
  const slotForBadge = derivedSlot ?? mealSlot;
  const slotMismatch = derivedSlot && derivedSlot !== mealSlot;

  const slotStartTime = (slot: MealSlot): string => {
    const def = MEAL_SLOTS.find((s) => s.name === slot);
    if (!def) return "";
    return `${String(def.from).padStart(2, "0")}:00`;
  };

  const onPickSlot = (slot: MealSlot) => {
    setMealSlot(slot);
    // Auto-seed ETD to that slot's start time (user can fine-tune)
    setEtd(slotStartTime(slot));
  };

  const resetForm = () => {
    setFlight(""); setEtd(""); setPax(""); setSpecialMeals("0");
    setCrew(scope === "Domestic" ? "4" : "14");
    setDirection("Outbound");
    // Keep the same mealSlot so the user can add several flights to one slot
    // in a row without re-picking it each time.
  };

  const onScopeChange = (next: "Domestic" | "International") => {
    setScope(next);
    setFrom(next === "Domestic" ? "DAC" : "DAC");
    setTo(next === "Domestic" ? "CGP" : "DXB");
    setCrew(next === "Domestic" ? "4" : "14");
  };

  const addLeg = () => {
    if (!flight.trim()) { toast.error("Flight number is required."); return; }
    if (!from || !to) { toast.error("Sector (From → To) is required."); return; }
    if (from === to) { toast.error("From and To must be different airports."); return; }
    if (!etd) { toast.error("ETD is required."); return; }
    const crewNum = Number(crew);
    if (!crewNum || crewNum <= 0) { toast.error("No of Crew must be greater than zero."); return; }
    setLegs((prev) => [
      ...prev,
      {
        flight: flight.trim().toUpperCase(),
        sector: `${from} → ${to}`,
        etd,
        pax: Number(pax) || 0,
        specialMeals: Number(specialMeals) || 0,
        status: "Pending",
        direction,
        roster: [],
      },
    ]);
    // Carry the crew count forward (usually constant across legs of the same order)
    resetForm();
  };

  const removeLeg = (i: number) =>
    setLegs((prev) => prev.filter((_, idx) => idx !== i));

  const handleSave = () => {
    if (legs.length === 0) {
      toast.error("Add at least one flight leg.");
      return;
    }
    // crew count needs to be captured per leg — read from each LegDraft entry.
    // Since LegDraft already covers status/etd/etc, append crew via a parallel
    // map by using the current `crew` input as a fallback when needed.
    const rows: FlightOrder[] = legs.map((l, i) => ({
      id: `FO-${String(nextRowSeq + i).padStart(3, "0")}`,
      orderNo: nextOrderNo,
      flight: l.flight,
      airline,
      sector: l.sector,
      date,
      etd: l.etd,
      pax: l.pax,
      crew: Number(crew) || (scope === "Domestic" ? 4 : 14),
      specialMeals: l.specialMeals,
      status: l.status,
      direction: l.direction,
    }));
    onSave(rows);
    toast.success(`${nextOrderNo} created with ${legs.length} ${legs.length === 1 ? "leg" : "legs"}.`);
  };

  // Build groups for the in-form preview table (Breakfast / Lunch / etc)
  const groups = new Map<MealSlot, LegDraft[]>();
  MEAL_SLOTS.forEach((s) => groups.set(s.name, []));
  legs.forEach((l) => {
    groups.get(getMealSlot(l.etd))!.push(l);
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground">
              Create Crew Meal Order
              <span className="ml-2 font-mono text-xs text-primary normal-case tracking-normal">
                {nextOrderNo}
              </span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add flights under this Order #. The meal slot (Breakfast / Heavy Snacks / Lunch / Dinner) is derived from each flight's ETD.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={addLeg}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Leg
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-1.5" /> Save
            </Button>
          </div>
        </div>

        {/* Order-level fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 mb-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Scope</Label>
            <div className="mt-1 inline-flex rounded-md border border-input bg-background p-0.5 shadow-sm">
              {(["Domestic", "International"] as const).map((s) => {
                const active = scope === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onScopeChange(s)}
                    className={
                      "px-3 py-1.5 text-xs font-medium rounded-sm transition-colors " +
                      (active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")
                    }
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Airline</Label>
            <select value={airline} onChange={(e) => setAirline(e.target.value)} className={selectCls}>
              {AIRLINES.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" />
          </div>
        </div>

        <div className="border-t border-border pt-4 mb-3">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              New Leg
              <Badge
                variant="outline"
                className="ml-2 h-5 px-1.5 text-[10px] border-primary/30 bg-primary/5 text-primary"
              >
                {slotForBadge}
              </Badge>
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Pick a meal slot — ETD will auto-seed to that slot's start time. You can still fine-tune the time below.
            </p>
          </div>

          <div className="inline-flex flex-wrap rounded-md border border-input bg-background p-0.5 shadow-sm">
            {MEAL_SLOTS.map((s) => {
              const active = mealSlot === s.name;
              return (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => onPickSlot(s.name)}
                  className={
                    "px-3 py-1.5 text-xs font-medium rounded-sm transition-colors " +
                    (active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground")
                  }
                  title={`${s.name} (${s.range})`}
                >
                  {s.name}
                  <span className="ml-1.5 text-[10px] opacity-70 tabular-nums">
                    {s.range}
                  </span>
                </button>
              );
            })}
          </div>

          {slotMismatch && (
            <div className="mt-2 text-[11px] text-warning flex items-center gap-1.5">
              <AlertCircle className="h-3 w-3" />
              ETD {etd} falls in <strong>{derivedSlot}</strong>, not the selected <strong>{mealSlot}</strong> slot. The entry will be grouped under {derivedSlot}.
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Flight Number <span className="text-destructive">*</span>
            </Label>
            <Input value={flight} onChange={(e) => setFlight(e.target.value)} placeholder="e.g. BS-141" className="mt-1" />
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              ETD <span className="text-destructive">*</span>
            </Label>
            <Input type="time" value={etd} onChange={(e) => setEtd(e.target.value)} className="mt-1" />
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              From <span className="text-destructive">*</span>
            </Label>
            <select value={from} onChange={(e) => setFrom(e.target.value)} className={selectCls}>
              {airports.map((a) => (
                <option key={a.code} value={a.code}>{a.code} — {a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              To <span className="text-destructive">*</span>
            </Label>
            <select value={to} onChange={(e) => setTo(e.target.value)} className={selectCls}>
              {airports.map((a) => (
                <option key={a.code} value={a.code}>{a.code} — {a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              No of Crew <span className="text-destructive">*</span>
            </Label>
            <Input type="number" min={0} value={crew} onChange={(e) => setCrew(e.target.value)} className="mt-1" />
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">PAX</Label>
            <Input type="number" min={0} value={pax} onChange={(e) => setPax(e.target.value)} placeholder="0" className="mt-1" />
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Special Meals</Label>
            <Input type="number" min={0} value={specialMeals} onChange={(e) => setSpecialMeals(e.target.value)} placeholder="0" className="mt-1" />
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Direction</Label>
            <div className="mt-1 inline-flex rounded-md border border-input bg-background p-0.5 shadow-sm">
              {(["Outbound", "Return"] as FlightDirection[]).map((d) => {
                const active = direction === d;
                const isReturn = d === "Return";
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDirection(d)}
                    className={
                      "px-3 py-1.5 text-xs font-medium rounded-sm transition-colors " +
                      (active
                        ? isReturn
                          ? "bg-navy/10 text-navy"
                          : "bg-success/10 text-success"
                        : "text-muted-foreground hover:text-foreground")
                    }
                  >
                    {isReturn ? "↺" : "↗"} {d}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legs grouped by meal slot */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Flight Legs by Meal Slot
            </h4>
            <span className="text-xs text-muted-foreground">
              {legs.length === 0 ? "No legs added yet" : `${legs.length} ${legs.length === 1 ? "leg" : "legs"} on this order`}
            </span>
          </div>

          <div className="border border-border rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-12 text-xs uppercase tracking-wider">SL</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider w-28">Order #</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Flight</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Sector</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider w-20">ETD</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-right w-20">PAX</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-right w-24">Crew</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {legs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">
                      Add flights above and they'll appear here grouped by meal slot.
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {MEAL_SLOTS.map((slot) => {
                      const rows = groups.get(slot.name)!;
                      if (rows.length === 0) return null;
                      const slotCrew = rows.reduce((s, l) => s + (Number(crew) || 0), 0);
                      return (
                        <Fragment key={slot.name}>
                          <TableRow className="bg-primary/5 border-t-2 border-t-primary/40 hover:bg-primary/10">
                            <TableCell colSpan={8} className="py-2">
                              <span className="font-semibold text-primary uppercase tracking-wider text-xs">
                                {slot.name}
                              </span>
                              <span className="ml-2 text-[10px] text-muted-foreground tabular-nums">
                                {slot.range}
                              </span>
                            </TableCell>
                          </TableRow>
                          {rows.map((l) => {
                            const originalIndex = legs.indexOf(l);
                            return (
                              <TableRow key={originalIndex}>
                                <TableCell className="tabular-nums text-xs">{originalIndex + 1}</TableCell>
                                <TableCell className="font-mono text-xs text-primary">{nextOrderNo}</TableCell>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-1.5">
                                    {l.flight}
                                    <DirectionBadge direction={l.direction} />
                                  </div>
                                </TableCell>
                                <TableCell>{l.sector}</TableCell>
                                <TableCell className="tabular-nums">{l.etd}</TableCell>
                                <TableCell className="text-right tabular-nums">{l.pax}</TableCell>
                                <TableCell className="text-right tabular-nums font-semibold">{Number(crew) || 0}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    onClick={() => removeLeg(originalIndex)}
                                    aria-label={`Remove leg ${originalIndex + 1}`}
                                  >
                                    <X className="h-3.5 w-3.5 text-destructive" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          <TableRow className="bg-muted/30 font-semibold">
                            <TableCell colSpan={6} className="text-right uppercase text-[10px] tracking-wider">
                              {slot.name} Total
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-primary">{slotCrew}</TableCell>
                            <TableCell />
                          </TableRow>
                        </Fragment>
                      );
                    })}
                  </>
                )}
              </TableBody>
            </Table>
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
    const orders: FlightOrder[] = valid.map((r, i) => ({
      id: `FO-IMP-${String(Date.now()).slice(-4)}-${i + 1}`,
      orderNo: r.id,
      flight: r.flight,
      airline: r.airline,
      sector: r.sector,
      date: today,
      etd: r.etd,
      pax: r.pax,
      crew: 16,
      specialMeals: r.specialMeals,
      status: "Pending",
      direction: "Outbound",
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

const SPECIAL_MEAL_CATEGORY_COLOR: Record<SpecialMealCategory, string> = {
  Religious:  "border-navy/30 bg-navy/5 text-navy",
  Medical:    "border-destructive/30 bg-destructive/5 text-destructive",
  Vegetarian: "border-success/30 bg-success/5 text-success",
  Other:      "border-border bg-muted text-muted-foreground",
};

function SpecialMealRosterPanel({ legs }: { legs: FlightOrder[] }) {
  const allEntries = legs.flatMap((l) =>
    (l.specialMealRoster ?? []).map((e) => ({ ...e, flight: l.flight, sector: l.sector })),
  );

  if (allEntries.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
        No passenger-level special meal roster attached yet. Once the manifest is imported, individual PNR/Seat/Meal entries will appear here.
      </div>
    );
  }

  // Count per meal code across all legs
  const counts = new Map<string, number>();
  allEntries.forEach((e) => counts.set(e.mealCode, (counts.get(e.mealCode) ?? 0) + 1));
  const summary = Array.from(counts.entries())
    .map(([code, count]) => ({ code, count, meta: SPECIAL_MEAL_BY_CODE[code] }))
    .filter((s) => s.meta)
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {summary.map((s) => (
          <Badge
            key={s.code}
            variant="outline"
            className={cn(
              "h-6 px-2 text-[11px] font-medium tabular-nums",
              SPECIAL_MEAL_CATEGORY_COLOR[s.meta.category],
            )}
            title={s.meta.name}
          >
            <span className="font-mono mr-1">{s.code}</span>
            <span className="opacity-70">·</span>
            <span className="ml-1">{s.count}</span>
          </Badge>
        ))}
      </div>
      <div className="border border-border rounded-md overflow-hidden max-h-[260px] overflow-y-auto">
        <Table>
          <TableHeader className="bg-muted/40 sticky top-0">
            <TableRow>
              <TableHead className="w-10 text-[10px] uppercase tracking-wider">SL</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider w-24">PNR</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider">Passenger</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider w-14">Seat</TableHead>
              {legs.length > 1 && (
                <TableHead className="text-[10px] uppercase tracking-wider">Flight</TableHead>
              )}
              <TableHead className="text-[10px] uppercase tracking-wider w-24">Meal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allEntries.map((e, i) => {
              const meta = SPECIAL_MEAL_BY_CODE[e.mealCode];
              return (
                <TableRow key={e.id} className="hover:bg-muted/30">
                  <TableCell className="text-xs tabular-nums text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-mono text-xs">{e.pnr}</TableCell>
                  <TableCell className="text-xs">{e.passengerName}</TableCell>
                  <TableCell className="font-mono text-xs tabular-nums">{e.seat}</TableCell>
                  {legs.length > 1 && (
                    <TableCell className="font-mono text-xs">{e.flight}</TableCell>
                  )}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "h-5 px-1.5 text-[10px] font-mono",
                        meta ? SPECIAL_MEAL_CATEGORY_COLOR[meta.category] : "",
                      )}
                      title={meta?.name ?? e.mealCode}
                    >
                      {e.mealCode}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function FlightOrderDetailsDialog({
  order, legs, onClose, onAdvanceLeg, onAdvanceOrder,
}: {
  order: FlightOrder | null;
  legs: FlightOrder[];
  onClose: () => void;
  onAdvanceLeg: (rowId: string) => void;
  onAdvanceOrder: (orderNo: string) => void;
}) {
  const isMulti = legs.length > 1;
  const hasRoster = legs.some((l) => (l.specialMealRoster ?? []).length > 0);
  const totalPax = legs.reduce((s, l) => s + l.pax, 0);
  const totalSpec = legs.reduce((s, l) => s + l.specialMeals, 0);

  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={isMulti || hasRoster ? "max-w-3xl" : "max-w-lg"}>
        <DialogHeader>
          <DialogTitle>
            Order Details
            {order && (
              <span className="font-mono text-sm text-muted-foreground ml-1">
                — {order.orderNo}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        {order && (
          <div className="mt-2 space-y-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <DetailRow label="Order #" value={order.orderNo} mono />
              <DetailRow label="Airline" value={order.airline} />
              <DetailRow label="Date" value={order.date} />
              <DetailRow label="Legs" value={legs.length.toString()} />
              <DetailRow label="Total Passengers" value={totalPax.toLocaleString()} />
              <DetailRow label="Total Special Meals" value={totalSpec.toString()} />
            </div>

            <WorkflowStrip
              statuses={FLIGHT_ORDER_STATUS_FLOW}
              counts={
                FLIGHT_ORDER_STATUS_FLOW.reduce<Record<FlightOrderStatus, number>>(
                  (acc, s) => {
                    acc[s] = legs.filter((l) => l.status === s).length;
                    return acc;
                  },
                  { Pending: 0, Approved: 0, Production: 0, Dispatched: 0, Completed: 0 },
                )
              }
            />

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  Flights
                  <Badge variant="outline" className="h-5 px-1.5 text-[10px] tabular-nums">
                    {legs.length} {legs.length === 1 ? "leg" : "legs"}
                  </Badge>
                </div>
                {legs.some((l) => nextFlightStatus(l.status) !== null) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => onAdvanceOrder(order.orderNo)}
                  >
                    Advance All Legs →
                  </Button>
                )}
              </div>
              <div className="border border-border rounded-md overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="w-12 text-[10px] uppercase tracking-wider">Leg</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider">Flight</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider">Sector</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider">ETD</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider text-right">PAX</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider text-right">Spec. Meals</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider">Status</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider w-28">Workflow</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {legs.map((leg, i) => {
                      const next = nextFlightStatus(leg.status);
                      return (
                        <TableRow key={leg.id}>
                          <TableCell className="tabular-nums text-xs">{i + 1}</TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-1.5">
                              {leg.flight}
                              <DirectionBadge direction={leg.direction} />
                            </div>
                          </TableCell>
                          <TableCell>{leg.sector}</TableCell>
                          <TableCell>{leg.etd}</TableCell>
                          <TableCell className="text-right tabular-nums">{leg.pax}</TableCell>
                          <TableCell className="text-right tabular-nums">{leg.specialMeals}</TableCell>
                          <TableCell><StatusBadge status={leg.status} /></TableCell>
                          <TableCell>
                            {next ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-[11px] text-primary hover:text-primary"
                                onClick={() => onAdvanceLeg(leg.id)}
                                title={`Move to ${next}`}
                              >
                                → {next}
                              </Button>
                            ) : (
                              <span className="text-[10px] text-success">Done</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  Special Meal Roster
                  <Badge variant="outline" className="h-5 px-1.5 text-[10px] tabular-nums">
                    {legs.reduce((s, l) => s + (l.specialMealRoster?.length ?? 0), 0)} pax
                  </Badge>
                </div>
                {!isDomesticSector(order.sector) && (
                  <span className="text-[10px] uppercase tracking-wider text-navy">International</span>
                )}
              </div>
              <SpecialMealRosterPanel legs={legs} />
            </div>

            <div className="rounded-md bg-muted/40 px-3 py-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total Meals (PAX + Special)</span>
              <span className="text-sm font-semibold text-foreground tabular-nums">
                {(totalPax + totalSpec).toLocaleString()}
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

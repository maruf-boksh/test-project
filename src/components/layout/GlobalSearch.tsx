import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, X, Plane, UtensilsCrossed, ShoppingCart, Truck, Package, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { flagArrival } from "@/lib/arrival-flash";
import {
  seedFlightOrders, meals, purchaseOrders, vendors, inventory,
} from "@/lib/sample-data";
import { useWorkflow } from "@/lib/workflow-store";

type Group = "Flights" | "Meals" | "Purchase Orders" | "Vendors" | "Items" | "Requisitions";

type Result = {
  id: string;
  group: Group;
  label: string;
  description: string;
  to: string;
  target?: string;
  rowId?: string;
};

const GROUP_ORDER: Group[] = [
  "Flights", "Meals", "Purchase Orders", "Vendors", "Items", "Requisitions",
];

const GROUP_ICON: Record<Group, React.ComponentType<{ className?: string }>> = {
  "Flights":         Plane,
  "Meals":           UtensilsCrossed,
  "Purchase Orders": ShoppingCart,
  "Vendors":         Truck,
  "Items":           Package,
  "Requisitions":    FileText,
};

const MAX_PER_GROUP = 4;

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const wf = useWorkflow();

  // Close on outside click / Esc
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const out: Result[] = [];

    // Flights — match flight code, sector, orderNo
    const flightHits = seedFlightOrders.filter((o) =>
      o.flight.toLowerCase().includes(q) ||
      o.sector.toLowerCase().includes(q) ||
      o.orderNo.toLowerCase().includes(q),
    ).slice(0, MAX_PER_GROUP);
    flightHits.forEach((o) => {
      out.push({
        id: o.id,
        group: "Flights",
        label: `${o.flight} — ${o.sector}`,
        description: `${o.orderNo} · ETD ${o.etd} · ${o.pax} pax · ${o.status}`,
        to: "/order-management",
        target: "active-orders",
        rowId: o.id,
      });
    });

    // Meals
    const mealHits = meals.filter((m) =>
      m.name.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      m.menuStandard.toLowerCase().includes(q),
    ).slice(0, MAX_PER_GROUP);
    mealHits.forEach((m) => {
      out.push({
        id: m.id,
        group: "Meals",
        label: m.name,
        description: `${m.id} · ${m.type} · ${m.menuStandard} · ${m.calories} kcal`,
        to: "/meal-planning",
      });
    });

    // Purchase Orders — seed + workflow
    const allPOs = [
      ...wf.wfPurchaseOrders.map((p) => ({ id: p.id, vendor: p.vendor, status: p.status, amount: p.amount })),
      ...purchaseOrders,
    ];
    const seenPO = new Set<string>();
    const poHits = allPOs.filter((p) => {
      if (seenPO.has(p.id)) return false;
      seenPO.add(p.id);
      return p.id.toLowerCase().includes(q) || p.vendor.toLowerCase().includes(q);
    }).slice(0, MAX_PER_GROUP);
    poHits.forEach((p) => {
      out.push({
        id: p.id,
        group: "Purchase Orders",
        label: p.id,
        description: `${p.vendor} · ৳${(p.amount ?? 0).toLocaleString()} · ${p.status}`,
        to: "/procurement",
        target: "po-list",
        rowId: p.id,
      });
    });

    // Vendors
    const vendorHits = vendors.filter((v) =>
      v.name.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q),
    ).slice(0, MAX_PER_GROUP);
    vendorHits.forEach((v) => {
      out.push({
        id: v.id,
        group: "Vendors",
        label: v.name,
        description: `${v.category} · ${v.orders} orders · ${v.onTime} on-time`,
        to: "/config-supplier",
      });
    });

    // Inventory items
    const itemHits = inventory.filter((i) =>
      i.name.toLowerCase().includes(q) ||
      i.id.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q),
    ).slice(0, MAX_PER_GROUP);
    itemHits.forEach((i) => {
      out.push({
        id: i.id,
        group: "Items",
        label: i.name,
        description: `${i.id} · ${i.category} · ${i.stock} ${i.uom} · ${i.status}`,
        to: "/inventory",
        target: "inv-alerts",
        rowId: i.id,
      });
    });

    // Requisitions (workflow store)
    const reqHits = wf.wfRequisitions.filter((r) =>
      r.id.toLowerCase().includes(q) ||
      r.requestedBy.toLowerCase().includes(q) ||
      r.source.toLowerCase().includes(q),
    ).slice(0, MAX_PER_GROUP);
    reqHits.forEach((r) => {
      out.push({
        id: r.id,
        group: "Requisitions",
        label: r.id,
        description: `${r.requestedBy} · ${r.source} · ${r.status}`,
        to: "/purchase-requisition",
        target: "pr-list",
        rowId: r.id,
      });
    });

    return out;
  }, [query, wf.wfPurchaseOrders, wf.wfRequisitions]);

  // Group results in display order
  const grouped = useMemo(() => {
    const byGroup: Record<Group, Result[]> = {
      "Flights": [], "Meals": [], "Purchase Orders": [],
      "Vendors": [], "Items": [], "Requisitions": [],
    };
    results.forEach((r) => byGroup[r.group].push(r));
    return GROUP_ORDER
      .map((g) => ({ group: g, items: byGroup[g] }))
      .filter((x) => x.items.length > 0);
  }, [results]);

  // Flat list for keyboard nav
  const flatResults = useMemo(
    () => grouped.flatMap((g) => g.items),
    [grouped],
  );

  // Reset active index when results change
  useEffect(() => { setActiveIdx(0); }, [query]);

  const goTo = (r: Result) => {
    if (r.target) {
      flagArrival(r.rowId ? { target: r.target, ids: [r.rowId] } : r.target);
    }
    navigate({ to: r.to });
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, Math.max(flatResults.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = flatResults[activeIdx];
      if (r) goTo(r);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showPanel = open && query.trim().length >= 2;

  return (
    <div ref={wrapperRef} className="flex-1 max-w-xl relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
      <Input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search flights, meals, POs, vendors..."
        className="pl-9 pr-9 bg-white/15 border-white/20 text-white placeholder:text-white/60 focus-visible:bg-white/25 focus-visible:ring-white/40"
      />
      {query && (
        <button
          type="button"
          onClick={() => { setQuery(""); setOpen(false); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {showPanel && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-card text-foreground border border-border rounded-md shadow-lg max-h-[70vh] overflow-y-auto z-50">
          {flatResults.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-muted-foreground">
              No matches for <span className="font-semibold text-foreground">"{query}"</span>.
              <div className="mt-1 text-[10px]">Try a flight code, vendor, item, PO id, or meal name.</div>
            </div>
          ) : (
            <div className="py-1">
              {grouped.map(({ group, items }) => {
                const GroupIcon = GROUP_ICON[group];
                return (
                  <div key={group}>
                    <div className="px-3 pt-2 pb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold border-t border-border/40 first:border-t-0">
                      <GroupIcon className="h-3 w-3" />
                      {group} <span className="text-muted-foreground/70 font-normal">({items.length})</span>
                    </div>
                    {items.map((r) => {
                      const idx = flatResults.indexOf(r);
                      const active = idx === activeIdx;
                      return (
                        <button
                          key={`${r.group}-${r.id}`}
                          type="button"
                          onClick={() => goTo(r)}
                          onMouseEnter={() => setActiveIdx(idx)}
                          className={cn(
                            "w-full text-left px-3 py-1.5 transition-colors flex flex-col gap-0.5",
                            active ? "bg-primary/10" : "hover:bg-muted/60",
                          )}
                        >
                          <div className="text-sm font-medium truncate">{r.label}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{r.description}</div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
              <div className="px-3 py-2 border-t border-border/40 text-[10px] text-muted-foreground bg-muted/30 flex items-center justify-between">
                <span>
                  <kbd className="px-1 py-0.5 rounded border border-border bg-card font-mono">↑↓</kbd> navigate{" "}
                  <kbd className="px-1 py-0.5 rounded border border-border bg-card font-mono ml-1">↵</kbd> open{" "}
                  <kbd className="px-1 py-0.5 rounded border border-border bg-card font-mono ml-1">Esc</kbd> close
                </span>
                <span className="tabular-nums">{flatResults.length} result{flatResults.length === 1 ? "" : "s"}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

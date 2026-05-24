import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell, ShoppingCart, ShieldCheck, Plane, Package,
  Clock, X, CheckCheck, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { flagArrival } from "@/lib/arrival-flash";
import { useWorkflow } from "@/lib/workflow-store";
import {
  inventory, qcChecks, flights, purchaseOrders,
} from "@/lib/sample-data";

type Severity = "critical" | "warning" | "info";
type Group = "QC" | "Inventory" | "Purchase" | "Operations";

type Notif = {
  id: string;
  group: Group;
  severity: Severity;
  title: string;
  detail: string;
  to: string;
  target?: string;
  rowId?: string;
};

const GROUP_ICON: Record<Group, React.ComponentType<{ className?: string }>> = {
  QC:         ShieldCheck,
  Inventory:  Package,
  Purchase:   ShoppingCart,
  Operations: Plane,
};

const SEVERITY_DOT: Record<Severity, string> = {
  critical: "bg-destructive",
  warning:  "bg-amber-500",
  info:     "bg-sky-500",
};

const SEVERITY_BORDER: Record<Severity, string> = {
  critical: "border-l-destructive",
  warning:  "border-l-amber-500",
  info:     "border-l-sky-500",
};

const GROUP_ORDER: Group[] = ["QC", "Operations", "Inventory", "Purchase"];

export function NotificationsButton() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const wf = useWorkflow();

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

  const notifications = useMemo<Notif[]>(() => {
    const out: Notif[] = [];

    qcChecks.filter((q) => q.result === "Fail").forEach((q) => {
      out.push({
        id: `qc-${q.id}`,
        group: "QC",
        severity: "critical",
        title: `QC failed on ${q.flight}`,
        detail: `${q.parameter}: ${q.value} (limit ${q.limit})`,
        to: "/hygiene-monitoring",
      });
    });

    flights.filter((f) => f.status === "Delayed").forEach((f) => {
      out.push({
        id: `flt-${f.id}`,
        group: "Operations",
        severity: "warning",
        title: `${f.flight} delayed`,
        detail: `${f.sector} · STD ${f.dep}`,
        to: "/order-management",
      });
    });

    inventory.filter((i) => i.status === "Critical").forEach((i) => {
      out.push({
        id: `inv-c-${i.id}`,
        group: "Inventory",
        severity: "critical",
        title: `${i.name} critically low`,
        detail: `${i.stock} ${i.uom} on hand · reorder at ${i.reorder}`,
        to: "/inventory",
        target: "inv-alerts",
        rowId: i.id,
      });
    });
    inventory.filter((i) => i.status === "Low").forEach((i) => {
      out.push({
        id: `inv-l-${i.id}`,
        group: "Inventory",
        severity: "warning",
        title: `${i.name} below reorder`,
        detail: `${i.stock} ${i.uom} on hand · reorder at ${i.reorder}`,
        to: "/inventory",
        target: "inv-alerts",
        rowId: i.id,
      });
    });

    purchaseOrders.filter((p) => p.status === "Pending Approval").forEach((p) => {
      out.push({
        id: `po-s-${p.id}`,
        group: "Purchase",
        severity: "warning",
        title: `${p.id} awaiting approval`,
        detail: `${p.vendor} · ৳${(p.amount ?? 0).toLocaleString()}`,
        to: "/procurement",
        target: "po-list",
        rowId: p.id,
      });
    });
    wf.wfPurchaseOrders.filter((p) => p.status === "Pending Approval").forEach((p) => {
      out.push({
        id: `po-w-${p.id}`,
        group: "Purchase",
        severity: "warning",
        title: `${p.id} awaiting approval`,
        detail: `${p.vendor} · ৳${(p.amount ?? 0).toLocaleString()}`,
        to: "/procurement",
        target: "po-list",
        rowId: p.id,
      });
    });

    wf.wfRequisitions.filter((r) => r.status === "Pending Accounts").forEach((r) => {
      out.push({
        id: `pr-${r.id}`,
        group: "Purchase",
        severity: "info",
        title: `${r.id} needs accounts approval`,
        detail: `${r.requestedBy} · ${r.source}`,
        to: "/purchase-requisition",
        target: "pr-list",
        rowId: r.id,
      });
    });

    return out.filter((n) => !dismissed.has(n.id));
  }, [wf.wfPurchaseOrders, wf.wfRequisitions, dismissed]);

  const count = notifications.length;
  const criticalCount = notifications.filter((n) => n.severity === "critical").length;

  const grouped = useMemo(() => {
    const byGroup: Record<Group, Notif[]> = {
      QC: [], Operations: [], Inventory: [], Purchase: [],
    };
    notifications.forEach((n) => byGroup[n.group].push(n));
    return GROUP_ORDER
      .map((g) => ({ group: g, items: byGroup[g] }))
      .filter((x) => x.items.length > 0);
  }, [notifications]);

  const handleClick = (n: Notif) => {
    if (n.target) {
      flagArrival(n.rowId ? { target: n.target, ids: [n.rowId] } : n.target);
    }
    navigate({ to: n.to });
    setOpen(false);
  };

  const dismiss = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const dismissAll = () => {
    setDismissed(new Set(notifications.map((n) => n.id)));
  };

  const badgeColor = criticalCount > 0 ? "bg-destructive" : "bg-amber-500";

  return (
    <div ref={wrapperRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-white/15 hover:text-white relative"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications (${count})`}
        title={`Notifications (${count})`}
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span
            className={cn(
              "absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-[#0824D9] tabular-nums",
              badgeColor,
            )}
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[380px] max-h-[70vh] bg-card text-foreground border border-border rounded-md shadow-xl overflow-hidden z-50 flex flex-col">
          <div className="px-3 py-2 border-b border-border bg-muted/40 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Notifications</span>
              {count > 0 && (
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full text-white font-bold tabular-nums",
                  badgeColor,
                )}>
                  {count}
                </span>
              )}
            </div>
            {count > 0 && (
              <button
                type="button"
                onClick={dismissAll}
                className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                title="Dismiss all"
              >
                <CheckCheck className="h-3 w-3" /> Clear all
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {grouped.length === 0 ? (
              <div className="px-4 py-10 text-center text-xs text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <div className="font-medium text-foreground">You're all caught up.</div>
                <div className="text-[10px] mt-1 opacity-70">No active alerts.</div>
              </div>
            ) : (
              grouped.map(({ group, items }) => {
                const GroupIcon = GROUP_ICON[group];
                return (
                  <div key={group}>
                    <div className="px-3 pt-2 pb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold border-t border-border/40 first:border-t-0 bg-muted/20">
                      <GroupIcon className="h-3 w-3" />
                      {group}
                      <span className="text-muted-foreground/70 font-normal">({items.length})</span>
                    </div>
                    {items.map((n) => (
                      <div
                        key={n.id}
                        className={cn(
                          "group/notif px-3 py-2 hover:bg-muted/60 cursor-pointer flex items-start gap-2 border-b border-border/40 border-l-2 transition-colors",
                          SEVERITY_BORDER[n.severity],
                        )}
                        onClick={() => handleClick(n)}
                      >
                        <span className={cn("mt-1.5 h-2 w-2 rounded-full shrink-0", SEVERITY_DOT[n.severity])} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{n.title}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{n.detail}</div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => dismiss(e, n.id)}
                          className="opacity-0 group-hover/notif:opacity-100 transition-opacity text-muted-foreground hover:text-foreground shrink-0 p-0.5 rounded hover:bg-muted"
                          aria-label="Dismiss"
                          title="Dismiss"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </div>

          <div className="px-3 py-1.5 border-t border-border bg-muted/30 text-[10px] text-muted-foreground flex items-center justify-between shrink-0">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> Live system events
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" /> {count} active
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

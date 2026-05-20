import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Upload, UtensilsCrossed, ChefHat, Croissant, PackageCheck,
  Package, Boxes, ShoppingCart, ShieldCheck, Wrench, BarChart3, Users, ScrollText,
  ChevronDown, Factory, Truck, Pill, ThermometerSun, ClipboardCheck,
  Layers, FileText, SlidersHorizontal, Wallet, Receipt, BadgeCheck, PieChart, Send,
  Settings, Tag, Building2, Warehouse, BadgeDollarSign, GitBranch, Plane,
  ArrowLeftRight, MoveRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole, ROLE_PERMS } from "@/lib/roles";
import { useState, type ComponentType } from "react";

type Item = { to: string; label: string; icon: ComponentType<{ className?: string }>; key: string };
type Group = { key: string; label: string; icon: ComponentType<{ className?: string }>; items: Item[] };
type Entry = Item | Group;

const NAV: Entry[] = [
  { key: "dashboard", to: "/", label: "Dashboard", icon: LayoutDashboard },
  { key: "order-management", to: "/order-management", label: "Order Management", icon: Upload },
  { key: "meal-planning", to: "/meal-planning", label: "Meal Planning", icon: UtensilsCrossed },
  {
    key: "production",
    label: "Production",
    icon: Factory,
    items: [
      { key: "inventory-bom", to: "/bom", label: "Bill of Materials", icon: Layers },
      { key: "production-entry", to: "/production-entry", label: "Production Entry", icon: ClipboardCheck },
      { key: "production-reports", to: "/production-reports", label: "Production Reports", icon: BarChart3 },
    ],
  },
  {
    key: "inventory",
    label: "Inventory & Store",
    icon: Boxes,
    items: [
      { key: "inventory-demand", to: "/demand-orders", label: "Demand Requests", icon: FileText },
      { key: "inventory-issue", to: "/item-issue", label: "Item Issue", icon: Send },
      { key: "inventory-transfer-request", to: "/transfer-request", label: "Transfer Request", icon: ArrowLeftRight },
      { key: "inventory-transfer", to: "/transfer", label: "Transfer", icon: MoveRight },
      { key: "inventory-stock", to: "/inventory", label: "Stock Overview", icon: Package },
      { key: "inventory-adjustment", to: "/stock-adjustment", label: "Stock Adjustment", icon: SlidersHorizontal },
    ],
  },
  {
    key: "supply",
    label: "Supply Chain",
    icon: ShoppingCart,
    items: [
      { key: "supply-pr", to: "/purchase-requisition", label: "Purchase Requisition", icon: FileText },
      { key: "supply-po", to: "/procurement", label: "Purchase Orders", icon: ShoppingCart },
      { key: "supply-receive", to: "/receive-item", label: "Receive Items", icon: Truck },
    ],
  },
  {
    key: "accounts",
    label: "Accounts",
    icon: Wallet,
    items: [
      { key: "accounts-invoices", to: "/accounts-invoices", label: "Invoices & Payments", icon: Receipt },
      { key: "accounts-approvals", to: "/accounts-approvals", label: "Payment Approvals", icon: BadgeCheck },
      { key: "accounts-expenses", to: "/accounts-expenses", label: "Expense Overview", icon: PieChart },
    ],
  },
  {
    key: "qc",
    label: "Food Safety & QC",
    icon: ShieldCheck,
    items: [
      { key: "qc-hygiene", to: "/hygiene-monitoring", label: "Daily Hygiene Monitoring", icon: ClipboardCheck },
      { key: "qc-temp", to: "/cooking-temp", label: "Cooking Temp & Sensory", icon: ThermometerSun },
      { key: "qc-dispatch-monitoring", to: "/dispatch-monitoring", label: "Dispatch Monitoring", icon: Truck },
    ],
  },
  { key: "dispatch", to: "/dispatch", label: "Packaging & Dispatch", icon: PackageCheck },
  { key: "maintenance", to: "/maintenance", label: "Maintenance & Assets", icon: Wrench },
  { key: "reports", to: "/reports", label: "Reports", icon: BarChart3 },
  { key: "users", to: "/users", label: "User Management", icon: Users },
  { key: "audit", to: "/audit", label: "Audit Logs", icon: ScrollText },
  { key: "approval-management", to: "/approval-management", label: "Approval Management", icon: BadgeCheck },
  {
    key: "config",
    label: "Configuration",
    icon: Settings,
    items: [
      { key: "config-item",      to: "/config-item",      label: "Item Profile",         icon: Tag },
      { key: "config-supplier",  to: "/config-supplier",  label: "Supplier Profile",     icon: Truck },
      { key: "config-company",   to: "/config-company",   label: "Company Profile",      icon: Building2 },
      { key: "config-airline",   to: "/config-airline",   label: "Airline",              icon: Plane },
      { key: "config-office",    to: "/config-office",    label: "Office",               icon: Building2 },
      { key: "config-warehouse", to: "/config-warehouse", label: "Warehouse",            icon: Warehouse },
      { key: "config-price",     to: "/config-price",     label: "Price Setup",          icon: BadgeDollarSign },
      { key: "config-approval",  to: "/config-approval",  label: "Approval Setup",       icon: GitBranch },
    ],
  },
];

function isGroup(e: Entry): e is Group {
  return (e as Group).items !== undefined;
}

export function Sidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { role } = useRole();
  const perms = ROLE_PERMS[role];
  const allowed = (key: string) => perms === "*" || perms.includes(key) || perms.some(p => key.startsWith(p));

  const filtered: Entry[] = NAV
    .map((e) => {
      if (isGroup(e)) {
        const items = e.items.filter((i) => allowed(i.key) || allowed(e.key));
        return items.length ? { ...e, items } : null;
      }
      return allowed(e.key) ? e : null;
    })
    .filter(Boolean) as Entry[];

  // groups open if active route is inside, otherwise default open
  const initial: Record<string, boolean> = {};
  filtered.forEach((e) => {
    if (isGroup(e)) initial[e.key] = e.items.some((i) => path === i.to) || true;
  });
  const [open, setOpen] = useState<Record<string, boolean>>(initial);

  return (
    <aside className="fixed left-0 top-14 bottom-0 w-60 bg-sidebar text-sidebar-foreground overflow-y-auto border-r border-sidebar-border z-30">
      <div className="px-3 py-3">
        <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-sidebar-foreground/60 font-semibold">
          Operations Console
        </div>
        <nav className="space-y-0.5">
          {filtered.map((entry) => {
            if (!isGroup(entry)) {
              const active = path === entry.to;
              const Icon = entry.icon;
              return (
                <Link
                  key={entry.to}
                  to={entry.to}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "hover:bg-sidebar-accent/50 text-sidebar-foreground/85",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{entry.label}</span>
                </Link>
              );
            }
            const isOpen = open[entry.key] ?? true;
            const Icon = entry.icon;
            const hasActive = entry.items.some((i) => path === i.to);
            return (
              <div key={entry.key}>
                <button
                  type="button"
                  onClick={() => setOpen((s) => ({ ...s, [entry.key]: !isOpen }))}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    hasActive
                      ? "text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/85 hover:bg-sidebar-accent/50",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate flex-1 text-left">{entry.label}</span>
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")} />
                </button>
                {isOpen && (
                  <div className="ml-3 mt-0.5 mb-1 pl-3 border-l border-sidebar-border/50 space-y-0.5">
                    {entry.items.map((item) => {
                      const active = path === item.to;
                      const SubIcon = item.icon;
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          className={cn(
                            "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] transition-colors",
                            active
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                              : "hover:bg-sidebar-accent/50 text-sidebar-foreground/75",
                          )}
                        >
                          <SubIcon className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="mt-6 mx-3 p-3 rounded-md bg-sidebar-accent/40 text-xs">
          <div className="font-semibold text-sidebar-accent-foreground">Active Role</div>
          <div className="mt-1 text-sidebar-foreground/80">{role}</div>
          <div className="mt-2 flex items-center gap-2 text-sidebar-foreground/80">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Systems operational
          </div>
        </div>
      </div>
    </aside>
  );
}

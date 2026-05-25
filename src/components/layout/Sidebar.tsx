import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Menu, type MenuProps } from "antd";
import {
  DashboardOutlined,
  InboxOutlined,
  CoffeeOutlined,
  BuildOutlined,
  UnorderedListOutlined,
  FileDoneOutlined,
  EditOutlined,
  CalculatorOutlined,
  BarChartOutlined,
  DatabaseOutlined,
  FileSearchOutlined,
  SendOutlined,
  SwapOutlined,
  ArrowRightOutlined,
  AppstoreOutlined,
  SlidersOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  MailOutlined,
  FileAddOutlined,
  DiffOutlined,
  ShoppingCartOutlined,
  CarOutlined,
  RollbackOutlined,
  LineChartOutlined,
  WalletOutlined,
  SafetyCertificateOutlined,
  PieChartOutlined,
  SafetyOutlined,
  MedicineBoxOutlined,
  FireOutlined,
  MonitorOutlined,
  DropboxOutlined,
  RocketOutlined,
  ToolOutlined,
  WarningOutlined,
  TeamOutlined,
  AuditOutlined,
  CheckCircleOutlined,
  SettingOutlined,
  TagOutlined,
  BankOutlined,
  HomeOutlined,
  DollarOutlined,
  BranchesOutlined,
} from "@ant-design/icons";
import { useRole, ROLE_PERMS } from "@/lib/roles";

type AntIcon = ReactNode;
type Item = { to: string; label: string; icon: AntIcon; key: string };
type Group = { key: string; label: string; icon: AntIcon; items: Item[] };
type Entry = Item | Group;

const NAV: Entry[] = [
  { key: "dashboard", to: "/", label: "Dashboard", icon: <DashboardOutlined /> },
  { key: "order-management", to: "/order-management", label: "Order Management", icon: <InboxOutlined /> },
  { key: "meal-planning", to: "/meal-planning", label: "Meal Planning", icon: <CoffeeOutlined /> },
  {
    key: "production",
    label: "Production Management",
    icon: <BuildOutlined />,
    items: [
      { key: "inventory-bom", to: "/bom", label: "Bill of Materials", icon: <UnorderedListOutlined /> },
      { key: "production-entry", to: "/production-entry", label: "Production Order", icon: <FileDoneOutlined /> },
      { key: "production-entry-new", to: "/production-entry-new", label: "Production Entry", icon: <EditOutlined /> },
      { key: "mrp", to: "/mrp", label: "Material Requirement Planning", icon: <CalculatorOutlined /> },
      { key: "production-reports", to: "/production-reports", label: "Production Reports", icon: <BarChartOutlined /> },
    ],
  },
  {
    key: "inventory",
    label: "Inventory & Store",
    icon: <DatabaseOutlined />,
    items: [
      { key: "inventory-demand", to: "/demand-orders", label: "Demand Requests", icon: <FileSearchOutlined /> },
      { key: "inventory-issue", to: "/item-issue", label: "Item Issue", icon: <SendOutlined /> },
      { key: "inventory-transfer-request", to: "/transfer-request", label: "Transfer Request", icon: <SwapOutlined /> },
      { key: "inventory-transfer", to: "/transfer", label: "Transfer", icon: <ArrowRightOutlined /> },
      { key: "inventory-stock", to: "/inventory", label: "Stock Overview", icon: <AppstoreOutlined /> },
      { key: "inventory-adjustment", to: "/stock-adjustment", label: "Stock Adjustment", icon: <SlidersOutlined /> },
    ],
  },
  {
    key: "supply",
    label: "Supply Chain",
    icon: <ShoppingOutlined />,
    items: [
      { key: "supply-pr", to: "/purchase-requisition", label: "Purchase Requisition", icon: <FileTextOutlined /> },
      { key: "supply-rfq", to: "/request-for-quotation", label: "Request for Quotation", icon: <MailOutlined /> },
      { key: "supply-qe", to: "/quotation-entry", label: "Quotation Entry", icon: <FileAddOutlined /> },
      { key: "supply-cs", to: "/comparative-statement", label: "Comparative Statement", icon: <DiffOutlined /> },
      { key: "supply-po", to: "/procurement", label: "Purchase Orders", icon: <ShoppingCartOutlined /> },
      { key: "supply-receive", to: "/receive-item", label: "Receive Items", icon: <CarOutlined /> },
      { key: "supply-return", to: "/purchase-return", label: "Purchase Return", icon: <RollbackOutlined /> },
      { key: "supply-reports", to: "/purchase-reports", label: "Purchase Reports", icon: <LineChartOutlined /> },
    ],
  },
  {
    key: "accounts",
    label: "Accounts",
    icon: <WalletOutlined />,
    items: [
      { key: "accounts-invoices", to: "/accounts-invoices", label: "Invoices & Payments", icon: <FileTextOutlined /> },
      { key: "accounts-approvals", to: "/accounts-approvals", label: "Payment Approvals", icon: <SafetyCertificateOutlined /> },
      { key: "accounts-expenses", to: "/accounts-expenses", label: "Expense Overview", icon: <PieChartOutlined /> },
    ],
  },
  {
    key: "qc",
    label: "Food Safety & QC",
    icon: <SafetyOutlined />,
    items: [
      { key: "qc-hygiene", to: "/hygiene-monitoring", label: "Daily Hygiene Monitoring", icon: <MedicineBoxOutlined /> },
      { key: "qc-temp", to: "/cooking-temp", label: "Cooking Temp & Sensory", icon: <FireOutlined /> },
      { key: "qc-dispatch-monitoring", to: "/dispatch-monitoring", label: "Dispatch Monitoring", icon: <MonitorOutlined /> },
    ],
  },
  { key: "dispatch", to: "/dispatch", label: "Packaging & Dispatch", icon: <DropboxOutlined /> },
  {
    key: "airline-consumables",
    label: "Airline Consumables",
    icon: <CoffeeOutlined />,
    items: [
      { key: "consumables-inventory",   to: "/airline-consumables",    label: "Inventory",         icon: <AppstoreOutlined /> },
      { key: "consumables-usage",       to: "/consumable-usage",       label: "Usage Tracking",    icon: <SendOutlined /> },
      { key: "consumables-allocation",  to: "/consumable-allocation",  label: "Flight Allocation", icon: <RocketOutlined /> },
    ],
  },
  {
    key: "airline-equipments",
    label: "Airline Equipments",
    icon: <ToolOutlined />,
    items: [
      { key: "equipments-assets",       to: "/airline-equipments",    label: "Assets",         icon: <DatabaseOutlined /> },
      { key: "equipments-maintenance",  to: "/equipment-maintenance", label: "Maintenance",    icon: <ToolOutlined /> },
      { key: "equipments-returns",      to: "/equipment-returns",     label: "Returns",        icon: <RollbackOutlined /> },
      { key: "equipments-damage",       to: "/equipment-damage",      label: "Damage Reports", icon: <WarningOutlined /> },
    ],
  },
  { key: "maintenance", to: "/maintenance", label: "Maintenance & Assets", icon: <ToolOutlined /> },
  { key: "reports", to: "/reports", label: "Reports", icon: <BarChartOutlined /> },
  { key: "users", to: "/users", label: "User Management", icon: <TeamOutlined /> },
  { key: "audit", to: "/audit", label: "Audit Logs", icon: <AuditOutlined /> },
  { key: "approval-management", to: "/approval-management", label: "Approval Management", icon: <CheckCircleOutlined /> },
  {
    key: "config",
    label: "Configuration Management",
    icon: <SettingOutlined />,
    items: [
      { key: "config-item",      to: "/config-item",      label: "Item Profile",     icon: <TagOutlined /> },
      { key: "config-supplier",  to: "/config-supplier",  label: "Supplier Profile", icon: <CarOutlined /> },
      { key: "config-company",   to: "/config-company",   label: "Company Profile",  icon: <BankOutlined /> },
      { key: "config-airline",   to: "/config-airline",   label: "Airline",          icon: <RocketOutlined /> },
      { key: "config-office",    to: "/config-office",    label: "Office",           icon: <HomeOutlined /> },
      { key: "config-warehouse", to: "/config-warehouse", label: "Warehouse",        icon: <DatabaseOutlined /> },
      { key: "config-price",     to: "/config-price",     label: "Price Setup",      icon: <DollarOutlined /> },
      { key: "config-approval",  to: "/config-approval",  label: "Approval Setup",   icon: <BranchesOutlined /> },
    ],
  },
];

function isGroup(e: Entry): e is Group {
  return (e as Group).items !== undefined;
}

type SidebarProps = { collapsed?: boolean };

export function Sidebar({ collapsed = false }: SidebarProps) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { role } = useRole();
  const perms = ROLE_PERMS[role];
  const allowed = (key: string) => perms === "*" || perms.includes(key) || perms.some(p => key.startsWith(p));

  const filtered: Entry[] = useMemo(() => (
    NAV
      .map((e) => {
        if (isGroup(e)) {
          const items = e.items.filter((i) => allowed(i.key) || allowed(e.key));
          return items.length ? { ...e, items } : null;
        }
        return allowed(e.key) ? e : null;
      })
      .filter(Boolean) as Entry[]
  // perms changes whenever role changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [role]);

  // Build Ant Menu items with TanStack Router links as labels so all native
  // link affordances (right-click / middle-click / ctrl+click) keep working.
  const menuItems: MenuProps["items"] = useMemo(() => (
    filtered.map((entry) => {
      if (!isGroup(entry)) {
        return {
          key: entry.to,
          icon: entry.icon,
          label: (
            <Link
              to={entry.to}
              data-tour={`tour-${entry.key}`}
              style={{ color: "inherit", display: "block" }}
            >
              {entry.label}
            </Link>
          ),
        };
      }
      return {
        key: `group:${entry.key}`,
        icon: entry.icon,
        label: <span data-tour={`tour-${entry.key}`}>{entry.label}</span>,
        children: entry.items.map((item) => ({
          key: item.to,
          icon: item.icon,
          label: (
            <Link
              to={item.to}
              style={{ color: "inherit", display: "block" }}
            >
              {item.label}
            </Link>
          ),
        })),
      };
    })
  ), [filtered]);

  // Active route → selectedKeys; ancestor group → openKeys.
  const selectedKeys = [path];
  const activeGroupKey = useMemo(() => {
    const g = filtered.find((e) => isGroup(e) && e.items.some((i) => i.to === path));
    return g ? `group:${g.key}` : null;
  }, [filtered, path]);

  const [openKeys, setOpenKeys] = useState<string[]>(
    activeGroupKey ? [activeGroupKey] : [],
  );

  useEffect(() => {
    if (activeGroupKey && !openKeys.includes(activeGroupKey)) {
      setOpenKeys((k) => Array.from(new Set([...k, activeGroupKey])));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGroupKey]);

  return (
    <div className="flex flex-col h-full">
      {!collapsed && (
        <div
          className="field-label"
          style={{ padding: "16px 20px 8px" }}
        >
          Operations Console
        </div>
      )}

      <Menu
        mode="inline"
        inlineCollapsed={collapsed}
        items={menuItems}
        selectedKeys={selectedKeys}
        openKeys={collapsed ? [] : openKeys}
        onOpenChange={(keys) => setOpenKeys(keys as string[])}
        style={{
          flex: 1,
          borderInlineEnd: "none",
          background: "transparent",
        }}
      />

      {!collapsed && (
        <div
          style={{
            margin: "12px 16px 16px",
            padding: "10px 12px",
            borderRadius: 8,
            background: "var(--sidebar-accent)",
            color: "var(--sidebar-accent-foreground)",
            fontSize: 11,
            lineHeight: 1.4,
          }}
        >
          <div style={{ fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", fontSize: 10 }}>
            Active Role
          </div>
          <div style={{ marginTop: 4, color: "var(--sidebar-foreground)" }}>{role}</div>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6, color: "var(--muted-foreground)" }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "9999px",
                background: "var(--color-success)",
                display: "inline-block",
              }}
            />
            Systems operational
          </div>
        </div>
      )}

      {collapsed && (
        <div style={{ padding: "12px 0", display: "flex", justifyContent: "center" }} title={`Active role: ${role}`}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "9999px",
              background: "var(--color-success)",
              display: "inline-block",
            }}
          />
        </div>
      )}
    </div>
  );
}

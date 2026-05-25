export interface BreadcrumbItem {
  label: string;
  path: string;
}

interface PathMeta {
  label: string;
  parent?: string;
}

const PATH_META: Record<string, PathMeta> = {
  "/": { label: "Dashboard" },
  "/order-management": { label: "Order Management" },
  "/meal-planning": { label: "Meal Planning" },
  "/bom": { label: "Bill of Materials", parent: "Production" },
  "/production-entry": { label: "Production Order", parent: "Production" },
  "/production-entry-new": { label: "Production Entry", parent: "Production" },
  "/mrp": { label: "Material Requirement Planning", parent: "Production" },
  "/production-reports": { label: "Production Reports", parent: "Production" },
  "/demand-orders": { label: "Demand Requests", parent: "Inventory & Store" },
  "/item-issue": { label: "Item Issue", parent: "Inventory & Store" },
  "/transfer-request": { label: "Transfer Request", parent: "Inventory & Store" },
  "/transfer": { label: "Transfer", parent: "Inventory & Store" },
  "/inventory": { label: "Stock Overview", parent: "Inventory & Store" },
  "/stock-adjustment": { label: "Stock Adjustment", parent: "Inventory & Store" },
  "/purchase-requisition": { label: "Purchase Requisition", parent: "Supply Chain" },
  "/request-for-quotation": { label: "Request for Quotation", parent: "Supply Chain" },
  "/quotation-entry": { label: "Quotation Entry", parent: "Supply Chain" },
  "/comparative-statement": { label: "Comparative Statement", parent: "Supply Chain" },
  "/procurement": { label: "Purchase Orders", parent: "Supply Chain" },
  "/receive-item": { label: "Receive Items", parent: "Supply Chain" },
  "/purchase-return": { label: "Purchase Return", parent: "Supply Chain" },
  "/purchase-reports": { label: "Purchase Reports", parent: "Supply Chain" },
  "/accounts-invoices": { label: "Invoices & Payments", parent: "Accounts" },
  "/accounts-approvals": { label: "Payment Approvals", parent: "Accounts" },
  "/accounts-expenses": { label: "Expense Overview", parent: "Accounts" },
  "/hygiene-monitoring": { label: "Hygiene Monitoring", parent: "Food Safety & QC" },
  "/cooking-temp": { label: "Cooking Temp & Sensory", parent: "Food Safety & QC" },
  "/dispatch-monitoring": { label: "Dispatch Monitoring", parent: "Food Safety & QC" },
  "/dispatch": { label: "Packaging & Dispatch" },
  "/airline-consumables": { label: "Consumables Inventory", parent: "Airline Consumables" },
  "/consumable-usage": { label: "Usage Tracking", parent: "Airline Consumables" },
  "/consumable-allocation": { label: "Flight Allocation", parent: "Airline Consumables" },
  "/airline-equipments": { label: "Equipment Assets", parent: "Airline Equipments" },
  "/equipment-maintenance": { label: "Maintenance", parent: "Airline Equipments" },
  "/equipment-returns": { label: "Returns", parent: "Airline Equipments" },
  "/equipment-damage": { label: "Damage Reports", parent: "Airline Equipments" },
  "/maintenance": { label: "Maintenance & Assets" },
  "/reports": { label: "Reports" },
  "/users": { label: "User Management" },
  "/audit": { label: "Audit Logs" },
  "/approval-management": { label: "Approval Management" },
  "/config-item": { label: "Item Profile", parent: "Configuration" },
  "/config-supplier": { label: "Supplier Profile", parent: "Configuration" },
  "/config-company": { label: "Company Profile", parent: "Configuration" },
  "/config-airline": { label: "Airline", parent: "Configuration" },
  "/config-office": { label: "Office", parent: "Configuration" },
  "/config-warehouse": { label: "Warehouse", parent: "Configuration" },
  "/config-price": { label: "Price Setup", parent: "Configuration" },
  "/config-approval": { label: "Approval Setup", parent: "Configuration" },
  "/bakery": { label: "Bakery" },
  "/kitchen": { label: "Kitchen" },
};

function toTitleCase(str: string): string {
  return str.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getPageLabel(pathname: string): string {
  return PATH_META[pathname]?.label ?? toTitleCase(pathname.split("/").filter(Boolean).pop() ?? "Page");
}

export function getPageBreadcrumb(pathname: string): BreadcrumbItem[] {
  if (pathname === "/") return [{ label: "Dashboard", path: "/" }];
  const meta = PATH_META[pathname];
  if (!meta) return [{ label: "Home", path: "/" }, { label: toTitleCase(pathname.split("/").filter(Boolean).pop() ?? ""), path: pathname }];
  if (meta.parent) {
    return [
      { label: "Home", path: "/" },
      { label: meta.parent, path: "#" },
      { label: meta.label, path: pathname },
    ];
  }
  return [{ label: "Home", path: "/" }, { label: meta.label, path: pathname }];
}

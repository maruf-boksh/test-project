import { createContext, useContext } from "react";

export const ROLES = [
  "GM/Admin",
  "Meal Planner",
  "Flight Kitchen",
  "Bakery Production",
  "Amenities",
  "Packaging & Dispatch",
  "Store & Inventory",
  "Procurement & Supply Chain",
  "Food Safety & QC",
  "Maintenance & Asset",
  "Reports & Analytics",
] as const;

export type Role = (typeof ROLES)[number];

export const RoleContext = createContext<{
  role: Role;
  setRole: (r: Role) => void;
}>({ role: "GM/Admin", setRole: () => {} });

export const useRole = () => useContext(RoleContext);

/** Which sidebar group keys each role can see. "*" = all. */
export const ROLE_PERMS: Record<Role, string[] | "*"> = {
  "GM/Admin": "*",
  "Meal Planner": ["dashboard", "upload", "meal-planning", "production"],
  "Flight Kitchen": ["dashboard", "production-kitchen", "qc"],
  "Bakery Production": ["dashboard", "production-bakery", "qc"],
  "Amenities": ["dashboard", "production-amenities"],
  "Packaging & Dispatch": ["dashboard", "production-dispatch"],
  "Store & Inventory": ["dashboard", "inventory", "supply-receive"],
  "Procurement & Supply Chain": ["dashboard", "supply", "inventory-bom"],
  "Food Safety & QC": ["dashboard", "qc"],
  "Maintenance & Asset": ["dashboard", "maintenance"],
  "Reports & Analytics": ["dashboard", "reports", "audit"],
};

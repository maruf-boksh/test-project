import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Warehouse, X } from "lucide-react";
import {
  activeOffices, activeWarehousesByOffice, warehouses, offices,
} from "@/lib/sample-data";

const selectCls =
  "w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

/**
 * Mandatory Office + Warehouse picker for create forms.
 * Cascading: Warehouse list is filtered by selected Office.
 * Caller should treat both values as required at save time.
 */
export function LocationPicker({
  officeId, warehouseId, onChange, required = true, labelOffice = "Office", labelWarehouse = "Warehouse",
}: {
  officeId: string;
  warehouseId: string;
  onChange: (next: { officeId: string; warehouseId: string }) => void;
  required?: boolean;
  labelOffice?: string;
  labelWarehouse?: string;
}) {
  const officeChoices = activeOffices;
  const warehouseChoices = officeId ? activeWarehousesByOffice(officeId) : [];

  const handleOffice = (next: string) => {
    // Reset warehouse if it doesn't belong to the new office
    const stillValid = warehouses.some((w) => w.id === warehouseId && w.officeId === next);
    onChange({ officeId: next, warehouseId: stillValid ? warehouseId : "" });
  };

  return (
    <>
      <div>
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          {labelOffice} {required && <span className="text-destructive">*</span>}
        </Label>
        <select
          value={officeId}
          onChange={(e) => handleOffice(e.target.value)}
          className={selectCls}
        >
          <option value="">Select office</option>
          {officeChoices.map((o) => (
            <option key={o.id} value={o.id}>
              {o.code} — {o.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          {labelWarehouse} {required && <span className="text-destructive">*</span>}
        </Label>
        <select
          value={warehouseId}
          onChange={(e) => onChange({ officeId, warehouseId: e.target.value })}
          className={selectCls}
          disabled={!officeId}
        >
          <option value="">
            {!officeId ? "Select office first" : warehouseChoices.length === 0 ? "No warehouses" : "Select warehouse"}
          </option>
          {warehouseChoices.map((w) => (
            <option key={w.id} value={w.id}>
              {w.code} — {w.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

/**
 * Cascading filter row for list pages. Renders two compact pill controls
 * (Office + Warehouse) and a clear button. The Warehouse dropdown is filtered
 * by the selected Office.
 */
export function LocationFilter({
  officeId, warehouseId, onChange,
}: {
  officeId: string;
  warehouseId: string;
  onChange: (next: { officeId: string; warehouseId: string }) => void;
}) {
  const officeChoices = activeOffices;
  const warehouseChoices = officeId
    ? activeWarehousesByOffice(officeId)
    : []; // require office before showing warehouse options

  const handleOffice = (next: string) => {
    const stillValid = warehouses.some((w) => w.id === warehouseId && w.officeId === next);
    onChange({ officeId: next, warehouseId: stillValid ? warehouseId : "" });
  };

  const clear = () => onChange({ officeId: "", warehouseId: "" });
  const anyActive = !!officeId || !!warehouseId;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 shadow-sm">
        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
        <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Office</Label>
        <select
          value={officeId}
          onChange={(e) => handleOffice(e.target.value)}
          className="h-7 bg-transparent border-0 text-sm focus:outline-none focus:ring-0 pr-1 min-w-[120px]"
        >
          <option value="">All</option>
          {officeChoices.map((o) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 shadow-sm">
        <Warehouse className="h-3.5 w-3.5 text-muted-foreground" />
        <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Warehouse</Label>
        <select
          value={warehouseId}
          onChange={(e) => onChange({ officeId, warehouseId: e.target.value })}
          className="h-7 bg-transparent border-0 text-sm focus:outline-none focus:ring-0 pr-1 min-w-[140px] disabled:opacity-60"
          disabled={!officeId}
        >
          <option value="">{officeId ? "All" : "Pick office"}</option>
          {warehouseChoices.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>
      {anyActive && (
        <Button
          size="sm"
          variant="ghost"
          className="h-8 px-2 text-xs text-muted-foreground"
          onClick={clear}
        >
          <X className="h-3.5 w-3.5 mr-1" /> Location
        </Button>
      )}
    </div>
  );
}

/**
 * Look up display names — used in list table cells when rendering tagged rows.
 * Returns "—" for empty / unknown ids so existing seed rows degrade gracefully.
 */
export function officeName(id: string | undefined | null): string {
  if (!id) return "—";
  return offices.find((o) => o.id === id)?.name ?? "—";
}
export function warehouseName(id: string | undefined | null): string {
  if (!id) return "—";
  return warehouses.find((w) => w.id === id)?.name ?? "—";
}

/**
 * Compact two-line label for table cells: Office on top, Warehouse below.
 * Returns nothing renderable if both empty.
 */
export function LocationCell({ officeId, warehouseId }: { officeId?: string; warehouseId?: string }) {
  const o = officeName(officeId);
  const w = warehouseName(warehouseId);
  if (o === "—" && w === "—") return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <div className="text-xs leading-tight">
      <div className="text-foreground">{o}</div>
      <div className="text-muted-foreground">{w}</div>
    </div>
  );
}

/**
 * Pill-style location badge — for compact row displays.
 */
export function LocationBadge({ officeId, warehouseId }: { officeId?: string; warehouseId?: string }) {
  const w = warehouseName(warehouseId);
  if (w === "—") return null;
  return (
    <Badge variant="outline" className="font-normal text-[10px] h-5 px-1.5 gap-1">
      <Warehouse className="h-2.5 w-2.5" />
      {w}
    </Badge>
  );
}

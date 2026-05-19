import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { RowActions } from "@/components/common/RowActions";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Layers, FileText, CheckCircle } from "lucide-react";
import { billOfMaterials } from "@/lib/sample-data";
import { KpiCard } from "@/components/common/KpiCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/bom")({
  head: () => ({ meta: [{ title: "Bill of Materials" }] }),
  component: BomPage,
});

type BOM = (typeof billOfMaterials)[number];

function BomList({ data }: { data: BOM[] }) {
  const cols: Column<BOM>[] = [
    { key: "id", header: "BOM #" },
    { key: "meal", header: "Meal / Recipe" },
    { key: "components", header: "Components" },
    { key: "version", header: "Version" },
    { key: "yield", header: "Yield" },
    { key: "lastUpdated", header: "Last Updated" },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];
  return (
    <DataTable
      title="bom"
      data={data}
      columns={cols}
      searchKeys={["id", "meal", "status"]}
      actions={(r) => <RowActions row={r} actions={["view", "edit", "approve", "print", "delete"]} />}
    />
  );
}

function BomCreate({ onSave }: { onSave?: () => void }) {
  return (
    <div className="bg-card p-6 rounded-lg border border-border max-w-3xl">
      <h3 className="font-semibold mb-4 text-base">Create Bill of Materials</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>BOM Code</Label><Input defaultValue="BOM-007" /></div>
        <div><Label>Version</Label><Input defaultValue="v1.0" /></div>
        <div className="col-span-2"><Label>Meal / Recipe</Label><Input placeholder="Select meal" /></div>
        <div><Label>Yield Quantity</Label><Input defaultValue="100" /></div>
        <div><Label>Yield UOM</Label><Input defaultValue="portions" /></div>
      </div>
      <h4 className="font-medium mt-5 mb-2 text-sm">Component Lines</h4>
      <table className="w-full text-sm border border-border rounded-md">
        <thead className="bg-muted">
          <tr>
            <th className="p-2 text-left">Item</th>
            <th className="p-2">Qty</th>
            <th className="p-2">UOM</th>
            <th className="p-2">Loss %</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3].map((i) => (
            <tr key={i} className="border-t border-border">
              <td className="p-1.5"><Input className="h-8" placeholder="INV-100x" /></td>
              <td className="p-1.5"><Input className="h-8 w-20" /></td>
              <td className="p-1.5"><Input className="h-8 w-20" /></td>
              <td className="p-1.5"><Input className="h-8 w-20" defaultValue="2" /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-2 mt-4 justify-end">
        <Button variant="outline" onClick={() => toast.success("Component line added.")}>+ Add Line</Button>
        <Button onClick={() => { toast.success("BOM saved."); onSave?.(); }}>Save BOM</Button>
      </div>
    </div>
  );
}

function BomPage() {
  const [boms] = useState<BOM[]>(billOfMaterials);
  const [view, setView] = useState<"list" | "create">("list");

  const activeCount = boms.filter((b) => b.status === "Active").length;
  const draftCount = boms.filter((b) => b.status === "Draft").length;

  return (
    <>
      <PageHeader
        title="Bill of Materials (BOM)"
        subtitle="Manage meal recipes, component lists, version control and yield planning for the flight kitchen"
        actions={
          <>
            <Button variant="outline" onClick={() => toast.success("BOM report exported.")}>
              <FileText className="h-4 w-4 mr-1" /> Export
            </Button>
            <Button onClick={() => setView(view === "create" ? "list" : "create")}>
              <Plus className="h-4 w-4 mr-1" /> {view === "create" ? "View List" : "Create BOM"}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard label="Total BOMs" value={boms.length} icon={Layers} tone="navy" />
        <KpiCard label="Active" value={activeCount} icon={CheckCircle} tone="success" />
        <KpiCard label="Draft" value={draftCount} icon={FileText} tone="warning" />
      </div>

      {view === "list" ? <BomList data={boms} /> : <BomCreate onSave={() => setView("list")} />}
    </>
  );
}

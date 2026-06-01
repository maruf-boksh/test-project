import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { RowActions } from "@/components/common/RowActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, ArrowLeft, Save, Truck, CheckCircle, XCircle } from "lucide-react";
import { KpiCard } from "@/components/common/KpiCard";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Supplier = {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  taxId: string;
  category: string;
  status: "Active" | "Inactive";
};

const CATEGORIES = ["Grocery", "Meat & Poultry", "Dairy", "Beverage", "Packaging", "Equipment", "Service"];

const selectCls =
  "w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

const SEED: Supplier[] = [
  { id: "SUP-001", code: "AGRO-FRESH", name: "Agro Fresh Ltd.",      contactPerson: "Md. Karim",      phone: "+880 1711-123456", email: "sales@agrofresh.bd", address: "Tejgaon, Dhaka",         taxId: "TIN-001245", category: "Grocery",       status: "Active" },
  { id: "SUP-002", code: "MEAT-CO",    name: "Meat & Co.",           contactPerson: "S. Ahmed",       phone: "+880 1712-234567", email: "orders@meatco.bd",   address: "Mirpur, Dhaka",          taxId: "TIN-002344", category: "Meat & Poultry",status: "Active" },
  { id: "SUP-003", code: "DAIRY-PL",   name: "Dairy Plus",           contactPerson: "F. Begum",       phone: "+880 1713-345678", email: "hello@dairyplus.bd", address: "Savar, Dhaka",           taxId: "TIN-003456", category: "Dairy",         status: "Active" },
  { id: "SUP-004", code: "PKGS-BD",    name: "Packaging BD",         contactPerson: "R. Hossain",     phone: "+880 1714-456789", email: "sales@pkgsbd.com",   address: "Gazipur",                taxId: "TIN-004567", category: "Packaging",     status: "Active" },
  { id: "SUP-005", code: "BEV-WTR",    name: "Pure Water Co.",       contactPerson: "T. Islam",       phone: "+880 1715-567890", email: "info@purewater.bd",  address: "Narayanganj",            taxId: "TIN-005678", category: "Beverage",      status: "Inactive" },
];

export default function ConfigSupplierPage() {
  const [rows, setRows] = useState<Supplier[]>(SEED);
  const [view, setView] = useState<"list" | "create">("list");

  const toggle = (id: string) =>
    setRows((p) => p.map((r) => (r.id === id ? { ...r, status: r.status === "Active" ? "Inactive" : "Active" } : r)));

  const add = (s: Supplier) => { setRows((p) => [s, ...p]); setView("list"); };
  const active = rows.filter((r) => r.status === "Active").length;

  return (
    <>
      <PageHeader
        title="Supplier Profile"
        subtitle="Manage vendor master data, contacts, tax IDs and procurement categories"
        actions={
          <Button
            variant={view === "create" ? "outline" : "default"}
            onClick={() => setView(view === "create" ? "list" : "create")}
          >
            {view === "create" ? <><ArrowLeft className="h-4 w-4 mr-1" /> Back</> : <><Plus className="h-4 w-4 mr-1" /> Create Supplier</>}
          </Button>
        }
      />
      {view === "list" ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <KpiCard label="Total Suppliers" value={rows.length} icon={Truck} tone="navy" />
            <KpiCard label="Active" value={active} icon={CheckCircle} tone="success" />
            <KpiCard label="Inactive" value={rows.length - active} icon={XCircle} tone="warning" />
          </div>
          <SupplierList data={rows} onToggle={toggle} />
        </>
      ) : (
        <SupplierCreate nextId={`SUP-${String(rows.length + 1).padStart(3, "0")}`} onSave={add} />
      )}
    </>
  );
}

function SupplierList({ data, onToggle }: { data: Supplier[]; onToggle: (id: string) => void }) {
  const cols: Column<Supplier>[] = [
    { key: "id", header: "ID" },
    { key: "code", header: "Code", render: (r) => <span className="font-mono text-xs">{r.code}</span> },
    { key: "name", header: "Supplier Name" },
    { key: "category", header: "Category" },
    { key: "contactPerson", header: "Contact" },
    { key: "phone", header: "Phone", className: "text-xs" },
    {
      key: "status",
      header: "Status",
      render: (r) => {
        const a = r.status === "Active";
        return (
          <div className="flex items-center gap-2">
            <Switch checked={a} onCheckedChange={() => onToggle(r.id)} />
            <span className={cn("text-xs font-medium", a ? "text-success" : "text-muted-foreground")}>{r.status}</span>
          </div>
        );
      },
    },
  ];
  return (
    <DataTable
      title="suppliers"
      data={data}
      columns={cols}
      searchKeys={["id", "code", "name", "category", "contactPerson"]}
      selectable={false}
      actions={(r) => <RowActions row={r} actions={["view", "edit", "print"]} />}
    />
  );
}

function SupplierCreate({ nextId, onSave }: { nextId: string; onSave: (s: Supplier) => void }) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [taxId, setTaxId] = useState("");
  const [address, setAddress] = useState("");

  const save = () => {
    if (!name.trim()) { toast.error("Supplier name is required."); return; }
    if (!code.trim()) { toast.error("Supplier code is required."); return; }
    onSave({
      id: nextId, code: code.trim().toUpperCase(), name: name.trim(),
      contactPerson, phone, email, address, taxId, category,
      status: "Active",
    });
    toast.success(`Supplier "${name.trim()}" created.`);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider">Create Supplier</h3>
          <Button onClick={save}><Save className="h-4 w-4 mr-1.5" /> Save</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Supplier ID</Label>
            <Input value={nextId} disabled className="mt-1 font-mono" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Supplier Code <span className="text-destructive">*</span></Label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} className="mt-1" placeholder="e.g. AGRO-FRESH" />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Supplier Name <span className="text-destructive">*</span></Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Category</Label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Tax / TIN</Label>
            <Input value={taxId} onChange={(e) => setTaxId(e.target.value)} className="mt-1" placeholder="TIN-XXXXXX" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Contact Person</Label>
            <Input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" placeholder="+880 1XXX-XXXXXX" />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Address</Label>
            <Textarea value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1" rows={2} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

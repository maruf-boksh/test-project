import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { RowActions } from "@/components/common/RowActions";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/users")({
  head: () => ({ meta: [{ title: "User Management" }] }),
  component: Users,
});

const USERS = [
  { id: "U-001", name: "R. Hossain", email: "r.hossain@usbair.com", role: "GM/Admin", dept: "Management", status: "Approved" },
  { id: "U-002", name: "F. Begum", email: "f.begum@usbair.com", role: "Food Safety & QC", dept: "QC", status: "Approved" },
  { id: "U-003", name: "M. Karim", email: "m.karim@usbair.com", role: "Packaging & Dispatch", dept: "Dispatch", status: "Approved" },
  { id: "U-004", name: "S. Ahmed", email: "s.ahmed@usbair.com", role: "Procurement & Supply Chain", dept: "Procurement", status: "Pending Approval" },
  { id: "U-005", name: "T. Rahman", email: "t.rahman@usbair.com", role: "Flight Operations", dept: "Ops", status: "Approved" },
  { id: "U-006", name: "N. Chowdhury", email: "n.chow@usbair.com", role: "Accounts & Finance", dept: "Finance", status: "Approved" },
  { id: "U-007", name: "A. Khan", email: "a.khan@usbair.com", role: "Flight Kitchen Production", dept: "Kitchen", status: "Approved" },
];

type U = (typeof USERS)[number];

function Users() {
  const cols: Column<U>[] = [
    { key: "id", header: "User ID" },
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "role", header: "Role" },
    { key: "dept", header: "Department" },
    { key: "status", header: "Status", render: r => <StatusBadge status={r.status} /> },
  ];
  return (
    <>
      <PageHeader
        title="User Management"
        subtitle="System users, roles & permissions"
        actions={<Button><Plus className="h-4 w-4 mr-1" /> New User</Button>}
      />
      <DataTable
        title="users"
        data={USERS}
        columns={cols}
        searchKeys={["name", "email", "role", "dept"]}
        actions={(r) => <RowActions row={r} actions={["view", "edit", "approve", "reject", "delete"]} />}
      />
    </>
  );
}

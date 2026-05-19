import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { MoreHorizontal, Eye, Pencil, Trash2, Check, X, Printer, Download, MapPin, UserPlus } from "lucide-react";
import { toast } from "sonner";

type ActionKey = "view" | "edit" | "delete" | "approve" | "reject" | "print" | "export" | "assign" | "track";

const META: Record<ActionKey, { label: string; icon: any }> = {
  view: { label: "View", icon: Eye },
  edit: { label: "Edit", icon: Pencil },
  delete: { label: "Delete", icon: Trash2 },
  approve: { label: "Approve", icon: Check },
  reject: { label: "Reject", icon: X },
  print: { label: "Print", icon: Printer },
  export: { label: "Export", icon: Download },
  assign: { label: "Assign", icon: UserPlus },
  track: { label: "Track Status", icon: MapPin },
};

export function RowActions({
  row, actions = ["view", "edit", "approve", "delete"],
  detail,
}: {
  row: Record<string, any>;
  actions?: ActionKey[];
  detail?: ReactNode;
}) {
  const [open, setOpen] = useState<null | "view" | "edit" | "delete" | "approve" | "reject">(null);

  const handle = (a: ActionKey) => {
    if (a === "view" || a === "edit" || a === "delete" || a === "approve" || a === "reject") {
      setOpen(a); return;
    }
    if (a === "print") { window.print(); return; }
    if (a === "export") { toast.success(`Exporting ${row.id || "record"}`); return; }
    if (a === "assign") { toast.success(`Assigned ${row.id}`); return; }
    if (a === "track") { toast.info(`Tracking ${row.id}`); return; }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {actions.map((a, i) => {
            const m = META[a];
            const Icon = m.icon;
            return (
              <div key={a}>
                {(a === "delete" || a === "reject") && i > 0 && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  onClick={() => handle(a)}
                  className={a === "delete" || a === "reject" ? "text-destructive focus:text-destructive" : ""}
                >
                  <Icon className="h-4 w-4 mr-2" /> {m.label}
                </DropdownMenuItem>
              </div>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {open === "view" && `Record Details — ${row.id}`}
              {open === "edit" && `Edit Record — ${row.id}`}
              {open === "delete" && `Confirm Delete — ${row.id}`}
              {open === "approve" && `Approve — ${row.id}`}
              {open === "reject" && `Reject — ${row.id}`}
            </DialogTitle>
            <DialogDescription>
              {open === "delete" && "This action cannot be undone."}
              {open === "approve" && "Approving will move this record to the next workflow stage."}
              {open === "reject" && "Rejection requires a reason and notifies the originator."}
              {open === "edit" && "Update fields and save changes."}
              {open === "view" && "Read-only view of all record attributes."}
            </DialogDescription>
          </DialogHeader>

          {(open === "view" || open === "edit") && (
            <div className="grid grid-cols-2 gap-3 max-h-[420px] overflow-auto">
              {detail ?? Object.entries(row).map(([k, v]) => (
                <div key={k} className="border border-border rounded-md p-2">
                  <div className="text-[10px] uppercase text-muted-foreground">{k}</div>
                  {open === "edit" ? (
                    <input
                      defaultValue={String(v)}
                      className="w-full mt-1 text-sm bg-transparent border-b border-border focus:outline-none focus:border-primary"
                    />
                  ) : (
                    <div className="text-sm font-medium">{String(v)}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {open === "reject" && (
            <textarea
              placeholder="Reason for rejection..."
              className="w-full border border-border rounded-md p-2 text-sm min-h-24"
            />
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(null)}>Cancel</Button>
            {open === "delete" && (
              <Button variant="destructive" onClick={() => { toast.success(`Deleted ${row.id}`); setOpen(null); }}>
                Delete
              </Button>
            )}
            {open === "approve" && (
              <Button onClick={() => { toast.success(`Approved ${row.id}`); setOpen(null); }}>
                Approve
              </Button>
            )}
            {open === "reject" && (
              <Button variant="destructive" onClick={() => { toast.success(`Rejected ${row.id}`); setOpen(null); }}>
                Reject
              </Button>
            )}
            {open === "edit" && (
              <Button onClick={() => { toast.success(`Saved ${row.id}`); setOpen(null); }}>
                Save Changes
              </Button>
            )}
            {open === "view" && <Button onClick={() => setOpen(null)}>Close</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

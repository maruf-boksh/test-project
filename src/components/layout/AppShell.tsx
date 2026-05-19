import { Outlet } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { TopNav } from "./TopNav";
import { Sidebar } from "./Sidebar";
import { RoleContext, type Role } from "@/lib/roles";
import { WorkflowProvider } from "@/lib/workflow-store";
import { Toaster } from "@/components/ui/sonner";

export function AppShell({ children }: { children?: ReactNode }) {
  const [role, setRole] = useState<Role>("GM/Admin");
  return (
    <RoleContext.Provider value={{ role, setRole }}>
      <WorkflowProvider>
        <div className="min-h-screen bg-background">
          <TopNav />
          <Sidebar />
          <main className="pt-14 pl-60">
            <div className="p-6">{children ?? <Outlet />}</div>
          </main>
          <Toaster richColors position="top-right" />
        </div>
      </WorkflowProvider>
    </RoleContext.Provider>
  );
}

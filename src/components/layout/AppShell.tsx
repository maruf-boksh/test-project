import { Outlet } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { TopNav } from "./TopNav";
import { Sidebar } from "./Sidebar";
import { RoleContext, type Role } from "@/lib/roles";
import { WorkflowProvider } from "@/lib/workflow-store";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const SIDEBAR_KEY = "sidebar-collapsed";

export function AppShell({ children }: { children?: ReactNode }) {
  const [role, setRole] = useState<Role>("GM/Admin");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem(SIDEBAR_KEY) === "1"; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem(SIDEBAR_KEY, sidebarCollapsed ? "1" : "0"); } catch { /* ignore */ }
  }, [sidebarCollapsed]);

  const toggleSidebar = () => setSidebarCollapsed((c) => !c);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      <WorkflowProvider>
        <div className="min-h-screen bg-background">
          <TopNav sidebarCollapsed={sidebarCollapsed} onToggleSidebar={toggleSidebar} />
          <Sidebar collapsed={sidebarCollapsed} />
          <main
            className={cn(
              "pt-14 transition-[padding] duration-200",
              sidebarCollapsed ? "pl-14" : "pl-60",
            )}
          >
            <div className="p-6">{children ?? <Outlet />}</div>
          </main>
          <Toaster richColors position="top-right" />
        </div>
      </WorkflowProvider>
    </RoleContext.Provider>
  );
}

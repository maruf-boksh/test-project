import { Link } from "@tanstack/react-router";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatbotButton } from "@/components/layout/ChatbotButton";
import { VoiceCommandButton } from "@/components/layout/VoiceCommandButton";
import { NotificationsButton } from "@/components/layout/NotificationsButton";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { UserMenu } from "@/components/layout/UserMenu";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

type TopNavProps = {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
};

export function TopNav({ sidebarCollapsed, onToggleSidebar }: TopNavProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 h-14 z-40 flex items-center px-4 gap-2 shadow-md text-white"
      style={{ backgroundColor: "#0824D9" }}
    >
      <Link
        to="/"
        aria-label="Go to Dashboard"
        title="Go to Dashboard"
        className={cn(
          "flex items-center gap-3 -ml-4 pl-4 pr-3 h-full hover:bg-white/5 transition-colors",
          sidebarCollapsed ? "w-14 justify-center pr-2" : "w-60",
        )}
      >
        <div className="flex items-center justify-center h-10 w-10 rounded-md bg-white shadow-sm shrink-0">
          <img src={logo} alt="US-Bangla Airlines" className="h-7 w-auto object-contain" />
        </div>
        {!sidebarCollapsed && (
          <div className="leading-tight">
            <div className="text-sm font-bold text-white tracking-wide">US-BANGLA</div>
            <div className="text-[10px] text-white/70 -mt-0.5 font-medium tracking-wider">
              AIRLINES · Catering ERP
            </div>
          </div>
        )}
      </Link>

      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSidebar}
        className="text-white hover:bg-white/15 hover:text-white shrink-0 ml-1"
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {sidebarCollapsed ? (
          <PanelLeftOpen className="h-4 w-4" />
        ) : (
          <PanelLeftClose className="h-4 w-4" />
        )}
      </Button>

      <GlobalSearch />

      <div className="ml-auto flex items-center gap-2 shrink-0">
        <ChatbotButton />
        <VoiceCommandButton />
        <NotificationsButton />
        <UserMenu />
      </div>
    </header>
  );
}

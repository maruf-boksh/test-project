import { useNavigate } from "@tanstack/react-router";
import {
  User as UserIcon, Settings, LogOut, ShieldCheck, KeyRound, ChevronDown,
} from "lucide-react";
import { useRole, ROLES, type Role } from "@/lib/roles";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
  DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

const FULL_NAME = "R. Hossain";
const EMAIL = "md.hossain@usbair.com";
const INITIALS = FULL_NAME.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);

export function UserMenu() {
  const { role, setRole } = useRole();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 pl-2 border-l border-white/25 cursor-pointer rounded-md py-0.5 hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          aria-label="Open user menu"
        >
          <Avatar className="h-8 w-8 ring-2 ring-white/60">
            <AvatarFallback className="bg-brand text-brand-foreground text-xs font-semibold">
              {INITIALS}
            </AvatarFallback>
          </Avatar>
          <div className="leading-tight hidden md:block text-left">
            <div className="text-xs font-medium text-white">{FULL_NAME}</div>
            <div className="text-[10px] text-white/70">{role}</div>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-white/70 hidden md:block" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="leading-tight">
            <div className="text-sm font-semibold">{FULL_NAME}</div>
            <div className="text-[11px] text-muted-foreground font-normal">{EMAIL}</div>
            <div className="mt-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider rounded bg-primary/10 text-primary px-1.5 py-0.5">
              <ShieldCheck className="h-3 w-3" /> {role}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => toast.info("Profile view — coming soon.")}>
          <UserIcon className="h-4 w-4 mr-2" /> My Profile
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => navigate({ to: "/config-company" })}>
          <Settings className="h-4 w-4 mr-2" /> Preferences & Settings
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => toast.info("Change password — coming soon.")}>
          <KeyRound className="h-4 w-4 mr-2" /> Change Password
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <ShieldCheck className="h-4 w-4 mr-2" /> Switch Role
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="w-56">
              <DropdownMenuLabel>Available Roles</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ROLES.map((r) => (
                <DropdownMenuItem
                  key={r}
                  onClick={() => {
                    setRole(r as Role);
                    toast.success(`Switched to ${r}.`);
                  }}
                >
                  {r === role && "✓ "}{r}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => toast.success("Signed out — demo mode (no auth wired).")}
        >
          <LogOut className="h-4 w-4 mr-2" /> Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

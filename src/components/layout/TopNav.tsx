import { Bell, Search, ChevronDown } from "lucide-react";
import { useRole, ROLES, type Role } from "@/lib/roles";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/logo.png";

export function TopNav() {
  const { role, setRole } = useRole();

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-navy text-navy-foreground z-40 flex items-center px-4 gap-4 shadow-md">
      <div className="flex items-center gap-3 w-60 -ml-4 pl-4 pr-3 h-full">
        <div className="flex items-center justify-center h-10 w-10 rounded-md bg-white shadow-sm shrink-0">
          <img src={logo} alt="US-Bangla Airlines" className="h-7 w-auto object-contain" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold text-white tracking-wide">US-BANGLA</div>
          <div className="text-[10px] text-white/70 -mt-0.5">Catering ERP</div>
        </div>
      </div>

      <div className="flex-1 max-w-xl relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
        <Input
          placeholder="Search flights, meals, POs, vendors..."
          className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-white/30"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white gap-2 h-9">
              <Badge variant="secondary" className="bg-brand text-brand-foreground hover:bg-brand">{role}</Badge>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Switch User Role</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {ROLES.map((r) => (
              <DropdownMenuItem key={r} onClick={() => setRole(r as Role)}>
                {r === role && "✓ "}{r}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand" />
        </Button>

        <div className="flex items-center gap-2 pl-2 border-l border-white/10">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-brand text-brand-foreground text-xs">RH</AvatarFallback>
          </Avatar>
          <div className="leading-tight hidden md:block">
            <div className="text-xs font-medium">R. Hossain</div>
            <div className="text-[10px] text-white/70">{role}</div>
          </div>
        </div>
      </div>
    </header>
  );
}

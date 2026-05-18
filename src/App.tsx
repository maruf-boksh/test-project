import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BellIcon,
  FileTextIcon,
  LayoutGridIcon,
  SearchIcon,
  type LucideIcon,
} from "lucide-react"
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
} from "react-router-dom"

type NavItem = {
  to: string
  label: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { to: "/", label: "Overview", icon: LayoutGridIcon },
  { to: "/reports", label: "Reports", icon: FileTextIcon },
]

function usePageTitle() {
  const location = useLocation()

  if (location.pathname === "/reports") {
    return "Reports"
  }

  return "Overview"
}

function SidebarNavItem({ to, label, icon: Icon }: NavItem) {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={label}>
        <Link to={to}>
          <Icon />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function AppSidebar() {
  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 rounded-md px-2 pt-1">
            <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <LayoutGridIcon className="size-4" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold">Shadcn Lab</span>
              <span className="truncate text-xs text-muted-foreground">
                Simple dashboard
              </span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarNavItem key={item.to} {...item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarRail />
    </>
  )
}

function AppHeader() {
  const pageTitle = usePageTitle()

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background px-4 md:px-6">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <SearchIcon className="pointer-events-none absolute top-2.5 left-2 size-4 text-muted-foreground" />
          <Input className="h-9 w-56 pl-8" placeholder="Search" />
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Notifications">
          <BellIcon />
        </Button>
        <Avatar size="sm">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}

function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Monthly revenue</CardDescription>
            <CardTitle>$42,300</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              +12.4% from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Active subscriptions</CardDescription>
            <CardTitle>1,248</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              86 renewals today
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Open tickets</CardDescription>
            <CardTitle>27</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">8 need review</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Project velocity</CardDescription>
            <CardTitle>74%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Stable over 7 days
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Latest updates from the team</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Onboarding revamp</TableCell>
                  <TableCell>
                    <Badge variant="secondary">In review</Badge>
                  </TableCell>
                  <TableCell>Avery</TableCell>
                  <TableCell>2 hours ago</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Mobile analytics</TableCell>
                  <TableCell>
                    <Badge variant="outline">Draft</Badge>
                  </TableCell>
                  <TableCell>Jordan</TableCell>
                  <TableCell>Yesterday</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Pricing refresh</TableCell>
                  <TableCell>
                    <Badge>Scheduled</Badge>
                  </TableCell>
                  <TableCell>Sam</TableCell>
                  <TableCell>2 days ago</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Support portal</TableCell>
                  <TableCell>
                    <Badge variant="secondary">In progress</Badge>
                  </TableCell>
                  <TableCell>Lee</TableCell>
                  <TableCell>4 days ago</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today</CardTitle>
            <CardDescription>Focus for the next 24 hours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-background p-3">
              <div className="text-sm font-medium">Sprint sync</div>
              <div className="text-xs text-muted-foreground">
                10:00 AM - Align priorities
              </div>
            </div>
            <div className="rounded-lg border bg-background p-3">
              <div className="text-sm font-medium">Customer check-in</div>
              <div className="text-xs text-muted-foreground">
                1:30 PM - Enterprise plan
              </div>
            </div>
            <div className="rounded-lg border bg-background p-3">
              <div className="text-sm font-medium">Release prep</div>
              <div className="text-xs text-muted-foreground">
                4:00 PM - QA handoff
              </div>
            </div>
            <Button className="w-full" variant="outline">
              View schedule
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ReportsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Reports overview</CardTitle>
          <CardDescription>Key metrics tracked this quarter</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next run</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Revenue summary</TableCell>
                <TableCell>Finance</TableCell>
                <TableCell>
                  <Badge>Active</Badge>
                </TableCell>
                <TableCell>Tomorrow</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Retention pulse</TableCell>
                <TableCell>Growth</TableCell>
                <TableCell>
                  <Badge variant="secondary">Draft</Badge>
                </TableCell>
                <TableCell>Friday</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Support trends</TableCell>
                <TableCell>Operations</TableCell>
                <TableCell>
                  <Badge variant="outline">Paused</Badge>
                </TableCell>
                <TableCell>Next week</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
          <CardDescription>Common report tasks</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline">Create new report</Button>
          <Button variant="outline">Schedule export</Button>
          <Button variant="outline">Manage access</Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Routes>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </BrowserRouter>
  )
}

export default App

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function DashboardPage() {
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

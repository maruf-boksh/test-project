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
            <CardDescription>Upcoming events</CardDescription>
            <CardTitle>12</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">5 this week</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Meals in prep</CardDescription>
            <CardTitle>2,480</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              740 for tomorrow
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Staff scheduled</CardDescription>
            <CardTitle>38</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">6 temps added</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>On-time delivery</CardDescription>
            <CardTitle>96%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">Last 30 days</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Next events</CardTitle>
            <CardDescription>Upcoming catering jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Menu</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Riverwalk gala</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Tuscan buffet</Badge>
                  </TableCell>
                  <TableCell>220</TableCell>
                  <TableCell>May 22</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Sunset vineyard</TableCell>
                  <TableCell>
                    <Badge variant="outline">Seasonal plates</Badge>
                  </TableCell>
                  <TableCell>140</TableCell>
                  <TableCell>May 23</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>North loop offices</TableCell>
                  <TableCell>
                    <Badge>Lunch boxes</Badge>
                  </TableCell>
                  <TableCell>95</TableCell>
                  <TableCell>May 24</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Harbor wedding</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Coastal dinner</Badge>
                  </TableCell>
                  <TableCell>180</TableCell>
                  <TableCell>May 25</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today prep</CardTitle>
            <CardDescription>Kitchen and logistics focus</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-background p-3">
              <div className="text-sm font-medium">Roast chicken</div>
              <div className="text-xs text-muted-foreground">
                320 portions for riverwalk gala
              </div>
            </div>
            <div className="rounded-lg border bg-background p-3">
              <div className="text-sm font-medium">Vegan meal boxes</div>
              <div className="text-xs text-muted-foreground">
                Pack 85 with seasonal salads
              </div>
            </div>
            <div className="rounded-lg border bg-background p-3">
              <div className="text-sm font-medium">Dispatch vans</div>
              <div className="text-xs text-muted-foreground">
                Load by 2:30 PM
              </div>
            </div>
            <Button className="w-full" variant="outline">
              View prep list
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

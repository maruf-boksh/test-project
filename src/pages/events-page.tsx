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

export function EventsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Events pipeline</CardTitle>
          <CardDescription>
            Bookings needing attention this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deposit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Lakeside wedding</TableCell>
                <TableCell>Brooks & Co.</TableCell>
                <TableCell>
                  <Badge>Confirmed</Badge>
                </TableCell>
                <TableCell>Paid</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Tech offsite lunch</TableCell>
                <TableCell>Vertex Labs</TableCell>
                <TableCell>
                  <Badge variant="secondary">Proposal</Badge>
                </TableCell>
                <TableCell>May 24</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Charity brunch</TableCell>
                <TableCell>Bright Steps</TableCell>
                <TableCell>
                  <Badge variant="outline">Awaiting deposit</Badge>
                </TableCell>
                <TableCell>May 28</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event actions</CardTitle>
          <CardDescription>Common booking tasks</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline">Create event</Button>
          <Button variant="outline">Send tasting menu</Button>
          <Button variant="outline">Collect deposit</Button>
        </CardContent>
      </Card>
    </div>
  )
}

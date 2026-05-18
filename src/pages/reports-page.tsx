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

export function ReportsPage() {
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

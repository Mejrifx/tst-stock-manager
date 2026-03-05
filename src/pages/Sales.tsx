import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";

export default function Sales() {
  const { sales } = useStore();

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      PENDING: { label: "Pending", className: "bg-warning/15 text-warning border-warning/30" },
      SHIPPED: { label: "Shipped", className: "bg-info/15 text-info border-info/30" },
      DELIVERED: { label: "Delivered", className: "bg-success/15 text-success border-success/30" },
      CANCELLED: { label: "Cancelled", className: "bg-destructive/15 text-destructive border-destructive/30" },
    };
    const c = config[status] || config.PENDING;
    return (
      <Badge variant="outline" className={c.className}>
        {c.label}
      </Badge>
    );
  };

  const totalSales = sales.reduce((sum, sale) => sum + sale.quantity, 0);
  const recentSales = sales.filter(
    (s) => new Date(s.saleDate).getTime() > Date.now() - 7 * 86400000
  );
  const recentSalesCount = recentSales.reduce((sum, sale) => sum + sale.quantity, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Sales</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {sales.length} orders · {totalSales} units sold
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSales}</div>
            <p className="text-xs text-muted-foreground mt-1">units sold</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last 7 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{recentSalesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">units sold</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{sales.length}</div>
            <p className="text-xs text-muted-foreground mt-1">eBay orders</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs font-mono">Order ID</TableHead>
                  <TableHead className="text-xs font-mono">SKU</TableHead>
                  <TableHead className="text-xs text-right">Qty</TableHead>
                  <TableHead className="text-xs">Buyer</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No sales recorded yet
                    </TableCell>
                  </TableRow>
                ) : (
                  sales.map((sale) => (
                    <TableRow key={sale.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-xs">{sale.orderId}</TableCell>
                      <TableCell className="font-mono text-xs">{sale.sku}</TableCell>
                      <TableCell className="text-right font-semibold">{sale.quantity}</TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">
                        {sale.buyer}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div>{format(new Date(sale.saleDate), "dd MMM yyyy HH:mm")}</div>
                        <div className="text-[10px]">
                          {formatDistanceToNow(new Date(sale.saleDate), { addSuffix: true })}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(sale.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

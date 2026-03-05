import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Tag, ShoppingCart, RefreshCw, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { skus, activities, syncStatus, sales } = useStore();

  const totalStock = skus.reduce((sum, sku) => sum + sku.totalStock, 0);
  const listedOnEbay = skus.reduce((sum, sku) => sum + sku.ebayListedQuantity, 0);
  
  const today = new Date().toDateString();
  const soldToday = sales.filter(
    (s) => new Date(s.saleDate).toDateString() === today
  ).reduce((sum, sale) => sum + sale.quantity, 0);

  const lowStockSkus = skus.filter((s) => s.availableStock < 5 && s.ebayListingId);

  const stats = [
    { label: "Total Stock", value: totalStock, icon: Package, color: "text-primary" },
    { label: "Listed on eBay", value: listedOnEbay, icon: Tag, color: "text-info" },
    { label: "Sold Today", value: soldToday, icon: ShoppingCart, color: "text-success" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Overview of inventory and listing status
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {s.label}
              </CardTitle>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sync Status
            </CardTitle>
            <RefreshCw className={`h-4 w-4 text-primary ${syncStatus.status === "running" ? "animate-spin" : ""}`} />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold capitalize">{syncStatus.status}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last: {formatDistanceToNow(new Date(syncStatus.lastRun), { addSuffix: true })}
            </p>
          </CardContent>
        </Card>
      </div>

      {lowStockSkus.length > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <CardTitle className="text-base text-warning">Low Stock Alert</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockSkus.slice(0, 5).map((sku) => (
                <div key={sku.id} className="flex items-center justify-between text-sm">
                  <span className="font-mono">{sku.sku}</span>
                  <span className="text-warning font-semibold">{sku.availableStock} units left</span>
                </div>
              ))}
              {lowStockSkus.length > 5 && (
                <p className="text-xs text-muted-foreground mt-2">
                  +{lowStockSkus.length - 5} more SKUs low on stock
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activities.slice(0, 8).map((a) => (
              <div key={a.id} className="flex items-start gap-3 text-sm border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <div className="shrink-0 pt-0.5">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono ${
                    a.type === "EBAY_SALE_DETECTED" ? "bg-success/15 text-success" :
                    a.type === "QUANTITY_REPLENISHED" ? "bg-info/15 text-info" :
                    a.type === "STOCK_ADJUSTED" ? "bg-primary/15 text-primary" :
                    a.type === "SYNC_SUCCESS" ? "bg-success/15 text-success" :
                    a.type === "SYNC_ERROR" ? "bg-destructive/15 text-destructive" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {a.type.replace(/_/g, " ")}
                  </span>
                </div>
                <span className="flex-1 text-foreground/80">{a.message}</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(a.ts), { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

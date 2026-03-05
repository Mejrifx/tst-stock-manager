import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Tag, ShoppingCart, RefreshCw } from "lucide-react";
import { ActivityBadge } from "@/components/StatusBadge";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { items, activities, syncStatus } = useStore();

  const inStock = items.filter((i) => i.status === "IN_STOCK").length;
  const listed = items.filter((i) => i.status === "LISTED").length;
  const today = new Date().toDateString();
  const soldToday = items.filter(
    (i) => i.status === "SOLD" && new Date(i.createdAt).toDateString() === today
  ).length;

  const stats = [
    { label: "In Stock", value: inStock, icon: Package, color: "text-success" },
    { label: "Listed on eBay", value: listed, icon: Tag, color: "text-info" },
    { label: "Sold Today", value: soldToday, icon: ShoppingCart, color: "text-warning" },
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activities.slice(0, 8).map((a) => (
              <div key={a.id} className="flex items-start gap-3 text-sm">
                <ActivityBadge type={a.type} />
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

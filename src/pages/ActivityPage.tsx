import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";
import type { Activity } from "@/lib/supabase";

type ActivityType = Activity['type'];

const activityConfig: Record<ActivityType, { className: string }> = {
  EBAY_SALE_DETECTED: { className: "bg-success/15 text-success border-success/30" },
  QUANTITY_REPLENISHED: { className: "bg-info/15 text-info border-info/30" },
  STOCK_ADJUSTED: { className: "bg-primary/15 text-primary border-primary/30" },
  LISTING_CREATED: { className: "bg-success/15 text-success border-success/30" },
  LISTING_ENDED: { className: "bg-muted text-muted-foreground border-border" },
  SYNC_SUCCESS: { className: "bg-success/15 text-success border-success/30" },
  SYNC_ERROR: { className: "bg-destructive/15 text-destructive border-destructive/30" },
  STATUS_CHANGE: { className: "bg-primary/15 text-primary border-primary/30" },
  ERROR: { className: "bg-destructive/15 text-destructive border-destructive/30" },
};

function ActivityBadge({ type }: { type: ActivityType }) {
  const config = activityConfig[type];
  return (
    <Badge variant="outline" className={config.className}>
      {type.replace(/_/g, " ")}
    </Badge>
  );
}

export default function ActivityPage() {
  const { activities } = useStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Activity Log</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {activities.length} events recorded
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-4 border-b border-border/50 pb-3 last:border-0 last:pb-0"
              >
                <div className="shrink-0 pt-0.5">
                  <ActivityBadge type={a.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{a.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(a.created_at), "dd MMM yyyy HH:mm")} ·{" "}
                    {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                  </p>
                </div>
                <span className="font-mono text-xs text-muted-foreground shrink-0">
                  {a.id}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

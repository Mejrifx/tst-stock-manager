import { useStore } from "@/store/useStore";
import { ActivityBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow, format } from "date-fns";

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
                    {format(new Date(a.ts), "dd MMM yyyy HH:mm")} ·{" "}
                    {formatDistanceToNow(new Date(a.ts), { addSuffix: true })}
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

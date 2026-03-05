import { Badge } from "@/components/ui/badge";
import { ItemStatus, ActivityType } from "@/data/mock";
import { cn } from "@/lib/utils";

const statusConfig: Record<ItemStatus, { label: string; className: string }> = {
  IN_STOCK: { label: "In Stock", className: "bg-success/15 text-success border-success/30" },
  LISTED: { label: "Listed", className: "bg-info/15 text-info border-info/30" },
  SOLD: { label: "Sold", className: "bg-warning/15 text-warning border-warning/30" },
  DAMAGED: { label: "Damaged", className: "bg-destructive/15 text-destructive border-destructive/30" },
  RETURNED: { label: "Returned", className: "bg-muted text-muted-foreground border-border" },
};

export function StatusBadge({ status }: { status: ItemStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={cn("font-mono text-xs", config.className)}>
      {config.label}
    </Badge>
  );
}

const activityConfig: Record<ActivityType, { className: string }> = {
  ORDER_DETECTED: { className: "bg-warning/15 text-warning border-warning/30" },
  LISTING_CREATED: { className: "bg-success/15 text-success border-success/30" },
  LISTING_ENDED: { className: "bg-muted text-muted-foreground border-border" },
  STOCK_ADDED: { className: "bg-info/15 text-info border-info/30" },
  STATUS_CHANGE: { className: "bg-primary/15 text-primary border-primary/30" },
  SYNC_RUN: { className: "bg-success/15 text-success border-success/30" },
  ERROR: { className: "bg-destructive/15 text-destructive border-destructive/30" },
};

export function ActivityBadge({ type }: { type: ActivityType }) {
  const config = activityConfig[type];
  return (
    <Badge variant="outline" className={cn("font-mono text-xs", config.className)}>
      {type.replace(/_/g, " ")}
    </Badge>
  );
}

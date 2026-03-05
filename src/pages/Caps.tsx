import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

export default function Caps() {
  const { items, groupRules, updateCapRule, listNextItems } = useStore();

  const getGroupStats = (groupKey: string) => {
    const groupItems = items.filter((i) => i.groupKey === groupKey);
    const inStock = groupItems.filter((i) => i.status === "IN_STOCK").length;
    const listed = groupItems.filter((i) => i.status === "LISTED").length;
    const sold = groupItems.filter((i) => i.status === "SOLD").length;
    return { inStock, listed, sold, total: groupItems.length };
  };

  const handleListNext = (groupKey: string, label: string) => {
    listNextItems(groupKey);
    toast.success(`Listed items to fill cap for ${label}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Listing Caps</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Control how many items are listed per group
        </p>
      </div>

      <div className="grid gap-4">
        {groupRules.map((rule) => {
          const stats = getGroupStats(rule.groupKey);
          const needed = Math.max(0, rule.capLiveListings - stats.listed);
          const canList = Math.min(needed, stats.inStock);

          return (
            <Card key={rule.groupKey}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{rule.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex gap-3 flex-wrap text-sm">
                    <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                      {stats.inStock} in stock
                    </Badge>
                    <Badge variant="outline" className="bg-info/10 text-info border-info/30">
                      {stats.listed} listed
                    </Badge>
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                      {stats.sold} sold
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 sm:ml-auto">
                    <span className="text-sm text-muted-foreground">Cap:</span>
                    <Input
                      type="number"
                      min={0}
                      max={50}
                      value={rule.capLiveListings}
                      onChange={(e) => updateCapRule(rule.groupKey, parseInt(e.target.value) || 0)}
                      className="w-20 h-8 font-mono text-center"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    {needed > 0 ? (
                      <>
                        <span className="text-sm text-muted-foreground">
                          Need <strong className="text-foreground">{needed}</strong> more
                          {canList < needed && (
                            <span className="text-destructive"> (only {canList} available)</span>
                          )}
                        </span>
                        {canList > 0 && (
                          <Button
                            size="sm"
                            onClick={() => handleListNext(rule.groupKey, rule.label)}
                            className="gap-1"
                          >
                            List {canList} <ArrowRight className="h-3 w-3" />
                          </Button>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-success">✓ Cap reached</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowRight, ExternalLink } from "lucide-react";

export default function Caps() {
  const { skus, replenishEbayListing } = useStore();

  const handleReplenish = (skuId: string, skuCode: string) => {
    replenishEbayListing(skuId);
    toast.success(`Replenished eBay listing for ${skuCode}`);
  };

  const listedSkus = skus.filter((s) => s.ebayListingId);
  const unlistedSkus = skus.filter((s) => !s.ebayListingId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">eBay Listings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage eBay listing quantities and caps
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Active Listings ({listedSkus.length})</h2>
        
        {listedSkus.map((sku) => {
          const needed = Math.max(0, sku.capQuantity - sku.ebayListedQuantity);
          const canList = Math.min(needed, sku.availableStock);
          const isAtCap = sku.ebayListedQuantity >= sku.capQuantity;

          return (
            <Card key={sku.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-sm font-medium">{sku.title}</CardTitle>
                    <p className="text-xs text-muted-foreground font-mono mt-1">{sku.sku}</p>
                  </div>
                  {sku.ebayListingId && (
                    <Button variant="ghost" size="sm" className="h-7 gap-1" asChild>
                      <a href={`https://www.ebay.co.uk/itm/${sku.ebayListingId}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                        View
                      </a>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex gap-3 flex-wrap text-sm">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                      {sku.totalStock} total stock
                    </Badge>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                      {sku.availableStock} available
                    </Badge>
                    <Badge variant="outline" className="bg-info/10 text-info border-info/30">
                      {sku.ebayListedQuantity} listed
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 sm:ml-auto">
                    <span className="text-sm text-muted-foreground">Cap:</span>
                    <span className="text-lg font-semibold font-mono">{sku.capQuantity}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {!isAtCap ? (
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
                            onClick={() => handleReplenish(sku.id, sku.sku)}
                            className="gap-1"
                          >
                            List {canList} <ArrowRight className="h-3 w-3" />
                          </Button>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-success font-medium">✓ At cap</span>
                    )}
                  </div>
                </div>

                {sku.availableStock === 0 && !isAtCap && (
                  <div className="mt-3 p-2 bg-destructive/10 border border-destructive/30 rounded text-xs text-destructive">
                    <strong>Warning:</strong> No stock available to replenish this listing
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {listedSkus.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No active eBay listings. Create listings manually on eBay first.
            </CardContent>
          </Card>
        )}
      </div>

      {unlistedSkus.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Not Listed on eBay ({unlistedSkus.length})</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                {unlistedSkus.slice(0, 10).map((sku) => (
                  <div key={sku.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{sku.title}</p>
                      <p className="text-xs text-muted-foreground font-mono">{sku.sku}</p>
                    </div>
                    <Badge variant="outline" className="bg-muted text-muted-foreground">
                      {sku.totalStock} in stock
                    </Badge>
                  </div>
                ))}
                {unlistedSkus.length > 10 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    +{unlistedSkus.length - 10} more SKUs not listed
                  </p>
                )}
              </div>
              <div className="mt-4 p-3 bg-muted/50 rounded text-sm text-muted-foreground">
                <strong>Note:</strong> Create listings manually on eBay. The system will detect them and manage quantities automatically.
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

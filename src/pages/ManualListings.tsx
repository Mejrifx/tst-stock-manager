import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Search, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BulkImport } from "@/components/BulkImport";

export default function ManualListings() {
  const { skus } = useStore();
  const [search, setSearch] = useState("");

  // Filter for traditional listings (imported manually, not created via admin)
  // We can identify these by checking if they were created recently or have a flag
  // For now, all imported listings are considered "manual"
  const manualListings = skus.filter(sku => sku.ebay_listing_id);

  const filteredListings = manualListings.filter((sku) =>
    sku.sku.toLowerCase().includes(search.toLowerCase()) ||
    sku.title.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (date?: string) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manual Listings</h1>
        <p className="text-muted-foreground mt-2">
          Traditional eBay listings (imported for tracking)
        </p>
      </div>

      <BulkImport />

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>About Manual Listings:</strong> These are your existing eBay listings that were imported for tracking.
          The system will detect sales automatically, but you'll need to manually update quantities on eBay when replenishing.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Manual Listings ({filteredListings.length})</CardTitle>
              <CardDescription>
                Sales tracking enabled • Manual eBay quantity updates
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by SKU or title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {filteredListings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No manual listings found.</p>
                <p className="text-sm mt-2">
                  Go to Settings → Bulk Import to add your existing eBay listings.
                </p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr className="text-left text-sm">
                      <th className="p-3 font-medium">SKU</th>
                      <th className="p-3 font-medium">Title</th>
                      <th className="p-3 font-medium text-center">Total Stock</th>
                      <th className="p-3 font-medium text-center">Listed Qty</th>
                      <th className="p-3 font-medium text-center">Available</th>
                      <th className="p-3 font-medium">Price</th>
                      <th className="p-3 font-medium">Last Synced</th>
                      <th className="p-3 font-medium">eBay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredListings.map((sku) => (
                      <tr key={sku.id} className="hover:bg-muted/50 transition-colors">
                        <td className="p-3">
                          <code className="text-xs bg-muted px-2 py-1 rounded">{sku.sku}</code>
                        </td>
                        <td className="p-3 max-w-xs truncate">{sku.title}</td>
                        <td className="p-3 text-center font-medium">{sku.total_stock}</td>
                        <td className="p-3 text-center">
                          <Badge variant="outline">{sku.ebay_listed_quantity}</Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Badge 
                            variant={sku.available_stock < 3 ? "destructive" : "default"}
                          >
                            {sku.available_stock}
                          </Badge>
                        </td>
                        <td className="p-3">${sku.price?.toFixed(2) || "0.00"}</td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {formatDate(sku.last_synced_at)}
                        </td>
                        <td className="p-3">
                          {sku.ebay_listing_id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a
                                href={`https://www.ebay.com/itm/${sku.ebay_listing_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                View
                              </a>
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Alert variant="default" className="bg-blue-500/10 border-blue-500/30">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-600">
          <strong>💡 Tip:</strong> When you make a sale on eBay, the system will detect it and update the admin panel automatically.
          However, you'll need to manually log into eBay to update the listing quantity back to 3.
        </AlertDescription>
      </Alert>
    </div>
  );
}

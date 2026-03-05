import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Search, AlertCircle, Zap } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreateListing } from "@/components/CreateListing";

export default function AutomaticListings() {
  const { skus } = useStore();
  const [search, setSearch] = useState("");

  // For now, we'll show all listings here
  // Later we can add a flag to distinguish between manual and automatic
  // Automatic listings = created via admin panel (Inventory API)
  const automaticListings = skus.filter(sku => {
    // Add logic here to identify Inventory API listings
    // For now, show empty state to encourage creating via admin panel
    return false;
  });

  const filteredListings = automaticListings.filter((sku) =>
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
        <h1 className="text-3xl font-bold">Automatic Listings</h1>
        <p className="text-muted-foreground mt-2">
          Listings created via admin panel (full automation)
        </p>
      </div>

      <CreateListing />

      <Alert className="bg-green-500/10 border-green-500/30">
        <Zap className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-600">
          <strong>✨ Full Automation:</strong> Listings created here have automatic quantity sync and replenishment.
          When someone buys, the system automatically updates eBay quantities back to 3.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Automatic Listings ({filteredListings.length})</CardTitle>
              <CardDescription>
                Auto-replenishment enabled • Full eBay sync
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
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <p className="text-lg font-medium mb-2">No automatic listings yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first automated listing to see it here.
                </p>
                <Button asChild>
                  <a href="/settings">Go to Settings → Create eBay Listing</a>
                </Button>
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
                      <th className="p-3 font-medium">Status</th>
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
                        <td className="p-3">
                          <Badge variant="default" className="bg-green-500">
                            <Zap className="h-3 w-3 mr-1" />
                            Auto
                          </Badge>
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
    </div>
  );
}

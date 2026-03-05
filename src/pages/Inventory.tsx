import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, Plus, Minus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Inventory() {
  const { skus, addStock, removeStock, replenishEbayListing } = useStore();
  const [search, setSearch] = useState("");
  const [modelFilter, setModelFilter] = useState<string>("ALL");
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedSkuId, setSelectedSkuId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [removeReason, setRemoveReason] = useState<string>("");

  const models = [...new Set(skus.map((s) => s.model))];

  const filtered = skus.filter((sku) => {
    if (modelFilter !== "ALL" && sku.model !== modelFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        sku.sku.toLowerCase().includes(q) ||
        sku.title.toLowerCase().includes(q) ||
        sku.model.toLowerCase().includes(q) ||
        sku.colour.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAddStock = () => {
    if (selectedSkuId && quantity > 0) {
      addStock(selectedSkuId, quantity);
      toast.success(`Added ${quantity} units to stock`);
      setAddDialogOpen(false);
      setQuantity(1);
    }
  };

  const handleRemoveStock = () => {
    if (selectedSkuId && quantity > 0) {
      removeStock(selectedSkuId, quantity, removeReason || "Manual adjustment");
      toast.success(`Removed ${quantity} units from stock`);
      setRemoveDialogOpen(false);
      setQuantity(1);
      setRemoveReason("");
    }
  };

  const handleReplenish = (skuId: string, skuCode: string) => {
    replenishEbayListing(skuId);
    toast.success(`Replenished eBay listing for ${skuCode}`);
  };

  const getStockBadge = (availableStock: number) => {
    if (availableStock >= 10) {
      return <Badge variant="outline" className="bg-success/15 text-success border-success/30">Good Stock</Badge>;
    } else if (availableStock >= 5) {
      return <Badge variant="outline" className="bg-warning/15 text-warning border-warning/30">Low Stock</Badge>;
    } else {
      return <Badge variant="outline" className="bg-destructive/15 text-destructive border-destructive/30">Very Low</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Inventory</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {skus.length} SKUs · {filtered.length} shown
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search SKU, model, colour..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={modelFilter} onValueChange={setModelFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Models" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Models</SelectItem>
            {models.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-mono text-xs">SKU</TableHead>
              <TableHead className="text-xs">Title</TableHead>
              <TableHead className="text-xs text-right">Total Stock</TableHead>
              <TableHead className="text-xs text-right">Listed Qty</TableHead>
              <TableHead className="text-xs text-right">Available</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs font-mono">eBay ID</TableHead>
              <TableHead className="text-xs text-right">Price</TableHead>
              <TableHead className="text-xs">Last Synced</TableHead>
              <TableHead className="text-xs w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No SKUs match your filters
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((sku) => (
                <TableRow key={sku.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-xs">{sku.sku}</TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">{sku.title}</TableCell>
                  <TableCell className="text-right font-semibold">{sku.totalStock}</TableCell>
                  <TableCell className="text-right">
                    <span className={sku.ebayListedQuantity > 0 ? "text-info font-semibold" : "text-muted-foreground"}>
                      {sku.ebayListedQuantity}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{sku.availableStock}</TableCell>
                  <TableCell>{getStockBadge(sku.availableStock)}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {sku.ebayListingId ? sku.ebayListingId.substring(0, 12) + "..." : "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">£{sku.price}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {sku.lastSyncedAt ? format(new Date(sku.lastSyncedAt), "dd MMM HH:mm") : "Never"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedSkuId(sku.id);
                          setAddDialogOpen(true);
                        }}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Stock
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedSkuId(sku.id);
                          setRemoveDialogOpen(true);
                        }}>
                          <Minus className="h-4 w-4 mr-2" />
                          Remove Stock
                        </DropdownMenuItem>
                        {sku.ebayListingId && sku.ebayListedQuantity < sku.capQuantity && (
                          <DropdownMenuItem onClick={() => handleReplenish(sku.id, sku.sku)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Replenish to Cap
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Stock</DialogTitle>
            <DialogDescription>
              Add units to inventory for {skus.find((s) => s.id === selectedSkuId)?.sku}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-quantity">Quantity</Label>
              <Input
                id="add-quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddStock}>Add Stock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Stock</DialogTitle>
            <DialogDescription>
              Remove units from inventory for {skus.find((s) => s.id === selectedSkuId)?.sku}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="remove-quantity">Quantity</Label>
              <Input
                id="remove-quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Input
                id="reason"
                placeholder="e.g., Damaged, Returned, etc."
                value={removeReason}
                onChange={(e) => setRemoveReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRemoveStock}>Remove Stock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

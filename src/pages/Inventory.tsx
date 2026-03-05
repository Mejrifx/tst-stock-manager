import { useState } from "react";
import { useStore } from "@/store/useStore";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search } from "lucide-react";
import { ItemStatus } from "@/data/mock";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Inventory() {
  const { items, updateItemStatus } = useStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [groupFilter, setGroupFilter] = useState<string>("ALL");

  const groups = [...new Set(items.map((i) => i.groupKey))];

  const filtered = items.filter((i) => {
    if (statusFilter !== "ALL" && i.status !== statusFilter) return false;
    if (groupFilter !== "ALL" && i.groupKey !== groupFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        i.sku.toLowerCase().includes(q) ||
        i.title.toLowerCase().includes(q) ||
        i.model.toLowerCase().includes(q) ||
        i.colour.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAction = (id: string, status: ItemStatus, label: string) => {
    updateItemStatus(id, status);
    toast.success(`Item ${label}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Inventory</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {items.length} items · {filtered.length} shown
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="IN_STOCK">In Stock</SelectItem>
            <SelectItem value="LISTED">Listed</SelectItem>
            <SelectItem value="SOLD">Sold</SelectItem>
            <SelectItem value="DAMAGED">Damaged</SelectItem>
            <SelectItem value="RETURNED">Returned</SelectItem>
          </SelectContent>
        </Select>
        <Select value={groupFilter} onValueChange={setGroupFilter}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Groups</SelectItem>
            {groups.map((g) => (
              <SelectItem key={g} value={g}>
                {g.split("|").join(" / ")}
              </SelectItem>
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
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs font-mono">eBay ID</TableHead>
              <TableHead className="text-xs text-right">Price</TableHead>
              <TableHead className="text-xs">Created</TableHead>
              <TableHead className="text-xs w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No items match your filters
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                  <TableCell className="text-sm max-w-[250px] truncate">{item.title}</TableCell>
                  <TableCell><StatusBadge status={item.status} /></TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {item.ebayItemId ?? "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">£{item.price}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(item.createdAt), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {item.status === "IN_STOCK" && (
                          <DropdownMenuItem onClick={() => handleAction(item.id, "LISTED", "listed on eBay")}>
                            List on eBay
                          </DropdownMenuItem>
                        )}
                        {item.status === "LISTED" && (
                          <DropdownMenuItem onClick={() => handleAction(item.id, "IN_STOCK", "unlisted from eBay")}>
                            Unlist from eBay
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleAction(item.id, "DAMAGED", "marked as damaged")}>
                          Mark Damaged
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction(item.id, "RETURNED", "marked as returned")}>
                          Mark Returned
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

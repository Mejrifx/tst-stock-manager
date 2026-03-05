import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import * as api from '@/lib/supabase-api';
import { useStore } from '@/store/useStore';
import { createInventoryItemWithOffer, type CreateInventoryRequest, type CreateOfferRequest } from '@/lib/ebay/inventory';

export function CreateListing() {
  const [creating, setCreating] = useState(false);
  const { loadData } = useStore();

  // Form state
  const [sku, setSku] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('3000'); // NEW
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('3');
  const [category, setCategory] = useState('9355'); // Cell Phones & Smartphones

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      // Validate
      if (!sku || !title || !price) {
        toast.error('Please fill in SKU, Title, and Price');
        return;
      }

      const priceNum = parseFloat(price);
      const qtyNum = parseInt(quantity) || 3;

      if (isNaN(priceNum) || priceNum <= 0) {
        toast.error('Invalid price');
        return;
      }

      console.log('Creating eBay listing:', { sku, title, price: priceNum, quantity: qtyNum });

      // Create inventory item + offer on eBay
      const listingId = await createInventoryItemWithOffer(
        {
          sku,
          product: {
            title,
            description: description || title,
            aspects: {
              Brand: ['Apple'], // You can make this dynamic later
            },
            imageUrls: [], // Add image support later
          },
          condition,
          availability: {
            shipToLocationAvailability: {
              quantity: qtyNum,
            },
          },
        },
        {
          sku,
          marketplaceId: 'EBAY_US',
          format: 'FIXED_PRICE',
          availableQuantity: qtyNum,
          categoryId: category,
          listingPolicies: {
            paymentPolicyId: 'YOUR_PAYMENT_POLICY_ID', // User needs to set this
            returnPolicyId: 'YOUR_RETURN_POLICY_ID',   // User needs to set this
            fulfillmentPolicyId: 'YOUR_FULFILLMENT_POLICY_ID', // User needs to set this
          },
          pricingSummary: {
            price: {
              value: priceNum.toFixed(2),
              currency: 'USD',
            },
          },
        }
      );

      console.log('✅ eBay listing created:', listingId);

      // Parse SKU parts (e.g., IPHONE12-A-128-BLK)
      const parts = sku.split('-');
      const model = parts[0] || 'Unknown';
      const grade = parts[1] || 'A';
      const storage = parts[2] || '';
      const colour = parts[3] || '';

      // Create in database
      await api.createSKU({
        sku,
        model,
        grade,
        storage,
        colour,
        title,
        total_stock: qtyNum,
        reserved_stock: 0,
        available_stock: qtyNum,
        ebay_listing_id: listingId,
        ebay_listed_quantity: qtyNum,
        cap_quantity: 3,
        price: priceNum,
        last_synced_at: new Date().toISOString(),
      });

      console.log('✅ SKU created in database');

      // Reload data
      await loadData();

      toast.success('Listing created successfully!');

      // Reset form
      setSku('');
      setTitle('');
      setDescription('');
      setPrice('');
      setQuantity('3');
    } catch (error: any) {
      console.error('Failed to create listing:', error);
      toast.error(`Failed to create listing: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create eBay Listing (Inventory API)
        </CardTitle>
        <CardDescription>
          Create a new listing that will be fully managed by the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>This will work automatically!</strong> Listings created here use eBay's Inventory API, 
            so auto-discovery, auto-sync, and quantity management all work perfectly.
          </AlertDescription>
        </Alert>

        <Alert className="mb-4 bg-yellow-500/10 border-yellow-500/30">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-600">
            <strong>Setup Required:</strong> You need to create Business Policies (Payment, Return, Fulfillment) 
            in eBay Seller Hub first. We'll guide you through this.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <Label htmlFor="sku">SKU (Custom Label) *</Label>
            <Input
              id="sku"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="IPHONE12-A-128-BLK"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Format: MODEL-GRADE-STORAGE-COLOR
            </p>
          </div>

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Apple iPhone 12 128GB Black - Grade A - Unlocked"
              maxLength={80}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Max 80 characters
            </p>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed product description..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (USD) *</Label>
              <Input
                id="price"
                type="text"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="299.99"
                required
              />
            </div>

            <div>
              <Label htmlFor="quantity">Initial Quantity</Label>
              <Input
                id="quantity"
                type="text"
                inputMode="numeric"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="3"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Default: 3 (cap)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="condition">Condition</Label>
              <select
                id="condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="1000">NEW</option>
                <option value="1500">NEW_OTHER</option>
                <option value="1750">NEW_WITH_DEFECTS</option>
                <option value="2000">MANUFACTURER_REFURBISHED</option>
                <option value="2500">SELLER_REFURBISHED</option>
                <option value="3000">USED_EXCELLENT</option>
                <option value="4000">USED_VERY_GOOD</option>
                <option value="5000">USED_GOOD</option>
                <option value="6000">USED_ACCEPTABLE</option>
              </select>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="9355">Cell Phones & Smartphones</option>
                <option value="171485">Laptops & Netbooks</option>
                <option value="179">Cameras & Photo</option>
              </select>
            </div>
          </div>

          <Button
            type="submit"
            disabled={creating}
            className="w-full"
          >
            {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Listing on eBay
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

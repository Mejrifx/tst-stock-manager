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
  const [condition, setCondition] = useState('USED_EXCELLENT'); // Use text format for Inventory API
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

      // Your eBay Business Policy IDs
      const paymentPolicyId = '208929822021';
      const returnPolicyId = '275313703021';
      const fulfillmentPolicyId = '295926498021';

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
            paymentPolicyId,
            returnPolicyId,
            fulfillmentPolicyId,
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
      console.error('❌ Failed to create listing:', error);
      console.error('Full error object:', error.response?.data || error);
      
      // Extract eBay's actual error message
      const ebayError = error.response?.data?.errors?.[0];
      const errorMsg = ebayError?.message || error.message || 'Unknown error';
      const errorDetails = ebayError?.longMessage || '';
      
      console.error('eBay error message:', errorMsg);
      if (errorDetails) console.error('eBay error details:', errorDetails);
      
      toast.error(`Failed to create listing: ${errorMsg}`);
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

        <Alert className="mb-4 bg-green-500/10 border-green-500/30">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">
            <strong>✅ Ready to go!</strong> Business policies configured. This will work automatically with full automation enabled.
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
                <option value="NEW">NEW</option>
                <option value="NEW_OTHER">NEW_OTHER (Open Box)</option>
                <option value="NEW_WITH_DEFECTS">NEW_WITH_DEFECTS</option>
                <option value="MANUFACTURER_REFURBISHED">MANUFACTURER_REFURBISHED</option>
                <option value="SELLER_REFURBISHED">SELLER_REFURBISHED</option>
                <option value="USED_EXCELLENT">USED_EXCELLENT (Grade A+/A)</option>
                <option value="USED_VERY_GOOD">USED_VERY_GOOD (Grade B+)</option>
                <option value="USED_GOOD">USED_GOOD (Grade B/C)</option>
                <option value="USED_ACCEPTABLE">USED_ACCEPTABLE (Grade D)</option>
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

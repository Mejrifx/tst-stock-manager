import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Upload, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import * as api from '@/lib/supabase-api';
import { useStore } from '@/store/useStore';
import { ebayClient } from '@/lib/ebay/client';

interface ImportProgress {
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  errors: string[];
}

export function BulkImport() {
  const [importing, setImporting] = useState(false);
  const [listingIds, setListingIds] = useState('');
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const { loadData } = useStore();

  const handleBulkImport = async () => {
    setImporting(true);
    
    try {
      // Parse listing IDs
      const ids = listingIds
        .trim()
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      if (ids.length === 0) {
        toast.error('Please enter at least one listing ID');
        return;
      }

      console.log(`Starting bulk import of ${ids.length} listings...`);

      const newProgress: ImportProgress = {
        total: ids.length,
        processed: 0,
        succeeded: 0,
        failed: 0,
        errors: [],
      };
      setProgress(newProgress);

      // Process each listing ID
      for (const listingId of ids) {
        try {
          console.log(`Fetching listing ${listingId}...`);

          // Fetch listing details from eBay Trading API via our proxy
          // Note: We'll use a simplified approach - get the item details
          const itemResponse = await ebayClient.get<any>(
            `/buy/browse/v1/item/v1|${listingId}|0`
          );

          // Extract details
          const title = itemResponse.title || 'Unknown Title';
          const sku = itemResponse.sku || listingId; // Use listing ID as SKU if not available
          const quantity = itemResponse.estimatedAvailabilities?.[0]?.estimatedAvailableQuantity || 0;
          const price = parseFloat(itemResponse.price?.value || '0');

          // Parse SKU parts (or use defaults)
          const parts = sku.split('-');
          const model = parts[0] || 'Unknown';
          const grade = parts[1] || 'A';
          const storage = parts[2] || '';
          const colour = parts[3] || '';

          console.log(`Creating SKU: ${sku}`);

          // Create in database
          await api.createSKU({
            sku,
            model,
            grade,
            storage,
            colour,
            title,
            total_stock: quantity,
            reserved_stock: 0,
            available_stock: quantity,
            ebay_listing_id: listingId,
            ebay_listed_quantity: quantity,
            cap_quantity: 3,
            price,
            last_synced_at: new Date().toISOString(),
          });

          newProgress.succeeded++;
          console.log(`✅ Imported: ${sku}`);
        } catch (error: any) {
          console.error(`Failed to import ${listingId}:`, error);
          newProgress.failed++;
          newProgress.errors.push(`${listingId}: ${error.message}`);
        }

        newProgress.processed++;
        setProgress({ ...newProgress });
      }

      // Reload data
      await loadData();

      toast.success(`Import complete! ${newProgress.succeeded} succeeded, ${newProgress.failed} failed`);
      
      if (newProgress.succeeded > 0) {
        setListingIds('');
      }
    } catch (error: any) {
      console.error('Bulk import failed:', error);
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk Import (Traditional Listings)
        </CardTitle>
        <CardDescription>
          Import multiple existing eBay listings at once
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>⚠️ For existing eBay listings:</strong> These will be tracked in the "Manual Listings" section.
            Sales detection works automatically, but you'll need to manually update quantities on eBay.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label>eBay Listing IDs (one per line)</Label>
          <Textarea
            placeholder="123456789012
987654321098
555666777888"
            value={listingIds}
            onChange={(e) => setListingIds(e.target.value)}
            rows={15}
            className="font-mono text-xs"
            disabled={importing}
          />
          <p className="text-xs text-muted-foreground">
            Paste your listing IDs here. Get them from: eBay Seller Hub → Active Listings → Click listing → Copy number from URL
          </p>
        </div>

        {progress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Progress:</span>
              <span>
                {progress.processed} / {progress.total} 
                {' '}({Math.round((progress.processed / progress.total) * 100)}%)
              </span>
            </div>
            
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${(progress.processed / progress.total) * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-green-600">✅ Succeeded: {progress.succeeded}</div>
              <div className="text-red-600">❌ Failed: {progress.failed}</div>
            </div>

            {progress.errors.length > 0 && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Errors:</strong>
                  <ul className="list-disc list-inside mt-1 text-xs">
                    {progress.errors.slice(0, 5).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {progress.errors.length > 5 && (
                      <li>... and {progress.errors.length - 5} more</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <Button
          onClick={handleBulkImport}
          disabled={importing || !listingIds.trim()}
          className="w-full"
        >
          {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Import {listingIds.trim().split('\n').filter(l => l.trim()).length} Listings
        </Button>

        <div className="p-3 bg-muted rounded text-xs space-y-2">
          <p><strong>How to get all your listing IDs quickly:</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Go to eBay Seller Hub → Active Listings</li>
            <li>Export as CSV (if available) or manually copy IDs</li>
            <li>Paste all IDs here (one per line)</li>
            <li>Click Import - system fetches details automatically!</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}

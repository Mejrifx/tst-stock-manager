import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Plus, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import * as api from '@/lib/supabase-api';
import { useStore } from '@/store/useStore';

interface ImportRow {
  sku: string;
  ebayListingId: string;
  title: string;
  quantity: number;
}

export function ManualImport() {
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(0);
  const [csvText, setCsvText] = useState('');
  const { loadData } = useStore();

  const handleImport = async () => {
    setImporting(true);
    setImported(0);

    try {
      // Parse CSV
      const lines = csvText.trim().split('\n');
      const rows: ImportRow[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(',').map(p => p.trim());
        
        if (parts.length < 4) {
          toast.error(`Line ${i + 1}: Invalid format. Expected: SKU, Listing ID, Title, Quantity`);
          continue;
        }

        rows.push({
          sku: parts[0],
          ebayListingId: parts[1],
          title: parts[2],
          quantity: parseInt(parts[3]) || 0,
        });
      }

      console.log(`Parsed ${rows.length} rows`);

      // Import each row
      for (const row of rows) {
        try {
          // Create SKU in database
          const sku = await api.createSKU({
            sku: row.sku,
            model: row.sku.split('-')[0] || 'Unknown',
            grade: row.sku.split('-')[1] || 'A',
            storage: row.sku.split('-')[2] || '64GB',
            colour: row.sku.split('-')[3] || 'Black',
            title: row.title,
            total_stock: row.quantity,
            reserved_stock: 0,
            available_stock: row.quantity,
            ebay_listing_id: row.ebayListingId,
            ebay_listed_quantity: row.quantity,
            cap_quantity: 3,
            price: 0,
            last_synced_at: new Date().toISOString(),
          });

          console.log(`✅ Imported: ${row.sku}`);
          setImported(prev => prev + 1);
        } catch (error: any) {
          console.error(`Failed to import ${row.sku}:`, error);
          toast.error(`Failed to import ${row.sku}: ${error.message}`);
        }
      }

      // Reload data
      await loadData();

      toast.success(`Successfully imported ${imported} listings!`);
      setCsvText('');
    } catch (error: any) {
      console.error('Import failed:', error);
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Manual Import (Traditional Listings)
        </CardTitle>
        <CardDescription>
          Import your existing eBay listings manually
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Why manual import?</strong> Your eBay listings were created via the traditional flow (not Inventory API). 
            This tool lets you quickly add them to the system so auto-sync can work.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label>Import Data (CSV Format)</Label>
          <Textarea
            placeholder="IPHONE12-A-128-BLK, 123456789012, iPhone 12 128GB Black, 5
IPHONE13-A-256-BLU, 123456789013, iPhone 13 256GB Blue, 3"
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            rows={10}
            className="font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">
            Format: <strong>SKU, eBay Listing ID, Title, Current Quantity</strong> (one per line)
          </p>
        </div>

        <div className="p-3 bg-muted rounded text-xs space-y-2">
          <p><strong>How to get your listing IDs:</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Go to eBay Seller Hub → Active Listings</li>
            <li>Click on a listing</li>
            <li>Look at the URL: <code className="bg-background px-1 py-0.5 rounded">ebay.com/itm/<strong>123456789012</strong></code></li>
            <li>That number is your Listing ID</li>
            <li>Copy your Custom Label (SKU) from the listing details</li>
          </ol>
        </div>

        {imported > 0 && (
          <Alert className="bg-success/10 border-success/30">
            <CheckCircle className="h-4 w-4 text-success" />
            <AlertDescription className="text-success">
              Imported {imported} listing(s) so far...
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleImport}
          disabled={importing || !csvText.trim()}
          className="w-full"
        >
          {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Import Listings
        </Button>
      </CardContent>
    </Card>
  );
}

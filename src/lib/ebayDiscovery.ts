import { useStore } from '@/store/useStore';
import { getAllActiveListings } from './ebay/inventory';
import { getInventoryItem } from './ebay/inventory';
import * as api from './supabase-api';

/**
 * Discovers eBay listings and automatically links them to SKUs in the database
 * If a SKU doesn't exist, it creates a new one automatically
 */
export async function discoverAndLinkEbayListings(): Promise<{
  linked: number;
  created: number;
  unmatched: number;
  errors: string[];
}> {
  const store = useStore.getState();
  const results = {
    linked: 0,
    created: 0,
    unmatched: 0,
    errors: [] as string[],
  };

  try {
    console.log('🔍 Discovering eBay listings...');
    
    // Fetch all active listings from eBay
    const ebayListings = await getAllActiveListings();
    
    console.log(`Found ${ebayListings.size} active eBay listings`);

    // Match and link each eBay listing to local SKUs
    for (const [ebaySku, listingData] of ebayListings) {
      try {
        // Find matching SKU in local database
        let localSku = store.skus.find((s) => s.sku === ebaySku);

        if (localSku) {
          // SKU exists - just link it
          await api.updateSKU(localSku.id, {
            ebay_listing_id: listingData.listingId,
            ebay_listed_quantity: listingData.quantity,
            last_synced_at: new Date().toISOString(),
          });

          console.log(`✅ Linked ${ebaySku} → eBay listing ${listingData.listingId}`);
          results.linked++;

          await store.addActivity(
            'LISTING_CREATED',
            `Linked ${ebaySku} to eBay listing (ID: ${listingData.listingId})`
          );
        } else {
          // SKU doesn't exist - fetch full details from eBay and create it
          console.log(`🆕 Creating new SKU for ${ebaySku}...`);
          
          const ebayItem = await getInventoryItem(ebaySku);
          
          if (!ebayItem) {
            console.error(`Failed to fetch details for ${ebaySku}`);
            results.errors.push(`Failed to fetch eBay item details for ${ebaySku}`);
            continue;
          }

          // Parse SKU components from the code (basic parsing - you can enhance this)
          const parts = ebaySku.split('-');
          const model = parts[0] || 'Unknown';
          const grade = parts[1] || 'A';
          const storage = parts[2] || '64GB';
          const colour = parts[3] || 'Black';

          // Create new SKU in database
          const newSku = await api.createSKU({
            sku: ebaySku,
            model,
            grade,
            storage,
            colour,
            title: ebayItem.product.title,
            total_stock: listingData.quantity,
            reserved_stock: 0,
            available_stock: listingData.quantity,
            ebay_listing_id: listingData.listingId,
            ebay_listed_quantity: listingData.quantity,
            cap_quantity: 3,
            price: 0, // You'll need to update this manually or fetch from listing
            last_synced_at: new Date().toISOString(),
          });

          console.log(`✅ Created new SKU: ${ebaySku} (ID: ${newSku.id})`);
          results.created++;

          await store.addActivity(
            'LISTING_CREATED',
            `Auto-created SKU ${ebaySku} from eBay listing (ID: ${listingData.listingId})`
          );
        }
      } catch (error: any) {
        const errorMsg = `Failed to process ${ebaySku}: ${error.message}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }

    // Reload data to show new/updated SKUs
    await store.loadData();

    // Log summary
    const summary = `eBay discovery: ${results.linked} linked, ${results.created} created, ${results.unmatched} unmatched, ${results.errors.length} errors`;
    console.log(summary);
    
    if (results.linked > 0 || results.created > 0) {
      await store.addActivity('SYNC_SUCCESS', summary);
    }

    return results;
  } catch (error: any) {
    const errorMsg = `Failed to discover eBay listings: ${error.message}`;
    console.error(errorMsg);
    results.errors.push(errorMsg);
    
    await store.addActivity('SYNC_ERROR', errorMsg);
    
    return results;
  }
}

/**
 * Updates a local SKU with eBay listing information
 * Called from Zustand store
 */
export async function updateSKUWithEbayInfo(
  skuId: string,
  ebayListingId: string,
  ebayQuantity: number
) {
  const store = useStore.getState();
  
  await store.updateSKU(skuId, {
    ebay_listing_id: ebayListingId,
    ebay_listed_quantity: ebayQuantity,
    last_synced_at: new Date().toISOString(),
  });
}


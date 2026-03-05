import { useStore } from '@/store/useStore';
import { getAllActiveListings } from './ebay/inventory';
import { ebayClient } from './ebay/client';

/**
 * Discovers eBay listings and automatically links them to SKUs in the database
 */
export async function discoverAndLinkEbayListings(): Promise<{
  linked: number;
  unmatched: number;
  errors: string[];
}> {
  const store = useStore.getState();
  const results = {
    linked: 0,
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
        const localSku = store.skus.find((s) => s.sku === ebaySku);

        if (localSku) {
          // Update SKU with eBay listing info
          await store.updateSKU(localSku.id, {
            ebay_listing_id: listingData.listingId,
            ebay_listed_quantity: listingData.quantity,
            last_synced_at: new Date().toISOString(),
          });

          console.log(`✅ Linked ${ebaySku} → eBay listing ${listingData.listingId}`);
          results.linked++;

          // Log activity
          await store.addActivity(
            'LISTING_CREATED',
            `Auto-linked ${ebaySku} to eBay listing (ID: ${listingData.listingId})`
          );
        } else {
          console.warn(`⚠️ eBay listing for SKU ${ebaySku} not found in database`);
          results.unmatched++;
          
          await store.addActivity(
            'ERROR',
            `eBay listing found for unknown SKU: ${ebaySku}`
          );
        }
      } catch (error: any) {
        const errorMsg = `Failed to link ${ebaySku}: ${error.message}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }

    // Log summary
    const summary = `eBay listing discovery: ${results.linked} linked, ${results.unmatched} unmatched, ${results.errors.length} errors`;
    console.log(summary);
    
    if (results.linked > 0) {
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

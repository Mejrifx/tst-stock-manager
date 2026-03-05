import { ebayClient } from './client';

export interface InventoryItemResponse {
  inventoryItems: InventoryItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface InventoryItem {
  sku: string;
  product: {
    title: string;
    description?: string;
    imageUrls?: string[];
  };
  condition: string;
  availability: {
    shipToLocationAvailability: {
      quantity: number;
    };
  };
  listingIds?: string[];
}

/**
 * Get a single inventory item by SKU
 */
export async function getInventoryItem(sku: string): Promise<InventoryItem | null> {
  try {
    const response = await ebayClient.get<InventoryItem>(
      `/sell/inventory/v1/inventory_item/${encodeURIComponent(sku)}`
    );
    return response;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error(`Failed to fetch inventory item ${sku}:`, error);
    throw error;
  }
}

/**
 * Get all inventory items from eBay
 */
export async function getAllInventoryItems(limit: number = 100, offset: number = 0): Promise<InventoryItem[]> {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    const response = await ebayClient.get<InventoryItemResponse>(
      `/sell/inventory/v1/inventory_item?${params}`
    );

    return response.inventoryItems || [];
  } catch (error) {
    console.error('Failed to fetch inventory items:', error);
    return [];
  }
}

/**
 * Get all active listings with their associated SKUs and quantities
 */
export async function getAllActiveListings(): Promise<Map<string, { listingId: string; quantity: number }>> {
  const listings = new Map<string, { listingId: string; quantity: number }>();
  
  try {
    // Fetch all inventory items which include listing IDs
    const items = await getAllInventoryItems();
    
    for (const item of items) {
      if (item.listingIds && item.listingIds.length > 0) {
        // Get the first (primary) listing ID
        const listingId = item.listingIds[0];
        const quantity = item.availability?.shipToLocationAvailability?.quantity || 0;
        
        listings.set(item.sku, {
          listingId,
          quantity,
        });
      }
    }
    
    console.log(`Found ${listings.size} active listings on eBay`);
    return listings;
  } catch (error) {
    console.error('Failed to fetch active listings:', error);
    return listings;
  }
}

/**
 * Update inventory quantity for a SKU
 */
export async function updateInventoryQuantity(sku: string, newQuantity: number): Promise<boolean> {
  try {
    // First check if inventory item exists
    const item = await getInventoryItem(sku);
    
    if (!item) {
      console.warn(`Inventory item ${sku} not found on eBay`);
      return false;
    }

    // Update the quantity
    await ebayClient.put(
      `/sell/inventory/v1/inventory_item/${encodeURIComponent(sku)}`,
      {
        ...item,
        availability: {
          shipToLocationAvailability: {
            quantity: newQuantity,
          },
        },
      }
    );

    console.log(`Updated ${sku} quantity to ${newQuantity}`);
    return true;
  } catch (error) {
    console.error(`Failed to update inventory quantity for ${sku}:`, error);
    return false;
  }
}

/**
 * Create a new inventory item on eBay
 */
export async function createInventoryItem(
  sku: string,
  title: string,
  quantity: number,
  price: number,
  condition: string = 'USED_EXCELLENT'
): Promise<boolean> {
  try {
    await ebayClient.put(
      `/sell/inventory/v1/inventory_item/${encodeURIComponent(sku)}`,
      {
        product: {
          title,
        },
        condition,
        availability: {
          shipToLocationAvailability: {
            quantity,
          },
        },
      }
    );

    console.log(`Created inventory item: ${sku}`);
    return true;
  } catch (error) {
    console.error(`Failed to create inventory item ${sku}:`, error);
    return false;
  }
}

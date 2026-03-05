import { ebayClient } from './client';

export interface InventoryItem {
  sku: string;
  availability: {
    shipToLocationAvailability: {
      quantity: number;
    };
  };
  product?: {
    title: string;
    description: string;
    aspects?: Record<string, string[]>;
    imageUrls?: string[];
  };
}

export interface InventoryItemResponse {
  sku: string;
  availability: {
    shipToLocationAvailability: {
      quantity: number;
    };
  };
  locale?: string;
  product?: any;
}

export async function getInventoryItem(sku: string): Promise<InventoryItemResponse | null> {
  try {
    const response = await ebayClient.get<InventoryItemResponse>(
      `/sell/inventory/v1/inventory_item/${encodeURIComponent(sku)}`
    );
    return response;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error('Failed to get inventory item:', error);
    throw error;
  }
}

export async function updateInventoryQuantity(
  sku: string,
  quantity: number
): Promise<boolean> {
  try {
    const existingItem = await getInventoryItem(sku);
    
    if (!existingItem) {
      console.error(`Inventory item ${sku} not found on eBay`);
      return false;
    }

    const updateData = {
      ...existingItem,
      availability: {
        shipToLocationAvailability: {
          quantity,
        },
      },
    };

    await ebayClient.put(
      `/sell/inventory/v1/inventory_item/${encodeURIComponent(sku)}`,
      updateData
    );

    return true;
  } catch (error) {
    console.error('Failed to update inventory quantity:', error);
    return false;
  }
}

export async function createInventoryItem(
  sku: string,
  title: string,
  quantity: number,
  price: number,
  description?: string
): Promise<boolean> {
  try {
    const inventoryData: InventoryItem = {
      sku,
      availability: {
        shipToLocationAvailability: {
          quantity,
        },
      },
      product: {
        title,
        description: description || title,
        imageUrls: [],
      },
    };

    await ebayClient.put(
      `/sell/inventory/v1/inventory_item/${encodeURIComponent(sku)}`,
      inventoryData
    );

    return true;
  } catch (error) {
    console.error('Failed to create inventory item:', error);
    return false;
  }
}

export async function getAllInventoryItems(limit: number = 100): Promise<InventoryItemResponse[]> {
  try {
    const response = await ebayClient.get<{ inventoryItems: InventoryItemResponse[] }>(
      `/sell/inventory/v1/inventory_item?limit=${limit}`
    );
    return response.inventoryItems || [];
  } catch (error) {
    console.error('Failed to get all inventory items:', error);
    return [];
  }
}

import { ebayClient } from './client';

export interface LineItem {
  lineItemId: string;
  sku: string;
  title: string;
  quantity: number;
  lineItemCost: {
    value: string;
    currency: string;
  };
}

export interface EbayOrder {
  orderId: string;
  orderFulfillmentStatus: 'FULFILLED' | 'IN_PROGRESS' | 'NOT_STARTED';
  creationDate: string;
  buyer: {
    username: string;
  };
  lineItems: LineItem[];
  pricingSummary: {
    total: {
      value: string;
      currency: string;
    };
  };
}

export interface OrderSearchResponse {
  orders: EbayOrder[];
  total: number;
  limit: number;
  offset: number;
}

export async function getRecentOrders(
  sinceDate?: string,
  limit: number = 50
): Promise<EbayOrder[]> {
  try {
    // Build filter query
    const filters: string[] = [];
    
    if (sinceDate) {
      filters.push(`creationdate:[${sinceDate}..${new Date().toISOString()}]`);
    }

    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(filters.length > 0 && { filter: filters.join(',') }),
    });

    const response = await ebayClient.get<OrderSearchResponse>(
      `/sell/fulfillment/v1/order?${params}`
    );

    return response.orders || [];
  } catch (error) {
    console.error('Failed to fetch eBay orders:', error);
    return [];
  }
}

export interface ParsedOrder {
  orderId: string;
  buyer: string;
  items: Array<{
    sku: string;
    quantity: number;
    title: string;
  }>;
  saleDate: string;
  status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
}

export function parseOrder(order: EbayOrder): ParsedOrder {
  const mapStatus = (status: string): ParsedOrder['status'] => {
    switch (status) {
      case 'FULFILLED':
        return 'DELIVERED';
      case 'IN_PROGRESS':
        return 'SHIPPED';
      case 'NOT_STARTED':
        return 'PENDING';
      default:
        return 'PENDING';
    }
  };

  return {
    orderId: order.orderId,
    buyer: order.buyer.username,
    items: order.lineItems.map((item) => ({
      sku: item.sku,
      quantity: item.quantity,
      title: item.title,
    })),
    saleDate: order.creationDate,
    status: mapStatus(order.orderFulfillmentStatus),
  };
}

export async function getOrdersSince(lastSyncDate: string): Promise<ParsedOrder[]> {
  const orders = await getRecentOrders(lastSyncDate);
  return orders.map(parseOrder);
}

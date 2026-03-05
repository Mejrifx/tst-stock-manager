import { create } from "zustand";
import { mockData, SKU, Sale, Activity, ActivityType, SyncStatus } from "@/data/mock";

interface Store {
  skus: SKU[];
  sales: Sale[];
  activities: Activity[];
  syncStatus: SyncStatus;
  
  // Actions
  addStock: (skuId: string, quantity: number) => void;
  removeStock: (skuId: string, quantity: number, reason: string) => void;
  updateEbayQuantity: (skuId: string, newQty: number) => void;
  processSale: (orderId: string, skuId: string, qty: number, buyer: string) => void;
  replenishEbayListing: (skuId: string) => void;
  addActivity: (type: ActivityType, message: string, meta?: Record<string, string>) => void;
  updateSyncStatus: (status: "idle" | "running" | "error") => void;
}

export const useStore = create<Store>((set, get) => ({
  skus: mockData.skus,
  sales: mockData.sales,
  activities: mockData.activities,
  syncStatus: mockData.syncStatus,

  addStock: (skuId, quantity) => {
    set((s) => ({
      skus: s.skus.map((sku) => {
        if (sku.id === skuId) {
          const newTotalStock = sku.totalStock + quantity;
          const newAvailableStock = newTotalStock - sku.reservedStock;
          return {
            ...sku,
            totalStock: newTotalStock,
            availableStock: newAvailableStock,
          };
        }
        return sku;
      }),
    }));
    
    const sku = get().skus.find((s) => s.id === skuId);
    if (sku) {
      get().addActivity("STOCK_ADJUSTED", `Stock added: +${quantity} ${sku.sku} (Total: ${sku.totalStock + quantity})`);
    }
  },

  removeStock: (skuId, quantity, reason) => {
    set((s) => ({
      skus: s.skus.map((sku) => {
        if (sku.id === skuId) {
          const newTotalStock = Math.max(0, sku.totalStock - quantity);
          const newAvailableStock = Math.max(0, newTotalStock - sku.reservedStock);
          return {
            ...sku,
            totalStock: newTotalStock,
            availableStock: newAvailableStock,
          };
        }
        return sku;
      }),
    }));
    
    const sku = get().skus.find((s) => s.id === skuId);
    if (sku) {
      get().addActivity("STOCK_ADJUSTED", `Stock removed: -${quantity} ${sku.sku} (Reason: ${reason})`);
    }
  },

  updateEbayQuantity: (skuId, newQty) => {
    set((s) => ({
      skus: s.skus.map((sku) => {
        if (sku.id === skuId) {
          return {
            ...sku,
            ebayListedQuantity: newQty,
            lastSyncedAt: new Date().toISOString(),
          };
        }
        return sku;
      }),
    }));
  },

  processSale: (orderId, skuId, qty, buyer) => {
    const sku = get().skus.find((s) => s.id === skuId);
    if (!sku) return;

    // Reduce total stock and eBay quantity
    set((s) => ({
      skus: s.skus.map((sk) => {
        if (sk.id === skuId) {
          const newTotalStock = Math.max(0, sk.totalStock - qty);
          const newEbayQty = Math.max(0, sk.ebayListedQuantity - qty);
          const newAvailableStock = Math.max(0, newTotalStock - sk.reservedStock);
          return {
            ...sk,
            totalStock: newTotalStock,
            availableStock: newAvailableStock,
            ebayListedQuantity: newEbayQty,
            lastSyncedAt: new Date().toISOString(),
          };
        }
        return sk;
      }),
    }));

    // Add sale record
    const sale: Sale = {
      id: `SALE-${Date.now()}`,
      orderId,
      skuId,
      sku: sku.sku,
      quantity: qty,
      buyer,
      saleDate: new Date().toISOString(),
      status: "PENDING",
    };

    set((s) => ({
      sales: [sale, ...s.sales],
    }));

    get().addActivity("EBAY_SALE_DETECTED", `Sale detected: ${qty}x ${sku.sku} (Order #${orderId})`);
  },

  replenishEbayListing: (skuId) => {
    const sku = get().skus.find((s) => s.id === skuId);
    if (!sku) return;

    const needed = sku.capQuantity - sku.ebayListedQuantity;
    if (needed <= 0) return;

    const canReplenish = Math.min(needed, sku.availableStock);
    const newQty = sku.ebayListedQuantity + canReplenish;

    set((s) => ({
      skus: s.skus.map((sk) => {
        if (sk.id === skuId) {
          return {
            ...sk,
            ebayListedQuantity: newQty,
            lastSyncedAt: new Date().toISOString(),
          };
        }
        return sk;
      }),
    }));

    get().addActivity(
      "QUANTITY_REPLENISHED",
      `eBay quantity replenished: ${sku.sku} (${sku.ebayListedQuantity} → ${newQty})`
    );
  },

  addActivity: (type, message, meta) => {
    const activity: Activity = {
      id: `ACT-${Date.now()}`,
      ts: new Date().toISOString(),
      type,
      message,
      meta,
    };
    set((s) => ({ activities: [activity, ...s.activities] }));
  },

  updateSyncStatus: (status) => {
    set({
      syncStatus: {
        lastRun: new Date().toISOString(),
        status,
        nextRun: new Date(Date.now() + 300000).toISOString(),
      },
    });
  },
}));

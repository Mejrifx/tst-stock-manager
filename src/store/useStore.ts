import { create } from "zustand";
import type { SKU, Sale, Activity, SyncStatus } from "@/lib/supabase";
import * as api from "@/lib/supabase-api";

interface Store {
  skus: SKU[];
  sales: Sale[];
  activities: Activity[];
  syncStatus: SyncStatus | null;
  loading: boolean;
  
  // Data loading
  loadData: () => Promise<void>;
  
  // SKU Actions
  addStock: (skuId: string, quantity: number) => Promise<void>;
  removeStock: (skuId: string, quantity: number, reason: string) => Promise<void>;
  updateEbayQuantity: (skuId: string, newQty: number) => Promise<void>;
  processSale: (orderId: string, skuId: string, qty: number, buyer: string) => Promise<void>;
  replenishEbayListing: (skuId: string) => Promise<void>;
  
  // Activity Actions
  addActivity: (type: Activity['type'], message: string, meta?: Record<string, any>) => Promise<void>;
  
  // Sync Actions
  updateSyncStatus: (status: 'idle' | 'running' | 'error', errorMessage?: string) => Promise<void>;
}

export const useStore = create<Store>((set, get) => ({
  skus: [],
  sales: [],
  activities: [],
  syncStatus: null,
  loading: false,

  loadData: async () => {
    set({ loading: true });
    try {
      const [skus, sales, activities, syncStatus] = await Promise.all([
        api.getAllSKUs(),
        api.getAllSales(),
        api.getAllActivities(100),
        api.getSyncStatus(),
      ]);
      
      set({ skus, sales, activities, syncStatus, loading: false });
    } catch (error) {
      console.error('Failed to load data:', error);
      set({ loading: false });
    }
  },

  addStock: async (skuId, quantity) => {
    try {
      const updatedSKU = await api.addStockToSKU(skuId, quantity);
      
      set((s) => ({
        skus: s.skus.map((sku) => (sku.id === skuId ? updatedSKU : sku)),
      }));

      await get().addActivity(
        'STOCK_ADJUSTED',
        `Stock added: +${quantity} ${updatedSKU.sku} (Total: ${updatedSKU.total_stock})`
      );
    } catch (error) {
      console.error('Failed to add stock:', error);
      throw error;
    }
  },

  removeStock: async (skuId, quantity, reason) => {
    try {
      const updatedSKU = await api.removeStockFromSKU(skuId, quantity);
      
      set((s) => ({
        skus: s.skus.map((sku) => (sku.id === skuId ? updatedSKU : sku)),
      }));

      await get().addActivity(
        'STOCK_ADJUSTED',
        `Stock removed: -${quantity} ${updatedSKU.sku} (Reason: ${reason})`
      );
    } catch (error) {
      console.error('Failed to remove stock:', error);
      throw error;
    }
  },

  updateEbayQuantity: async (skuId, newQty) => {
    try {
      const updatedSKU = await api.updateSKU(skuId, {
        ebay_listed_quantity: newQty,
        last_synced_at: new Date().toISOString(),
      });

      set((s) => ({
        skus: s.skus.map((sku) => (sku.id === skuId ? updatedSKU : sku)),
      }));
    } catch (error) {
      console.error('Failed to update eBay quantity:', error);
      throw error;
    }
  },

  processSale: async (orderId, skuId, qty, buyer) => {
    try {
      const sku = get().skus.find((s) => s.id === skuId);
      if (!sku) throw new Error('SKU not found');

      // Update stock quantities
      const newTotalStock = Math.max(0, sku.total_stock - qty);
      const newEbayQty = Math.max(0, sku.ebay_listed_quantity - qty);
      const newAvailableStock = Math.max(0, newTotalStock - sku.reserved_stock);

      const updatedSKU = await api.updateSKU(skuId, {
        total_stock: newTotalStock,
        available_stock: newAvailableStock,
        ebay_listed_quantity: newEbayQty,
        last_synced_at: new Date().toISOString(),
      });

      // Create sale record
      const sale = await api.createSale({
        order_id: orderId,
        sku_id: skuId,
        sku: sku.sku,
        quantity: qty,
        buyer,
        sale_date: new Date().toISOString(),
        status: 'PENDING',
      });

      set((s) => ({
        skus: s.skus.map((sk) => (sk.id === skuId ? updatedSKU : sk)),
        sales: [sale, ...s.sales],
      }));

      await get().addActivity(
        'EBAY_SALE_DETECTED',
        `Sale detected: ${qty}x ${sku.sku} (Order #${orderId})`
      );
    } catch (error) {
      console.error('Failed to process sale:', error);
      throw error;
    }
  },

  replenishEbayListing: async (skuId) => {
    try {
      const sku = get().skus.find((s) => s.id === skuId);
      if (!sku) throw new Error('SKU not found');

      const needed = sku.cap_quantity - sku.ebay_listed_quantity;
      if (needed <= 0) return;

      const canReplenish = Math.min(needed, sku.available_stock);
      const newQty = sku.ebay_listed_quantity + canReplenish;

      const updatedSKU = await api.updateSKU(skuId, {
        ebay_listed_quantity: newQty,
        last_synced_at: new Date().toISOString(),
      });

      set((s) => ({
        skus: s.skus.map((sk) => (sk.id === skuId ? updatedSKU : sk)),
      }));

      await get().addActivity(
        'QUANTITY_REPLENISHED',
        `eBay quantity replenished: ${sku.sku} (${sku.ebay_listed_quantity} → ${newQty})`
      );
    } catch (error) {
      console.error('Failed to replenish eBay listing:', error);
      throw error;
    }
  },

  addActivity: async (type, message, meta) => {
    try {
      const activity = await api.createActivity(type, message, meta);
      set((s) => ({ activities: [activity, ...s.activities] }));
    } catch (error) {
      console.error('Failed to add activity:', error);
    }
  },

  updateSyncStatus: async (status, errorMessage) => {
    try {
      const syncStatus = await api.updateSyncStatus(status, errorMessage);
      set({ syncStatus });
    } catch (error) {
      console.error('Failed to update sync status:', error);
    }
  },
}));

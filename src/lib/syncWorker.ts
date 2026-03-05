import { useStore } from '@/store/useStore';
import { getOrdersSince } from './ebay/orders';
import { updateInventoryQuantity } from './ebay/inventory';
import { ebayClient } from './ebay/client';

export class SyncWorker {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private syncIntervalMs = 5 * 60 * 1000; // 5 minutes

  constructor() {}

  start(intervalMs?: number) {
    if (this.intervalId) {
      console.warn('Sync worker already running');
      return;
    }

    if (intervalMs) {
      this.syncIntervalMs = intervalMs;
    }

    console.log(`Starting eBay sync worker (interval: ${this.syncIntervalMs / 1000}s)`);
    
    // Run immediately on start
    this.runSync();

    // Then run on interval
    this.intervalId = setInterval(() => {
      this.runSync();
    }, this.syncIntervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Sync worker stopped');
    }
  }

  async runSync() {
    if (this.isRunning) {
      console.log('Sync already in progress, skipping...');
      return;
    }

    const store = useStore.getState();

    // Check if eBay is connected
    if (!ebayClient.isConnected()) {
      console.log('eBay not connected, skipping sync');
      return;
    }

    this.isRunning = true;
    store.updateSyncStatus('running');
    store.addActivity('SYNC_SUCCESS', 'Starting eBay sync...');

    try {
      await this.syncOrders(store);
      await this.replenishListings(store);

      store.updateSyncStatus('idle');
      store.addActivity('SYNC_SUCCESS', 'eBay sync completed successfully');
    } catch (error: any) {
      console.error('Sync failed:', error);
      store.updateSyncStatus('error');
      store.addActivity('SYNC_ERROR', `Sync failed: ${error.message || 'Unknown error'}`);
    } finally {
      this.isRunning = false;
    }
  }

  private async syncOrders(store: ReturnType<typeof useStore.getState>) {
    const lastSyncTime = store.syncStatus?.last_run || new Date().toISOString();
    
    console.log('Fetching orders since:', lastSyncTime);
    const orders = await getOrdersSince(lastSyncTime);

    console.log(`Found ${orders.length} new orders`);

    for (const order of orders) {
      for (const item of order.items) {
        // Find matching SKU in our store
        const sku = store.skus.find((s) => s.sku === item.sku);
        
        if (!sku) {
          console.warn(`SKU ${item.sku} not found in store`);
          continue;
        }

        // Process the sale
        store.processSale(order.orderId, sku.id, item.quantity, order.buyer);
        console.log(`Processed sale: ${item.quantity}x ${item.sku}`);
      }
    }
  }

  private async replenishListings(store: ReturnType<typeof useStore.getState>) {
    const skusToReplenish = store.skus.filter(
      (sku) => sku.ebay_listing_id && sku.ebay_listed_quantity < sku.cap_quantity && sku.available_stock > 0
    );

    console.log(`Found ${skusToReplenish.length} SKUs that need replenishment`);

    for (const sku of skusToReplenish) {
      const needed = sku.cap_quantity - sku.ebay_listed_quantity;
      const canReplenish = Math.min(needed, sku.available_stock);
      const newQuantity = sku.ebay_listed_quantity + canReplenish;

      console.log(`Replenishing ${sku.sku}: ${sku.ebay_listed_quantity} → ${newQuantity}`);

      try {
        const success = await updateInventoryQuantity(sku.sku, newQuantity);
        
        if (success) {
          store.updateEbayQuantity(sku.id, newQuantity);
          console.log(`Successfully replenished ${sku.sku}`);
        } else {
          console.error(`Failed to replenish ${sku.sku} on eBay`);
          store.addActivity('ERROR', `Failed to replenish ${sku.sku} on eBay`);
        }
      } catch (error: any) {
        console.error(`Error replenishing ${sku.sku}:`, error);
        store.addActivity('ERROR', `Error replenishing ${sku.sku}: ${error.message}`);
      }
    }
  }

  isActive(): boolean {
    return this.intervalId !== null;
  }

  getInterval(): number {
    return this.syncIntervalMs;
  }

  setInterval(intervalMs: number) {
    this.syncIntervalMs = intervalMs;
    if (this.intervalId) {
      this.stop();
      this.start();
    }
  }
}

export const syncWorker = new SyncWorker();

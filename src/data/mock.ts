export interface SKU {
  id: string;
  sku: string;
  model: string;
  grade: string;
  storage: string;
  colour: string;
  
  // Inventory
  totalStock: number;
  reservedStock: number;
  availableStock: number;
  
  // eBay Integration
  ebayListingId?: string;
  ebayListedQuantity: number;
  capQuantity: number;
  
  // Metadata
  price: number;
  title: string;
  createdAt: string;
  lastSyncedAt?: string;
}

export interface Sale {
  id: string;
  orderId: string;
  skuId: string;
  sku: string;
  quantity: number;
  buyer: string;
  saleDate: string;
  status: "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
}

export type ActivityType =
  | "EBAY_SALE_DETECTED"
  | "QUANTITY_REPLENISHED"
  | "STOCK_ADJUSTED"
  | "LISTING_CREATED"
  | "LISTING_ENDED"
  | "SYNC_SUCCESS"
  | "SYNC_ERROR"
  | "STATUS_CHANGE"
  | "ERROR";

export interface Activity {
  id: string;
  ts: string;
  type: ActivityType;
  message: string;
  meta?: Record<string, string>;
}

export interface SyncStatus {
  lastRun: string;
  status: "idle" | "running" | "error";
  nextRun: string;
}

function makeSkuCode(model: string, grade: string, storage: string, colour: string): string {
  const modelCode = model.replace(/\s+/g, "").substring(0, 8).toUpperCase();
  const colourCode = colour.replace(/\s+/g, "").substring(0, 3).toUpperCase();
  const storageCode = storage.replace("GB", "");
  return `${modelCode}-${grade}-${storageCode}-${colourCode}`;
}

const models = [
  { model: "iPhone XR", grades: ["A", "B"], storages: ["64GB", "128GB"], colours: ["Black", "White", "Blue"] },
  { model: "iPhone 11", grades: ["A", "B"], storages: ["64GB", "128GB"], colours: ["Black", "White", "Purple"] },
  { model: "iPhone 12", grades: ["A", "B"], storages: ["128GB", "256GB"], colours: ["Black", "Blue", "White"] },
  { model: "iPhone 13", grades: ["A", "B"], storages: ["128GB", "256GB"], colours: ["Midnight", "Blue", "Pink"] },
  { model: "iPhone 14", grades: ["A"], storages: ["128GB", "256GB"], colours: ["Midnight", "Purple", "Blue"] },
  { model: "iPhone 14 Pro", grades: ["A", "B"], storages: ["256GB", "512GB"], colours: ["Space Black", "Gold", "Deep Purple"] },
  { model: "iPhone 15", grades: ["A"], storages: ["128GB", "256GB"], colours: ["Black", "Blue", "Pink"] },
  { model: "Samsung S23", grades: ["A", "B"], storages: ["128GB", "256GB"], colours: ["Phantom Black", "Cream"] },
];

let skuId = 1;
const skus: SKU[] = [];

models.forEach(({ model, grades, storages, colours }) => {
  grades.forEach((grade) => {
    storages.forEach((storage) => {
      colours.forEach((colour) => {
        const id = `SKU-${String(skuId).padStart(4, "0")}`;
        const skuCode = makeSkuCode(model, grade, storage, colour);
        const totalStock = Math.floor(Math.random() * 20) + 5; // 5-25 units
        const reservedStock = Math.floor(Math.random() * 3); // 0-2 reserved
        const availableStock = totalStock - reservedStock;
        
        // Some SKUs have eBay listings, some don't
        const hasEbayListing = Math.random() > 0.2;
        
        skus.push({
          id,
          sku: skuCode,
          model,
          grade,
          storage,
          colour,
          totalStock,
          reservedStock,
          availableStock,
          ebayListingId: hasEbayListing ? `11${String(Math.floor(Math.random() * 9999999999)).padStart(10, "0")}` : undefined,
          ebayListedQuantity: hasEbayListing ? 3 : 0,
          capQuantity: 3,
          price: Math.floor(Math.random() * 400 + 150),
          title: `${model} ${storage} ${colour} Grade ${grade}`,
          createdAt: new Date(Date.now() - Math.random() * 60 * 86400000).toISOString(),
          lastSyncedAt: hasEbayListing ? new Date(Date.now() - Math.random() * 3600000).toISOString() : undefined,
        });
        skuId++;
      });
    });
  });
});

// Generate mock sales
const sales: Sale[] = Array.from({ length: 15 }, (_, i) => {
  const randomSku = skus[Math.floor(Math.random() * skus.length)];
  return {
    id: `SALE-${String(i + 1).padStart(4, "0")}`,
    orderId: `ORD-${String(Math.floor(Math.random() * 999999)).padStart(6, "0")}`,
    skuId: randomSku.id,
    sku: randomSku.sku,
    quantity: Math.floor(Math.random() * 2) + 1,
    buyer: `buyer${Math.floor(Math.random() * 100)}@example.com`,
    saleDate: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
    status: ["PENDING", "SHIPPED", "DELIVERED"][Math.floor(Math.random() * 3)] as Sale["status"],
  };
}).sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());

// Generate activities
const activities: Activity[] = Array.from({ length: 30 }, (_, i) => {
  const types: ActivityType[] = [
    "EBAY_SALE_DETECTED",
    "QUANTITY_REPLENISHED",
    "STOCK_ADJUSTED",
    "SYNC_SUCCESS",
    "SYNC_ERROR",
  ];
  const type = types[Math.floor(Math.random() * types.length)];
  const randomSku = skus[Math.floor(Math.random() * skus.length)];
  
  const messages: Record<ActivityType, string> = {
    EBAY_SALE_DETECTED: `Sale detected: ${Math.floor(Math.random() * 2) + 1}x ${randomSku.sku} (Order #${Math.floor(Math.random() * 999999)})`,
    QUANTITY_REPLENISHED: `eBay quantity replenished: ${randomSku.sku} (${Math.floor(Math.random() * 2) + 1} → 3)`,
    STOCK_ADJUSTED: `Stock added: +${Math.floor(Math.random() * 10) + 5} ${randomSku.sku} (Total: ${randomSku.totalStock})`,
    LISTING_CREATED: `New listing created for ${randomSku.sku}`,
    LISTING_ENDED: `Listing ended for ${randomSku.sku}`,
    SYNC_SUCCESS: "eBay sync completed successfully",
    SYNC_ERROR: "Failed to sync with eBay - retrying in 5 minutes",
    STATUS_CHANGE: `Status changed for ${randomSku.sku}`,
    ERROR: "Connection error with eBay API",
  };
  
  return {
    id: `ACT-${String(i + 1).padStart(4, "0")}`,
    ts: new Date(Date.now() - i * 3600000 * Math.random() * 3).toISOString(),
    type,
    message: messages[type],
  };
}).sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());

export const mockData = {
  skus: [...skus],
  sales: [...sales],
  activities: [...activities],
  syncStatus: {
    lastRun: new Date(Date.now() - 300000).toISOString(),
    status: "idle" as const,
    nextRun: new Date(Date.now() + 300000).toISOString(),
  },
};

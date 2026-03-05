export type ItemStatus = "IN_STOCK" | "LISTED" | "SOLD" | "DAMAGED" | "RETURNED";

export interface Item {
  id: string;
  sku: string;
  groupKey: string;
  title: string;
  status: ItemStatus;
  ebayItemId?: string;
  price: number;
  createdAt: string;
  model: string;
  grade: string;
  storage: string;
  colour: string;
}

export interface GroupRule {
  groupKey: string;
  capLiveListings: number;
  label: string;
}

export type ActivityType =
  | "ORDER_DETECTED"
  | "LISTING_CREATED"
  | "LISTING_ENDED"
  | "STOCK_ADDED"
  | "STATUS_CHANGE"
  | "SYNC_RUN"
  | "ERROR";

export interface Activity {
  id: string;
  ts: string;
  type: ActivityType;
  message: string;
  meta?: Record<string, string>;
}

function makeGroupKey(model: string, grade: string, storage: string, colour: string) {
  return `${model}|${grade}|${storage}|${colour}`;
}

const models = [
  { model: "iPhone 14 Pro", grades: ["A", "B"], storages: ["128GB", "256GB"], colours: ["Space Black", "Gold"] },
  { model: "iPhone 13", grades: ["A", "B"], storages: ["128GB"], colours: ["Midnight", "Blue"] },
  { model: "iPhone 15", grades: ["A"], storages: ["128GB", "256GB"], colours: ["Black", "Blue"] },
  { model: "Samsung S23", grades: ["A", "B"], storages: ["128GB"], colours: ["Phantom Black"] },
];

let itemId = 1;
const items: Item[] = [];

models.forEach(({ model, grades, storages, colours }) => {
  grades.forEach((grade) => {
    storages.forEach((storage) => {
      colours.forEach((colour) => {
        const groupKey = makeGroupKey(model, grade, storage, colour);
        const count = Math.floor(Math.random() * 4) + 1;
        for (let i = 0; i < count; i++) {
          const id = `ITEM-${String(itemId).padStart(4, "0")}`;
          const sku = `${model.replace(/\s+/g, "").substring(0, 6).toUpperCase()}-${grade}-${storage.replace("GB", "")}-${colour.replace(/\s+/g, "").substring(0, 3).toUpperCase()}-${String(itemId).padStart(3, "0")}`;
          
          let status: ItemStatus = "IN_STOCK";
          let ebayItemId: string | undefined;
          if (i === 0 && Math.random() > 0.3) {
            status = "LISTED";
            ebayItemId = `11${String(Math.floor(Math.random() * 9999999999)).padStart(10, "0")}`;
          } else if (i === 1 && Math.random() > 0.6) {
            status = "SOLD";
          }

          items.push({
            id,
            sku,
            groupKey,
            title: `${model} ${storage} ${colour} Grade ${grade}`,
            status,
            ebayItemId,
            price: Math.floor(Math.random() * 400 + 200),
            createdAt: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
            model,
            grade,
            storage,
            colour,
          });
          itemId++;
        }
      });
    });
  });
});

const groupKeys = [...new Set(items.map((i) => i.groupKey))];
const groupRules: GroupRule[] = groupKeys.map((gk) => {
  const parts = gk.split("|");
  return {
    groupKey: gk,
    capLiveListings: 3,
    label: `${parts[0]} / Grade ${parts[1]} / ${parts[2]} / ${parts[3]}`,
  };
});

const activityTypes: ActivityType[] = ["ORDER_DETECTED", "LISTING_CREATED", "LISTING_ENDED", "STOCK_ADDED", "SYNC_RUN", "ERROR"];
const activities: Activity[] = Array.from({ length: 25 }, (_, i) => {
  const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
  const messages: Record<ActivityType, string> = {
    ORDER_DETECTED: `Order detected for ${items[i % items.length]?.sku ?? "UNKNOWN"}`,
    LISTING_CREATED: `New listing created for ${items[i % items.length]?.sku ?? "UNKNOWN"}`,
    LISTING_ENDED: `Listing ended for ${items[i % items.length]?.sku ?? "UNKNOWN"}`,
    STOCK_ADDED: `Stock added: ${items[i % items.length]?.title ?? "Unknown item"}`,
    SYNC_RUN: "eBay sync completed successfully",
    STATUS_CHANGE: `Status changed for ${items[i % items.length]?.sku ?? "UNKNOWN"}`,
    ERROR: "Failed to refresh eBay token – retrying in 60s",
  };
  return {
    id: `ACT-${String(i + 1).padStart(4, "0")}`,
    ts: new Date(Date.now() - i * 3600000 * Math.random() * 5).toISOString(),
    type,
    message: messages[type],
  };
}).sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());

export const mockData = {
  items: [...items],
  groupRules: [...groupRules],
  activities: [...activities],
  syncStatus: {
    lastRun: new Date(Date.now() - 300000).toISOString(),
    status: "idle" as "idle" | "running" | "error",
    nextRun: new Date(Date.now() + 300000).toISOString(),
  },
};

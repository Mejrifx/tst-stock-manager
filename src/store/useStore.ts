import { create } from "zustand";
import { mockData, Item, GroupRule, Activity, ItemStatus, ActivityType } from "@/data/mock";

interface Store {
  items: Item[];
  groupRules: GroupRule[];
  activities: Activity[];
  syncStatus: typeof mockData.syncStatus;
  
  // Actions
  updateItemStatus: (itemId: string, status: ItemStatus) => void;
  updateCapRule: (groupKey: string, cap: number) => void;
  listNextItems: (groupKey: string) => void;
  addActivity: (type: ActivityType, message: string) => void;
}

export const useStore = create<Store>((set, get) => ({
  items: mockData.items,
  groupRules: mockData.groupRules,
  activities: mockData.activities,
  syncStatus: mockData.syncStatus,

  updateItemStatus: (itemId, status) => {
    set((s) => ({
      items: s.items.map((i) => (i.id === itemId ? { ...i, status, ebayItemId: status === "LISTED" ? `11${String(Math.floor(Math.random() * 9999999999)).padStart(10, "0")}` : status === "IN_STOCK" ? undefined : i.ebayItemId } : i)),
    }));
    get().addActivity("STATUS_CHANGE", `Item ${itemId} status changed to ${status}`);
  },

  updateCapRule: (groupKey, cap) => {
    set((s) => ({
      groupRules: s.groupRules.map((r) => (r.groupKey === groupKey ? { ...r, capLiveListings: cap } : r)),
    }));
  },

  listNextItems: (groupKey) => {
    const state = get();
    const rule = state.groupRules.find((r) => r.groupKey === groupKey);
    if (!rule) return;

    const groupItems = state.items.filter((i) => i.groupKey === groupKey);
    const listedCount = groupItems.filter((i) => i.status === "LISTED").length;
    const needed = Math.max(0, rule.capLiveListings - listedCount);

    if (needed === 0) return;

    const inStock = groupItems.filter((i) => i.status === "IN_STOCK").slice(0, needed);

    set((s) => ({
      items: s.items.map((i) => {
        const match = inStock.find((is) => is.id === i.id);
        if (match) {
          return { ...i, status: "LISTED" as ItemStatus, ebayItemId: `11${String(Math.floor(Math.random() * 9999999999)).padStart(10, "0")}` };
        }
        return i;
      }),
    }));

    inStock.forEach((item) => {
      get().addActivity("LISTING_CREATED", `Auto-listed ${item.sku} to fill cap for ${rule.label}`);
    });
  },

  addActivity: (type, message) => {
    const activity: Activity = {
      id: `ACT-${Date.now()}`,
      ts: new Date().toISOString(),
      type,
      message,
    };
    set((s) => ({ activities: [activity, ...s.activities] }));
  },
}));

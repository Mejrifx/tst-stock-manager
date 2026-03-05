# 🎯 Quick Start Checklist

## Step 1: Clear Mock Data (1 minute)

1. Go to Supabase SQL Editor
2. Copy/paste from: `supabase-clear-data.sql`
3. Run it
4. ✅ All test data deleted

---

## Step 2: Set Up Business Policies (5 minutes)

Follow: **BUSINESS_POLICIES_SETUP.md**

Quick steps:
1. Go to eBay Seller Hub → Business Policies
2. Create Payment, Return, Fulfillment policies
3. Copy the 3 policy IDs
4. For now: Edit `src/components/CreateListing.tsx` lines 55-57 with your IDs

---

## Step 3: Create Your First Listing (2 minutes)

1. Wait for deploy (check Netlify)
2. Go to Settings page
3. Scroll to **"Create eBay Listing"**
4. Fill in:
   - SKU: `IPHONE12-A-128-BLK`
   - Title: `Apple iPhone 12 128GB Black - Grade A - Unlocked`
   - Price: `299.99`
   - Quantity: `3`
5. Click "Create Listing on eBay"
6. ✅ Done!

---

## Step 4: Verify (1 minute)

Check these places:

✅ **Admin Panel**:
- Dashboard shows 1 SKU, 3 in stock
- Inventory shows the listing
- eBay Listings shows it linked

✅ **eBay**:
- Go to Seller Hub → Active Listings
- See your new listing with quantity 3

✅ **Auto-sync**:
- Make a test purchase on eBay
- Wait 5 minutes
- Admin panel updates automatically
- eBay replenishes to 3

---

## For Your Existing Listings

Use **Manual Import** tool:
1. Go to Settings → Manual Import
2. Get listing IDs from eBay
3. Paste in CSV format
4. Import
5. ✅ All tracked!

---

## 🎉 You're Live!

From now on:
- Create new listings via admin panel → Fully automatic
- Existing listings → Import once, then automatic
- Sales detection → Every 5 minutes
- Quantity replenishment → Automatic
- Stock tracking → Real-time

Everything is now production-ready! 🚀

# eBay Listing Auto-Discovery Guide

## 🎯 How It Works

### The Workflow
1. **You create listings on eBay** (sandbox or production)
2. **Click "Discover Listings"** in Settings
3. **System automatically links** eBay listings to your SKUs
4. **Auto-sync begins** tracking sales and replenishing quantities

## 📋 Step-by-Step Setup

### Step 1: Create eBay Listings

1. **Go to eBay Sandbox**: https://sandbox.ebay.com
2. **Create a listing**:
   - Title: "iPhone XR 64GB Black Grade A"
   - **Important**: Set Custom Label (SKU) to match your database SKU exactly
     - Example: `IPHONEXR-A-64-BLK`
   - Set Quantity: 3
   - Set Price: £199.99
   - Publish listing

3. **Repeat for more products** (optional)

### Step 2: Connect to eBay

1. Go to **Settings** page in your admin panel
2. Click **"Connect to eBay"**
3. Log in and authorize
4. You should see "Connected" status

### Step 3: Discover Listings

1. Click **"Discover Listings"** button
2. Wait for the discovery process (usually 2-5 seconds)
3. You'll see a success message: "Discovered X listings!"

### Step 4: Verify

1. Go to **eBay Listings** page
2. You should see your linked listings
3. Check that:
   - ✅ eBay ID is shown
   - ✅ Listed quantity shows 3
   - ✅ "At cap" badge appears

## 🔍 What Gets Matched

The system matches eBay listings to your SKUs by:
- **SKU Code**: Must match exactly (case-sensitive)
- **Active Listings**: Only published, active listings
- **Inventory API**: Uses eBay's Inventory API

## 📊 What You'll See

### In Activity Log:
```
✅ Auto-linked IPHONEXR-A-64-BLK → eBay listing (ID: 110123456789)
✅ eBay listing discovery: 3 linked, 0 unmatched, 0 errors
```

### In eBay Listings Page:
- All linked SKUs with their eBay listing IDs
- Current quantity on eBay
- Cap status (at cap / needs replenishment)

### In Inventory Page:
- eBay ID column populated
- Listed Qty shows current eBay quantity
- Last Synced timestamp updated

## ⚠️ Troubleshooting

### "No eBay listings found"
- Make sure you've created listings on eBay
- Verify you're connected to the right environment (sandbox/production)
- Check that listings are published and active

### "X unmatched SKUs"
- The eBay SKU doesn't match any SKU in your database
- Double-check the Custom Label (SKU) in your eBay listing
- Make sure it matches exactly: `IPHONEXR-A-64-BLK` ≠ `iphonexr-a-64-blk`

### "Discovery failed"
- Check console for detailed error
- Make sure you're connected to eBay
- Verify your eBay API scopes include `sell.inventory`

## 🔄 Re-Discovery

You can click "Discover Listings" anytime to:
- Find newly created eBay listings
- Update quantities for existing listings
- Re-link listings that were previously unlinked

## 🚀 Next Steps

Once listings are discovered:
1. **Test the sync** - Make a test purchase on eBay sandbox
2. **Watch replenishment** - System should auto-replenish to 3 units
3. **Check sales** - View detected sales in Sales page
4. **Monitor activity** - All actions logged in Activity page

## 💡 Production Tips

When moving to production:
1. Update environment variables to production credentials
2. Create real eBay listings with your product SKUs
3. Run "Discover Listings" once
4. Enable auto-sync
5. Monitor the first few sales to verify everything works

---

**Note**: Discovery only needs to run once per listing. After that, the auto-sync worker handles everything automatically!

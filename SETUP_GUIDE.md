# eBay OAuth Setup Guide

## Current Status
✅ App deployed to Netlify: https://tstgroupstock.netlify.app/
✅ eBay Sandbox credentials configured
✅ RuName exists: `TSTgroup-TSTgroup-AutoSt-bmdtgpwp`

## What You Need to Do (Step by Step)

### Step 1: Configure eBay Developer Portal (MOST IMPORTANT)

1. Go to: https://developer.ebay.com/my/auth/?env=sandbox&index=0
2. Find your RuName: `TSTgroup-TSTgroup-AutoSt-bmdtgpwp`
3. Click "Edit" or update the settings
4. Set **"Your auth accepted URL"** to:
   ```
   https://tstgroupstock.netlify.app/auth/ebay/callback
   ```
5. Click **Save**

**Why?** This tells eBay where to redirect users after they authorize your app.

### Step 2: Add Environment Variables to Netlify

1. Go to: https://app.netlify.com/sites/tstgroupstock/settings/deploys#environment-variables
2. Click **"Add a variable"** for each of these:

| Key | Value |
|-----|-------|
| `VITE_EBAY_CLIENT_ID` | Your eBay App ID (Client ID) from developer portal |
| `VITE_EBAY_CLIENT_SECRET` | Your eBay Cert ID (Client Secret) from developer portal |
| `VITE_EBAY_REDIRECT_URI` | `https://tstgroupstock.netlify.app/auth/ebay/callback` |
| `VITE_EBAY_ENVIRONMENT` | `sandbox` |

3. Click **Save**
4. Click **"Trigger deploy"** → **"Deploy site"** to rebuild with new environment variables

**Why?** Netlify needs these credentials to connect to eBay from your live site.

### Step 3: Test the Connection

1. Go to: https://tstgroupstock.netlify.app/settings
2. You should see "Connection Status" with a **"Connect to eBay"** button
3. Click **"Connect to eBay"**
4. You'll be redirected to eBay Sandbox to authorize
5. After authorizing, you'll be redirected back to your app
6. Status should show: **"Connected"** ✅

### Step 4: Create Test Listings on eBay Sandbox

1. Go to: https://sandbox.ebay.com (log in with sandbox seller account)
2. Create listings manually with these SKUs (from your admin panel):
   - `IPHONEXR-A-64-BLK`
   - `IPHONE11-A-128-BLK`
   - etc. (any SKUs shown in your Inventory page)
3. Set quantity to any number (system will detect and manage the 3-unit cap)

### Step 5: Enable Auto-Sync

1. In your app → Settings
2. Toggle **"Auto-Sync"** to **ON**
3. The system will now:
   - Poll eBay every 5 minutes for new orders
   - Detect sales and update stock
   - Automatically replenish listings back to 3 units

## Understanding the Flow

```
User visits: https://tstgroupstock.netlify.app/settings
             ↓
Clicks: "Connect to eBay"
             ↓
Redirected to: eBay Sandbox authorization page
             ↓
User authorizes app
             ↓
eBay redirects to: https://tstgroupstock.netlify.app/auth/ebay/callback
             ↓
App exchanges code for refresh token
             ↓
Token stored in browser localStorage
             ↓
Status shows: "Connected" ✅
```

## Local Development (Optional)

If you want to test locally before deploying:

1. Your `.env.local` is already configured for localhost
2. Update eBay Developer Portal to ALSO accept:
   ```
   http://localhost:8080/auth/ebay/callback
   ```
3. Run: `npm run dev`
4. Test at: http://localhost:8080

## Troubleshooting

**"Not Connected" Status**
- Check Netlify environment variables are set
- Verify eBay auth accepted URL matches exactly
- Check browser console for errors

**OAuth Redirect Error**
- Verify the callback URL in eBay portal matches Netlify URL exactly
- Make sure you clicked "Save" in eBay developer portal
- Try reconnecting after 5 minutes (eBay caching)

**Listings Not Syncing**
- Make sure Auto-Sync is enabled in Settings
- Check that listing SKUs match exactly (case-sensitive)
- Look at Activity Log for SYNC_ERROR messages

## Next Steps After Connection

1. **View Dashboard**: See total stock, listed quantity, sales
2. **Check Inventory**: All your SKUs with current stock levels
3. **Monitor Activity**: Watch sync events in real-time
4. **Place Test Order**: Buy an item on eBay Sandbox
5. **Watch Magic**: System detects sale, updates stock, replenishes to 3 units!

## Important Notes

- **RuName** is just eBay's name for your OAuth redirect URL configuration
- You DON'T need to create a new RuName - you already have one!
- You just need to configure WHERE it redirects (Netlify URL)
- The same app can work on both localhost (dev) and Netlify (prod)

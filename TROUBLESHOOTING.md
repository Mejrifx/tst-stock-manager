# Supabase Integration Troubleshooting

## Current Issue: ERR_NAME_NOT_RESOLVED

The error `ppsisuneglamanuqsnulh.supabase.co/rest/v1/...` shows the Supabase URL is missing the `https://` protocol.

### Root Cause

The Netlify environment variable `VITE_SUPABASE_URL` is likely set **without** the `https://` protocol prefix.

### Solution

1. **Go to Netlify Dashboard**:
   - Navigate to your site: https://app.netlify.com/sites/tstgroupstock
   - Click **Site Settings** → **Environment Variables**

2. **Check/Update VITE_SUPABASE_URL**:
   - **Current (incorrect)**: `ppsisuneglamanuqsnulh.supabase.co`
   - **Should be**: `https://ppsisuneglamanuqsnulh.supabase.co`

3. **Verify all 3 Supabase variables are set correctly**:
   ```
   VITE_SUPABASE_URL=https://ppsisuneglamanuqsnulh.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwc2lzdW5lZ2xtYW51cXNudWxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MTk0NDUsImV4cCI6MjA4ODI5NTQ0NX0.9GkIMT3WYEYzAZX0-wPO3Sk0quD3UIWn_m_r22xB8UA
   VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwc2lzdW5lZ2xtYW51cXNudWxoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjcxOTQ0NSwiZXhwIjoyMDg4Mjk1NDQ1fQ.sOWXI1eBX-tdvOcbuyqk39AsSxegnrxTGu0Q39PS62I
   ```

4. **Trigger a new deploy**:
   - After updating, click **Save**
   - Netlify will automatically trigger a new deploy
   - Wait 1-2 minutes for the build to complete

5. **Refresh your browser** and the app should work!

## What to Expect After Fix

✅ Dashboard loads with SKU counts  
✅ Inventory page shows 20 test SKUs  
✅ Settings page displays sync status  
✅ Activity log shows database initialization  
✅ No more ERR_NAME_NOT_RESOLVED errors  

## Additional Fixes in This Commit

- Fixed `syncStatus?.last_run` instead of `syncStatus.lastRun`
- Fixed `sku.ebay_listing_id` instead of `sku.ebayListingId`
- Fixed `sku.ebay_listed_quantity` instead of `sku.ebayListedQuantity`
- Fixed `sku.cap_quantity` instead of `sku.capQuantity`
- Fixed `sku.available_stock` instead of `sku.availableStock`
- Fixed `a.created_at` instead of `a.ts` for activity timestamps
- Added null safety checks for syncStatus throughout the app

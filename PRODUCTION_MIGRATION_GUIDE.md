# 🚀 Moving to Production - Complete Checklist

## ⚠️ CRITICAL: Read This First

Moving to production means:
- ✅ Real money transactions
- ✅ Real customer orders
- ✅ Live inventory changes
- ⚠️ Mistakes can affect real customers
- ⚠️ Test thoroughly with low-value items first

---

## Phase 1: eBay Production App Setup

### Step 1.1: Create Production Application

1. **Go to eBay Developer Program**: https://developer.ebay.com/my/keys
2. **Switch to "Production" environment** (top right toggle)
3. **Create a new Keyset** (or use existing production keys)
4. **Note down**:
   - ✅ App ID (Client ID)
   - ✅ Cert ID (Client Secret)

### Step 1.2: Configure OAuth Settings

1. **Click "User Tokens"** → **Get OAuth Credentials**
2. **Configure your app**:
   - **Grant Application** section
   - Click "Edit" on your production app
3. **Set Redirect URI**:
   ```
   https://tstgroupstock.netlify.app/auth/ebay/callback
   ```
4. **Confirm OAuth is enabled** for:
   - ✅ Auth 'n' Auth (User Token)
   
### Step 1.3: Request API Scopes

**CRITICAL**: Your production app needs these scopes enabled:

Required Scopes:
```
https://api.ebay.com/oauth/api_scope/sell.inventory
https://api.ebay.com/oauth/api_scope/sell.fulfillment
https://api.ebay.com/oauth/api_scope/sell.account
```

**How to enable**:
1. Go to your app settings
2. Under "OAuth scopes", check these 3 scopes are selected
3. If not available, you may need to request them from eBay
4. Some scopes require eBay approval (can take 1-2 business days)

### Step 1.4: Grant Application Access

1. Still in your app settings
2. Look for "Grant Application Access" or "RuName"
3. **Create RuName** if you don't have one:
   - Name: `production-oauth`
   - Redirect URL: `https://tstgroupstock.netlify.app/auth/ebay/callback`
   - Privacy Policy URL: (your privacy policy)
4. **Save and note the RuName**

---

## Phase 2: Update Environment Variables

### Step 2.1: Update Netlify Environment Variables

Go to: https://app.netlify.com/sites/tstgroupstock/configuration/env

**Replace these 3 variables**:

```bash
# CHANGE THIS
VITE_EBAY_CLIENT_ID=[YOUR_PRODUCTION_CLIENT_ID]

# CHANGE THIS
VITE_EBAY_CLIENT_SECRET=[YOUR_PRODUCTION_CLIENT_SECRET]

# CHANGE THIS - VERY IMPORTANT
VITE_EBAY_ENVIRONMENT=production

# These stay the same
VITE_EBAY_REDIRECT_URI=https://tstgroupstock.netlify.app/auth/ebay/callback
VITE_SUPABASE_URL=https://ppsisuneglmanuqsnulh.supabase.co
VITE_SUPABASE_ANON_KEY=[existing value]
VITE_SUPABASE_SERVICE_ROLE_KEY=[existing value]
```

### Step 2.2: Update Local .env.local (Optional)

Only if you want to test production locally:

```bash
VITE_EBAY_CLIENT_ID=[PRODUCTION_CLIENT_ID]
VITE_EBAY_CLIENT_SECRET=[PRODUCTION_CLIENT_SECRET]
VITE_EBAY_REDIRECT_URI=http://localhost:8080/auth/ebay/callback
VITE_EBAY_ENVIRONMENT=production
```

**⚠️ Warning**: Testing production locally means real API calls!

### Step 2.3: Trigger Netlify Deploy

After updating env vars:
1. Netlify will auto-redeploy (wait 2-3 minutes)
2. OR push an empty commit to force deploy:
   ```bash
   git commit --allow-empty -m "Switch to production eBay environment"
   git push
   ```

---

## Phase 3: Prepare Your eBay Store

### Step 3.1: Choose Test Products

**Start with 1-2 low-value items**:
- ✅ Already have in stock
- ✅ Low price (£10-50)
- ✅ Easy to manage
- ❌ NOT high-value items
- ❌ NOT items with tight margins

### Step 3.2: Create Test Listings on eBay

1. **Go to eBay.com** (not sandbox!)
2. **Create listing**:
   - Use your SKU format: `TESTPRODUCT-A-01-BLK`
   - Set quantity to 3
   - Price reasonably
   - Add all required fields
3. **Publish listing**
4. **Note the Item ID** (from URL)

### Step 3.3: Verify Listings Are Live

- Check they're visible on eBay.com
- Verify SKU is set correctly in listing details
- Confirm quantity shows as 3

---

## Phase 4: Testing & Verification

### Step 4.1: Connect to Production eBay

1. **Clear browser cache** (important!)
2. **Go to your admin panel**: https://tstgroupstock.netlify.app
3. **Settings** → **Connect to eBay**
4. **Log in with your REAL eBay seller account**
5. **Authorize the app**
6. **Verify**: Should show "Connected" with "production" badge

### Step 4.2: Discover Production Listings

1. **Click "Discover Listings"**
2. **Wait for discovery to complete**
3. **Check results**:
   - Should see: "Discovered X listings!"
   - Or: "Created X new SKUs!"
4. **Verify in Activity Log**

### Step 4.3: Check eBay Listings Page

1. **Go to eBay Listings page**
2. **Verify**:
   - ✅ Your test SKU(s) appear
   - ✅ eBay ID is shown
   - ✅ Quantity shows 3
   - ✅ Status shows "At cap"

### Step 4.4: Test Purchase Flow

**IMPORTANT**: Use a personal buyer account (not your seller account)

1. **Make a test purchase**:
   - Buy 1 unit from your test listing
   - Complete payment
2. **Wait 2-5 minutes**
3. **Check admin panel**:
   - Dashboard: Sold Today should show 1
   - Sales page: Should show the order
   - Activity: Should log the sale
4. **Wait for auto-sync** (up to 5 minutes)
5. **Verify replenishment**:
   - eBay listing should show 3 units again
   - Admin panel total stock should decrease by 1
   - Activity log should show replenishment

### Step 4.5: Manual Sync Test

1. **Settings** → **Sync Now**
2. **Check for errors in console**
3. **Verify sync status updates**

---

## Phase 5: Safety Measures

### What to Monitor

**For the first 24 hours**:
- ✅ Check Activity log every few hours
- ✅ Verify quantities match between eBay and admin
- ✅ Watch for sync errors
- ✅ Monitor customer orders

**If something goes wrong**:
1. **Settings** → **Disconnect from eBay** (stops auto-sync)
2. Check console for errors
3. Report issues immediately

### Emergency Rollback

If you need to go back to sandbox:
1. **Netlify env vars**: Change `VITE_EBAY_ENVIRONMENT=sandbox`
2. **Restore sandbox credentials**
3. **Trigger redeploy**

---

## Phase 6: Scale Up

Once testing is successful:
1. **Add more SKUs gradually** (5-10 at a time)
2. **Run "Discover Listings"** after adding new eBay products
3. **Monitor for 48 hours** before full rollout
4. **Set up alerts** (future feature) for stock issues

---

## 📋 Pre-Flight Checklist

Before switching to production, confirm:

### eBay Setup
- [ ] Production app created in eBay Developer Portal
- [ ] OAuth redirect URI configured: `https://tstgroupstock.netlify.app/auth/ebay/callback`
- [ ] API scopes approved: sell.inventory, sell.fulfillment, sell.account
- [ ] RuName created and configured
- [ ] At least 1 test listing live on eBay

### Environment Variables
- [ ] Production Client ID in Netlify
- [ ] Production Client Secret in Netlify
- [ ] VITE_EBAY_ENVIRONMENT=production in Netlify
- [ ] Netlify successfully redeployed

### Testing Plan
- [ ] Test products identified (low-value)
- [ ] Personal buyer account ready for test purchase
- [ ] Willing to spend £10-50 on test transaction
- [ ] Ready to monitor for 24 hours

### Safety
- [ ] Understand how to disconnect eBay if needed
- [ ] Know how to rollback to sandbox
- [ ] Have console open for error monitoring

---

## 🆘 Troubleshooting

### "OAuth error" or "Invalid credentials"
- ✅ Double-check Client ID/Secret are production keys
- ✅ Verify environment is set to 'production'
- ✅ Check redirect URI matches exactly

### "Scope error" or "Insufficient permissions"
- ✅ Verify API scopes are approved in eBay app
- ✅ May need to re-authorize after scope changes

### "No listings found"
- ✅ Make sure listings are on eBay.com (not sandbox)
- ✅ Verify SKU is set in listing
- ✅ Check listings are active/published

### Sync not working
- ✅ Check Activity log for error messages
- ✅ Verify OAuth token hasn't expired
- ✅ Check console for CORS errors
- ✅ May need to reconnect to eBay

---

## What I Need From You Now

To proceed, please provide:

1. **Production eBay Credentials**:
   - Production Client ID (App ID)
   - Production Client Secret (Cert ID)

2. **Confirmations**:
   - [ ] I have created a production app on eBay Developer Portal
   - [ ] I have configured the OAuth redirect URI
   - [ ] I have requested/enabled the 3 required API scopes
   - [ ] I understand this will use real money for testing
   - [ ] I have 1-2 test products ready to list

3. **Testing Readiness**:
   - [ ] I'm ready to create a test listing on eBay.com
   - [ ] I'm ready to make a test purchase (£10-50)
   - [ ] I can monitor the system for the next 24 hours

Once you provide the credentials and confirmations, I'll update the environment variables and we'll switch to production! 🚀

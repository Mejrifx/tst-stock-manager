# Setting Up eBay Business Policies

Before you can create listings programmatically via the Inventory API, you need to set up **Business Policies** in eBay Seller Hub. These are reusable templates for:
- Payment methods
- Return policies  
- Shipping/fulfillment options

## ⚠️ One-Time Setup (5 minutes)

### Step 1: Go to Business Policies

1. Log in to **eBay Seller Hub**: https://www.ebay.com/sh/landing
2. Click **Account** (top right) → **Business Policies**
3. Or go directly: https://www.ebay.com/sh/ovw/businessPolicies

---

### Step 2: Create Payment Policy

1. Click **Create policy** under **Payment**
2. Fill in:
   - **Policy name**: "Standard Payment"
   - **Payment methods**: Check "PayPal" and "Credit/Debit Cards"
   - **Require immediate payment**: ✅ (recommended)
3. Click **Save**
4. **Copy the Policy ID** (it will look like: `6030067012`)

---

### Step 3: Create Return Policy

1. Click **Create policy** under **Return**
2. Fill in:
   - **Policy name**: "30 Day Returns"
   - **Returns accepted**: ✅
   - **Return period**: 30 days
   - **Refund method**: Money back
   - **Return shipping**: Buyer pays
3. Click **Save**
4. **Copy the Policy ID**

---

### Step 4: Create Fulfillment Policy (Shipping)

1. Click **Create policy** under **Shipping**
2. Fill in:
   - **Policy name**: "Standard Shipping"
   - **Domestic shipping service**: USPS Priority Mail (or your preferred service)
   - **Cost**: Set your shipping cost or "Free"
   - **Handling time**: 1 business day (or your handling time)
3. Click **Save**
4. **Copy the Policy ID**

---

### Step 5: Add Policy IDs to Your System

**Option A: Via Supabase (Recommended)**

Run this SQL in Supabase:

```sql
-- Add your actual policy IDs from eBay
UPDATE settings 
SET value = 'YOUR_PAYMENT_POLICY_ID' 
WHERE key = 'ebay_payment_policy_id';

UPDATE settings 
SET value = 'YOUR_RETURN_POLICY_ID' 
WHERE key = 'ebay_return_policy_id';

UPDATE settings 
SET value = 'YOUR_FULFILLMENT_POLICY_ID' 
WHERE key = 'ebay_fulfillment_policy_id';

-- If these rows don't exist, insert them:
INSERT INTO settings (key, value)
VALUES 
  ('ebay_payment_policy_id', 'YOUR_PAYMENT_POLICY_ID'),
  ('ebay_return_policy_id', 'YOUR_RETURN_POLICY_ID'),
  ('ebay_fulfillment_policy_id', 'YOUR_FULFILLMENT_POLICY_ID')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

**Option B: Hardcode for Now (Quick Test)**

Edit `src/components/CreateListing.tsx` and replace:
- `YOUR_PAYMENT_POLICY_ID` → Your actual payment policy ID
- `YOUR_RETURN_POLICY_ID` → Your actual return policy ID
- `YOUR_FULFILLMENT_POLICY_ID` → Your actual fulfillment policy ID

---

## 🎯 After Setup

Once policies are configured, you can:
1. Go to Settings page
2. Scroll to **"Create eBay Listing"** section
3. Fill in SKU, title, price
4. Click "Create Listing on eBay"
5. ✅ **Listing is created AND tracked automatically!**

---

## 🔍 Finding Policy IDs

If you can't find the policy IDs in the UI:

### Method 1: Via eBay API (Developer Portal)
1. Go to: https://developer.ebay.com/my/api_test_tool
2. Select your app
3. Call: `GET /sell/account/v1/fulfillment_policy`
4. Response will show all policy IDs

### Method 2: Via Network Inspector
1. Open eBay Business Policies page
2. Open browser DevTools (F12) → Network tab
3. Click on a policy to edit it
4. Look for XHR requests containing policy IDs

---

## 📝 Notes

- **US Marketplace**: These policies are for `EBAY_US` by default
- **Other marketplaces**: You'll need separate policies for UK, DE, etc.
- **Reusable**: Create once, use for all listings
- **Can be changed**: Edit policies anytime in Seller Hub

---

## ✅ You're Ready!

Once you've added your policy IDs, creating listings will work automatically. The system will:
- Create inventory item on eBay
- Publish as active listing
- Add to your admin panel
- Monitor for sales automatically
- Replenish to cap (3) when sales occur

Perfect automation! 🚀

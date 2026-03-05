# Supabase Setup Guide

## Step 1: Run the SQL Schema

1. Go to your Supabase project: https://supabase.com/dashboard/project/ppsisuneglamanuqsnulh
2. Click on **SQL Editor** in the left sidebar
3. Click **"New Query"**
4. Copy the entire contents of `supabase-schema.sql` file
5. Paste it into the SQL editor
6. Click **"Run"** (or press Cmd/Ctrl + Enter)
7. You should see: `Database schema created successfully!`

## Step 2: Verify Tables Were Created

1. Click on **"Table Editor"** in the left sidebar
2. You should see these tables:
   - `skus` - Your inventory
   - `sales` - Order history  
   - `activities` - Activity log
   - `sync_status` - Sync state
   - `settings` - App configuration

## Step 3: Add Environment Variables to Netlify

Go to: https://app.netlify.com/sites/tstgroupstock/settings/deploys#environment-variables

Add these 3 new variables:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | `https://ppsisuneglamanuqsnulh.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your anon key from Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key from Supabase |

Then click **"Trigger deploy"** to rebuild.

## Step 4: Seed Initial Data (Optional)

You can add some test SKUs manually in Supabase Table Editor:

1. Click on `skus` table
2. Click **"Insert row"**
3. Fill in:
   - `sku`: `IPHONEXR-A-64-BLK`
   - `model`: `iPhone XR`
   - `grade`: `A`
   - `storage`: `64GB`
   - `colour`: `Black`
   - `total_stock`: `20`
   - `available_stock`: `20`
   - `ebay_listed_quantity`: `0`
   - `cap_quantity`: `3`
   - `price`: `199.99`
   - `title`: `iPhone XR 64GB Black Grade A`
4. Click **"Save"**

Or use SQL to bulk insert test data (coming in next step).

## What's Next

After running the schema, the app will be updated to:
1. Read inventory from Supabase instead of mock data
2. Store sales in the database
3. Log activities to database
4. Persist sync status

The sync worker will then be able to run 24/7 in Netlify Functions!

-- Clear all test/mock data from database
-- Run this in Supabase SQL Editor

-- Delete all activities
DELETE FROM activities;

-- Delete all sales
DELETE FROM sales;

-- Delete all SKUs (the 20 test ones)
DELETE FROM skus;

-- Reset sync status
DELETE FROM sync_status;

-- Verify everything is clean
SELECT 'SKUs' as table_name, COUNT(*) as remaining FROM skus
UNION ALL
SELECT 'Sales', COUNT(*) FROM sales
UNION ALL
SELECT 'Activities', COUNT(*) FROM activities
UNION ALL
SELECT 'Sync Status', COUNT(*) FROM sync_status;

-- You should see 0 for everything

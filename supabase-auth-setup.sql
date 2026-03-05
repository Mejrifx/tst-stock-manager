-- Enable authentication
-- This SQL should be run in your Supabase SQL Editor

-- 1. Enable RLS on all tables (already done, but ensuring)
ALTER TABLE skus ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies (if any)
DROP POLICY IF EXISTS "Allow all operations on skus" ON skus;
DROP POLICY IF EXISTS "Allow all operations on sales" ON sales;
DROP POLICY IF EXISTS "Allow all operations on activities" ON activities;
DROP POLICY IF EXISTS "Allow all operations on sync_status" ON sync_status;
DROP POLICY IF EXISTS "Allow all operations on settings" ON settings;

-- 3. Create new policies that require authentication
CREATE POLICY "Authenticated users can manage skus" ON skus
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage sales" ON sales
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage activities" ON activities
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage sync_status" ON sync_status
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage settings" ON settings
  FOR ALL USING (auth.role() = 'authenticated');

-- 4. Enable email confirmations (optional - set to false for testing)
-- Go to: Authentication → Settings → Email Auth → Confirm email = ON

-- Success message
SELECT 'Authentication policies created! Now enable Email Auth in Supabase dashboard.' AS message;

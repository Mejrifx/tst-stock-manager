-- eBay Stock Manager Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ppsisuneglamanuqsnulh/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- SKUs Table (Your Inventory)
CREATE TABLE skus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT UNIQUE NOT NULL,
  model TEXT NOT NULL,
  grade TEXT NOT NULL,
  storage TEXT NOT NULL,
  colour TEXT NOT NULL,
  
  -- Inventory quantities
  total_stock INTEGER NOT NULL DEFAULT 0,
  reserved_stock INTEGER NOT NULL DEFAULT 0,
  available_stock INTEGER NOT NULL DEFAULT 0,
  
  -- eBay integration
  ebay_listing_id TEXT,
  ebay_listed_quantity INTEGER NOT NULL DEFAULT 0,
  cap_quantity INTEGER NOT NULL DEFAULT 3,
  
  -- Metadata
  price DECIMAL(10, 2) NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sales Table (Order History)
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT NOT NULL,
  sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  buyer TEXT NOT NULL,
  sale_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activities Table (Audit Log)
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN (
    'EBAY_SALE_DETECTED',
    'QUANTITY_REPLENISHED',
    'STOCK_ADJUSTED',
    'LISTING_CREATED',
    'LISTING_ENDED',
    'SYNC_SUCCESS',
    'SYNC_ERROR',
    'STATUS_CHANGE',
    'ERROR'
  )),
  message TEXT NOT NULL,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sync Status Table (Track sync state)
CREATE TABLE sync_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  last_run TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('idle', 'running', 'error')),
  next_run TIMESTAMPTZ NOT NULL,
  error_message TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Settings Table (App configuration)
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_skus_sku ON skus(sku);
CREATE INDEX idx_skus_ebay_listing_id ON skus(ebay_listing_id);
CREATE INDEX idx_sales_sku_id ON sales(sku_id);
CREATE INDEX idx_sales_order_id ON sales(order_id);
CREATE INDEX idx_sales_sale_date ON sales(sale_date DESC);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX idx_activities_type ON activities(type);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_skus_updated_at BEFORE UPDATE ON skus
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sync_status_updated_at BEFORE UPDATE ON sync_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial sync status
INSERT INTO sync_status (last_run, status, next_run)
VALUES (NOW() - INTERVAL '5 minutes', 'idle', NOW() + INTERVAL '5 minutes');

-- Insert initial settings
INSERT INTO settings (key, value) VALUES
  ('sync_interval_minutes', '5'::jsonb),
  ('auto_sync_enabled', 'true'::jsonb),
  ('ebay_refresh_token', 'null'::jsonb);

-- Enable Row Level Security (RLS)
ALTER TABLE skus ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - you can tighten these later)
CREATE POLICY "Allow all operations on skus" ON skus FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on sales" ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on activities" ON activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on sync_status" ON sync_status FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on settings" ON settings FOR ALL USING (true) WITH CHECK (true);

-- Success message
SELECT 'Database schema created successfully!' AS message;

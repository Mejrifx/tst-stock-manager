-- Seed Test Data for eBay Stock Manager
-- Run this in Supabase SQL Editor after creating the schema

-- Insert test SKUs
INSERT INTO skus (sku, model, grade, storage, colour, total_stock, reserved_stock, available_stock, ebay_listed_quantity, cap_quantity, price, title) VALUES
  ('IPHONEXR-A-64-BLK', 'iPhone XR', 'A', '64GB', 'Black', 20, 0, 20, 0, 3, 199.99, 'iPhone XR 64GB Black Grade A'),
  ('IPHONEXR-A-64-WHT', 'iPhone XR', 'A', '64GB', 'White', 15, 0, 15, 0, 3, 199.99, 'iPhone XR 64GB White Grade A'),
  ('IPHONEXR-B-64-BLK', 'iPhone XR', 'B', '64GB', 'Black', 10, 0, 10, 0, 3, 179.99, 'iPhone XR 64GB Black Grade B'),
  ('IPHONE11-A-128-BLK', 'iPhone 11', 'A', '128GB', 'Black', 18, 0, 18, 0, 3, 299.99, 'iPhone 11 128GB Black Grade A'),
  ('IPHONE11-A-128-WHT', 'iPhone 11', 'A', '128GB', 'White', 12, 0, 12, 0, 3, 299.99, 'iPhone 11 128GB White Grade A'),
  ('IPHONE11-B-128-BLK', 'iPhone 11', 'B', '128GB', 'Black', 8, 0, 8, 0, 3, 279.99, 'iPhone 11 128GB Black Grade B'),
  ('IPHONE12-A-128-BLK', 'iPhone 12', 'A', '128GB', 'Black', 25, 0, 25, 0, 3, 399.99, 'iPhone 12 128GB Black Grade A'),
  ('IPHONE12-A-128-BLU', 'iPhone 12', 'A', '128GB', 'Blue', 20, 0, 20, 0, 3, 399.99, 'iPhone 12 128GB Blue Grade A'),
  ('IPHONE12-B-128-BLK', 'iPhone 12', 'B', '128GB', 'Black', 14, 0, 14, 0, 3, 379.99, 'iPhone 12 128GB Black Grade B'),
  ('IPHONE13-A-128-MID', 'iPhone 13', 'A', '128GB', 'Midnight', 22, 0, 22, 0, 3, 499.99, 'iPhone 13 128GB Midnight Grade A'),
  ('IPHONE13-A-256-MID', 'iPhone 13', 'A', '256GB', 'Midnight', 16, 0, 16, 0, 3, 549.99, 'iPhone 13 256GB Midnight Grade A'),
  ('IPHONE13-B-128-MID', 'iPhone 13', 'B', '128GB', 'Midnight', 10, 0, 10, 0, 3, 479.99, 'iPhone 13 128GB Midnight Grade B'),
  ('IPHONE14-A-128-MID', 'iPhone 14', 'A', '128GB', 'Midnight', 18, 0, 18, 0, 3, 599.99, 'iPhone 14 128GB Midnight Grade A'),
  ('IPHONE14-A-256-MID', 'iPhone 14', 'A', '256GB', 'Midnight', 12, 0, 12, 0, 3, 649.99, 'iPhone 14 256GB Midnight Grade A'),
  ('IPHONE14PRO-A-256-BLK', 'iPhone 14 Pro', 'A', '256GB', 'Space Black', 15, 0, 15, 0, 3, 799.99, 'iPhone 14 Pro 256GB Space Black Grade A'),
  ('IPHONE14PRO-A-512-BLK', 'iPhone 14 Pro', 'A', '512GB', 'Space Black', 8, 0, 8, 0, 3, 899.99, 'iPhone 14 Pro 512GB Space Black Grade A'),
  ('IPHONE15-A-128-BLK', 'iPhone 15', 'A', '128GB', 'Black', 20, 0, 20, 0, 3, 699.99, 'iPhone 15 128GB Black Grade A'),
  ('IPHONE15-A-256-BLK', 'iPhone 15', 'A', '256GB', 'Black', 14, 0, 14, 0, 3, 749.99, 'iPhone 15 256GB Black Grade A'),
  ('SAMSUNGS23-A-128-BLK', 'Samsung S23', 'A', '128GB', 'Phantom Black', 16, 0, 16, 0, 3, 449.99, 'Samsung S23 128GB Phantom Black Grade A'),
  ('SAMSUNGS23-B-128-BLK', 'Samsung S23', 'B', '128GB', 'Phantom Black', 10, 0, 10, 0, 3, 429.99, 'Samsung S23 128GB Phantom Black Grade B');

-- Insert initial activity
INSERT INTO activities (type, message) VALUES
  ('SYNC_SUCCESS', 'Database initialized with seed data'),
  ('STOCK_ADJUSTED', 'Initial inventory loaded: 20 SKUs');

-- Success message
SELECT 'Seed data inserted successfully! ' || COUNT(*) || ' SKUs created.' AS message
FROM skus;

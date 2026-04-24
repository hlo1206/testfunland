-- =============================================
-- FunLand MC Migration
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. Increase all product prices by ₹20
UPDATE products SET price_inr = price_inr + 20;

-- 2. Add Performance Ryzen plans
INSERT INTO products (id, category, name, price_inr, tagline, cpu_percent, ram_gb, storage_gb, billing_period, accent, sort_order)
VALUES
  (gen_random_uuid(), 'performance', 'Performance Stone Plan',  160,  'AMD Ryzen · Entry tier',  200, 4,  20, 'month', '#8B8B8B', 10),
  (gen_random_uuid(), 'performance', 'Performance Iron Plan',   320,  'AMD Ryzen · Standard',    300, 8,  30, 'month', '#B8C5CC', 20),
  (gen_random_uuid(), 'performance', 'Performance Redstone Plan', 640, 'AMD Ryzen · Advanced',   400, 16, 40, 'month', '#FF4444', 30),
  (gen_random_uuid(), 'performance', 'Performance Gold Plan',  1280,  'AMD Ryzen · Pro',         450, 32, 40, 'month', '#FFD700', 40),
  (gen_random_uuid(), 'performance', 'Performance Emerald Plan', 1920, 'AMD Ryzen · Elite',      500, 48, 50, 'month', '#00C853', 50);

-- 3. Create special_offers table
CREATE TABLE IF NOT EXISTS special_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  discount_text text NOT NULL,
  badge_label text NOT NULL DEFAULT 'OFFER',
  active boolean NOT NULL DEFAULT true,
  expires_at timestamptz DEFAULT NULL,
  accent text NOT NULL DEFAULT '#fbbf24',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Enable Row Level Security on special_offers
ALTER TABLE special_offers ENABLE ROW LEVEL SECURITY;

-- 5. Public can read all offers
CREATE POLICY "public_read_offers" ON special_offers
  FOR SELECT USING (true);

-- 6. Authenticated admin can insert / update / delete
CREATE POLICY "admin_insert_offers" ON special_offers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "admin_update_offers" ON special_offers
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "admin_delete_offers" ON special_offers
  FOR DELETE USING (auth.role() = 'authenticated');

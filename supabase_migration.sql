-- =============================================
-- FunLand MC Migration
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. Increase all product prices by ₹20
UPDATE products SET price_inr = price_inr + 20;

-- 2. Create special_offers table
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

-- 3. Enable Row Level Security
ALTER TABLE special_offers ENABLE ROW LEVEL SECURITY;

-- 4. Public can read all offers
CREATE POLICY "public_read_offers" ON special_offers
  FOR SELECT USING (true);

-- 5. Authenticated admin can insert / update / delete
CREATE POLICY "admin_insert_offers" ON special_offers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "admin_update_offers" ON special_offers
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "admin_delete_offers" ON special_offers
  FOR DELETE USING (auth.role() = 'authenticated');

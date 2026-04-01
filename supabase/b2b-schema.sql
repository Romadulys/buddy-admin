-- ============================================================
-- B2B Order Management Schema
-- Buddy Admin — GPS Tracker
-- Project: zkqnydmlvueaosxykwmc
-- ============================================================

-- B2B Clients (distributors, retailers like Toys R Us)
CREATE TABLE IF NOT EXISTS b2b_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'France',
  siret TEXT,
  vat_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS b2b_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL, -- e.g. CMD-2026-001
  client_id UUID REFERENCES b2b_clients(id),
  status TEXT DEFAULT 'draft', -- draft|confirmed|invoiced|shipped|delivered|cancelled
  order_date DATE DEFAULT CURRENT_DATE,
  delivery_date DATE,
  shipping_address TEXT,
  notes TEXT,
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 20.00,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  invoice_number TEXT, -- e.g. FAC-2026-001
  invoice_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order line items
CREATE TABLE IF NOT EXISTS b2b_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES b2b_orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL, -- e.g. "Buddy Mini", "Buddy Big"
  product_type TEXT, -- 'mini' | 'big' | 'accessory'
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- Deliveries
CREATE TABLE IF NOT EXISTS b2b_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES b2b_orders(id),
  delivery_number TEXT UNIQUE, -- e.g. LIV-2026-001
  status TEXT DEFAULT 'preparing', -- preparing|shipped|in_transit|delivered|returned
  carrier TEXT, -- DHL, FedEx, TNT, etc.
  tracking_number TEXT,
  tracking_url TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  delivery_address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Row Level Security (service role bypasses RLS → admin always works)
-- ============================================================
ALTER TABLE b2b_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_deliveries ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_b2b_orders_client_id ON b2b_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_b2b_orders_status ON b2b_orders(status);
CREATE INDEX IF NOT EXISTS idx_b2b_order_items_order_id ON b2b_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_b2b_deliveries_order_id ON b2b_deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_b2b_deliveries_status ON b2b_deliveries(status);

-- ============================================================
-- updated_at trigger for b2b_orders
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_b2b_orders_updated_at
  BEFORE UPDATE ON b2b_orders
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

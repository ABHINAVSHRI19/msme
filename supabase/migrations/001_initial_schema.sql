-- ==========================================
-- MICROMATCH — Full Database Migration
-- Run this in Supabase SQL Editor
-- ==========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- ENUM TYPES
-- ==========================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('vendor', 'creator');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE product_category AS ENUM (
    'fashion', 'beauty', 'food', 'fitness', 'electronics',
    'home', 'lifestyle', 'handmade', 'services', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE sample_type AS ENUM ('free', 'barter', 'discounted');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE content_type AS ENUM ('reel', 'story', 'short', 'post', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE request_status AS ENUM (
    'pending', 'approved', 'rejected', 'shipped',
    'delivered', 'content_pending', 'completed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE commission_status AS ENUM (
    'pending', 'approved', 'available', 'paid', 'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payout_status AS ENUM (
    'requested', 'processing', 'paid', 'rejected'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'sample_request', 'request_approved', 'request_rejected',
    'new_sale', 'commission_earned', 'payout_processed',
    'order_update', 'new_message'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE logistics_status AS ENUM ('draft', 'active', 'shipped');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE product_status AS ENUM ('active', 'paused', 'deleted');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ==========================================
-- PROFILES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  city TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- VENDORS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL DEFAULT '',
  owner_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  email TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  address TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  category TEXT NOT NULL DEFAULT 'other',
  description TEXT,
  gstin TEXT,
  website TEXT,
  social_url TEXT,
  logo_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- CREATORS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS creators (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  bio TEXT,
  college TEXT,
  city TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  avatar_url TEXT,
  instagram TEXT,
  youtube TEXT,
  twitter TEXT,
  followers_count INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5, 2) DEFAULT 0,
  niche TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- PRODUCTS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category product_category NOT NULL DEFAULT 'other',
  price DECIMAL(10, 2) NOT NULL,
  discount_price DECIMAL(10, 2),
  stock INTEGER DEFAULT 0,
  commission_percent DECIMAL(5, 2) NOT NULL DEFAULT 10,
  sample_available BOOLEAN DEFAULT FALSE,
  barter_available BOOLEAN DEFAULT FALSE,
  creator_requirements TEXT,
  pickup_lat DECIMAL(10, 8),
  pickup_lng DECIMAL(11, 8),
  pickup_address TEXT,
  delivery_available BOOLEAN DEFAULT TRUE,
  status product_status DEFAULT 'active',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- PRODUCT IMAGES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0
);

-- ==========================================
-- CREATOR PRODUCT REQUESTS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS creator_product_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  sample_type sample_type NOT NULL DEFAULT 'free',
  content_type content_type NOT NULL DEFAULT 'reel',
  message TEXT,
  status request_status NOT NULL DEFAULT 'pending',
  vendor_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(creator_id, product_id)
);

-- ==========================================
-- REFERRAL LINKS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS referral_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(20) UNIQUE NOT NULL,
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  request_id UUID REFERENCES creator_product_requests(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- REFERRAL CLICKS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS referral_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_link_id UUID NOT NULL REFERENCES referral_links(id) ON DELETE CASCADE,
  ip_hash TEXT,
  user_agent TEXT,
  device_type TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  order_id UUID
);

-- ==========================================
-- ORDERS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  referral_link_id UUID REFERENCES referral_links(id),
  creator_id UUID REFERENCES creators(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'India',
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  status order_status DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT DEFAULT 'mock',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK for referral_clicks.order_id
ALTER TABLE referral_clicks
  ADD CONSTRAINT fk_referral_clicks_order
  FOREIGN KEY (order_id) REFERENCES orders(id)
  ON DELETE SET NULL
  NOT VALID;

-- ==========================================
-- COMMISSIONS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  referral_link_id UUID NOT NULL REFERENCES referral_links(id),
  product_id UUID NOT NULL REFERENCES products(id),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  sale_amount DECIMAL(10, 2) NOT NULL,
  commission_percent DECIMAL(5, 2) NOT NULL,
  commission_amount DECIMAL(10, 2) NOT NULL,
  status commission_status DEFAULT 'pending',
  payout_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  UNIQUE(order_id)
);

-- ==========================================
-- PAYOUTS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  upi_id TEXT,
  account_holder TEXT,
  status payout_status DEFAULT 'requested',
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Add FK for commissions.payout_id
ALTER TABLE commissions
  ADD CONSTRAINT fk_commissions_payout
  FOREIGN KEY (payout_id) REFERENCES payouts(id)
  ON DELETE SET NULL
  NOT VALID;

-- ==========================================
-- NOTIFICATIONS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- CONVERSATIONS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ,
  unread_vendor INTEGER DEFAULT 0,
  unread_creator INTEGER DEFAULT 0,
  UNIQUE(vendor_id, creator_id)
);

-- ==========================================
-- MESSAGES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  sender_role user_role NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);

-- ==========================================
-- LOGISTICS GROUPS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS logistics_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  area_name TEXT,
  center_lat DECIMAL(10, 8),
  center_lng DECIMAL(11, 8),
  radius_km DECIMAL(5, 2) DEFAULT 5,
  individual_cost DECIMAL(10, 2) DEFAULT 0,
  pooled_cost DECIMAL(10, 2) DEFAULT 0,
  estimated_savings DECIMAL(10, 2) DEFAULT 0,
  status logistics_status DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- LOGISTICS ORDERS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS logistics_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  logistics_group_id UUID NOT NULL REFERENCES logistics_groups(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  UNIQUE(order_id)
);

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_products_vendor ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_commission ON products(commission_percent DESC);

CREATE INDEX IF NOT EXISTS idx_requests_creator ON creator_product_requests(creator_id);
CREATE INDEX IF NOT EXISTS idx_requests_vendor ON creator_product_requests(vendor_id);
CREATE INDEX IF NOT EXISTS idx_requests_product ON creator_product_requests(product_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON creator_product_requests(status);

CREATE INDEX IF NOT EXISTS idx_referral_links_code ON referral_links(code);
CREATE INDEX IF NOT EXISTS idx_referral_links_creator ON referral_links(creator_id);
CREATE INDEX IF NOT EXISTS idx_referral_links_product ON referral_links(product_id);

CREATE INDEX IF NOT EXISTS idx_clicks_link ON referral_clicks(referral_link_id);
CREATE INDEX IF NOT EXISTS idx_clicks_time ON referral_clicks(clicked_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_vendor ON orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_creator ON orders(creator_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_city ON orders(city);

CREATE INDEX IF NOT EXISTS idx_commissions_creator ON commissions(creator_id);
CREATE INDEX IF NOT EXISTS idx_commissions_vendor ON commissions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- ==========================================
-- FUNCTIONS
-- ==========================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_requests_updated_at
  BEFORE UPDATE ON creator_product_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_product_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_orders ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "profiles_own_access" ON profiles
  FOR ALL USING (auth.uid() = id);

-- VENDORS (public read for basic info, own write)
CREATE POLICY "vendors_public_read" ON vendors
  FOR SELECT USING (TRUE);
CREATE POLICY "vendors_own_write" ON vendors
  FOR ALL USING (auth.uid() = id);

-- CREATORS (public read for basic info, own write)
CREATE POLICY "creators_public_read" ON creators
  FOR SELECT USING (TRUE);
CREATE POLICY "creators_own_write" ON creators
  FOR ALL USING (auth.uid() = id);

-- PRODUCTS (public read for active, vendor own write)
CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (status = 'active' OR vendor_id = auth.uid());
CREATE POLICY "products_vendor_write" ON products
  FOR ALL USING (vendor_id = auth.uid());

-- PRODUCT IMAGES (public read, vendor write)
CREATE POLICY "product_images_public_read" ON product_images
  FOR SELECT USING (TRUE);
CREATE POLICY "product_images_vendor_write" ON product_images
  FOR ALL USING (
    EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.vendor_id = auth.uid())
  );

-- CREATOR PRODUCT REQUESTS
CREATE POLICY "requests_creator_access" ON creator_product_requests
  FOR ALL USING (creator_id = auth.uid());
CREATE POLICY "requests_vendor_access" ON creator_product_requests
  FOR ALL USING (vendor_id = auth.uid());

-- REFERRAL LINKS
CREATE POLICY "referral_links_creator_read" ON referral_links
  FOR SELECT USING (creator_id = auth.uid());
CREATE POLICY "referral_links_vendor_read" ON referral_links
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.vendor_id = auth.uid())
  );
CREATE POLICY "referral_links_public_read" ON referral_links
  FOR SELECT USING (is_active = TRUE);

-- REFERRAL CLICKS (public insert for tracking, own read)
CREATE POLICY "referral_clicks_public_insert" ON referral_clicks
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "referral_clicks_creator_read" ON referral_clicks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM referral_links rl WHERE rl.id = referral_link_id AND rl.creator_id = auth.uid())
  );
CREATE POLICY "referral_clicks_vendor_read" ON referral_clicks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM referral_links rl
      JOIN products p ON p.id = rl.product_id
      WHERE rl.id = referral_link_id AND p.vendor_id = auth.uid()
    )
  );

-- ORDERS (public insert for customers, creator and vendor read)
CREATE POLICY "orders_public_insert" ON orders
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "orders_creator_read" ON orders
  FOR SELECT USING (creator_id = auth.uid());
CREATE POLICY "orders_vendor_access" ON orders
  FOR ALL USING (vendor_id = auth.uid());

-- COMMISSIONS
CREATE POLICY "commissions_creator_read" ON commissions
  FOR SELECT USING (creator_id = auth.uid());
CREATE POLICY "commissions_vendor_access" ON commissions
  FOR ALL USING (vendor_id = auth.uid());

-- PAYOUTS
CREATE POLICY "payouts_creator_access" ON payouts
  FOR ALL USING (creator_id = auth.uid());

-- NOTIFICATIONS
CREATE POLICY "notifications_own_access" ON notifications
  FOR ALL USING (user_id = auth.uid());

-- CONVERSATIONS
CREATE POLICY "conversations_participant_access" ON conversations
  FOR ALL USING (vendor_id = auth.uid() OR creator_id = auth.uid());

-- MESSAGES
CREATE POLICY "messages_participant_access" ON messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND (c.vendor_id = auth.uid() OR c.creator_id = auth.uid())
    )
  );

-- LOGISTICS
CREATE POLICY "logistics_vendor_access" ON logistics_groups
  FOR ALL USING (vendor_id = auth.uid());
CREATE POLICY "logistics_orders_vendor_access" ON logistics_orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM logistics_groups lg WHERE lg.id = logistics_group_id AND lg.vendor_id = auth.uid())
  );

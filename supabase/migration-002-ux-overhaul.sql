-- ================================================
-- Migration 002: UX Overhaul - New tables and columns
-- ================================================

-- 1. Countries table
CREATE TABLE IF NOT EXISTS countries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  flag_emoji TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed Panama (our first market)
INSERT INTO countries (name, code, flag_emoji, is_active) VALUES ('Panama', 'PA', '🇵🇦', true) ON CONFLICT (code) DO NOTHING;

-- Enable RLS on countries
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone_can_read_countries" ON countries FOR SELECT TO authenticated USING (true);

-- 2. User preferences table (for onboarding questions)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preference_type TEXT NOT NULL,
  preference_values TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, preference_type)
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_insert_own_preferences" ON user_preferences FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_view_own_preferences" ON user_preferences FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "users_update_own_preferences" ON user_preferences FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- 3. Bag pickup schedule table (weekly recurring schedule)
CREATE TABLE IF NOT EXISTS bag_pickup_schedule (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bag_id UUID NOT NULL REFERENCES surplus_bags(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(bag_id, day_of_week)
);

ALTER TABLE bag_pickup_schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owners_manage_bag_schedule" ON bag_pickup_schedule FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM surplus_bags sb JOIN businesses b ON sb.business_id = b.id WHERE sb.id = bag_id AND b.user_id = auth.uid())
);
CREATE POLICY "anyone_can_read_bag_schedule" ON bag_pickup_schedule FOR SELECT TO authenticated USING (true);

-- 4. Add new columns to surplus_bags
ALTER TABLE surplus_bags ADD COLUMN IF NOT EXISTS bag_size TEXT CHECK (bag_size IN ('small', 'medium', 'large')) DEFAULT 'medium';
ALTER TABLE surplus_bags ADD COLUMN IF NOT EXISTS value NUMERIC(10,2);

-- 5. Add country_id to consumer_profiles and businesses
ALTER TABLE consumer_profiles ADD COLUMN IF NOT EXISTS country_id UUID REFERENCES countries(id);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS country_id UUID REFERENCES countries(id);

-- 6. Add google_place_id to businesses for Google Maps integration
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS google_place_id TEXT;

-- 7. Business photos table
CREATE TABLE IF NOT EXISTS business_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  source TEXT DEFAULT 'google_maps',
  is_selected BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE business_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owners_manage_photos" ON business_photos FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND user_id = auth.uid())
);
CREATE POLICY "anyone_can_read_photos" ON business_photos FOR SELECT TO authenticated USING (true);

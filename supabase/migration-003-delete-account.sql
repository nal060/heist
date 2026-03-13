-- ================================================
-- Migration 003: Safe account deletion
-- ================================================

-- Fix: Add ON DELETE CASCADE to business_categories FK
ALTER TABLE business_categories
  DROP CONSTRAINT IF EXISTS business_categories_business_id_fkey;

ALTER TABLE business_categories
  ADD CONSTRAINT business_categories_business_id_fkey
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

-- Ensure orders survive when a bag or business is deleted.
-- Change surplus_bag_id FK to SET NULL so customer order history is preserved.
ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_surplus_bag_id_fkey;

ALTER TABLE orders
  ADD CONSTRAINT orders_surplus_bag_id_fkey
  FOREIGN KEY (surplus_bag_id) REFERENCES surplus_bags(id) ON DELETE SET NULL;

ALTER TABLE orders
  ALTER COLUMN surplus_bag_id DROP NOT NULL;

-- Ensure favorites survive when a business is deleted (just remove the favorite)
ALTER TABLE favorites
  DROP CONSTRAINT IF EXISTS favorites_business_id_fkey;

ALTER TABLE favorites
  ADD CONSTRAINT favorites_business_id_fkey
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

-- Ensure reviews survive when a business is deleted (SET NULL)
ALTER TABLE reviews
  DROP CONSTRAINT IF EXISTS reviews_business_id_fkey;

ALTER TABLE reviews
  ADD CONSTRAINT reviews_business_id_fkey
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE SET NULL;

ALTER TABLE reviews
  ALTER COLUMN business_id DROP NOT NULL;

-- Ensure notifications survive user deletion
ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

ALTER TABLE notifications
  ADD CONSTRAINT notifications_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Ensure payments survive order changes (they reference orders, not users)
-- No change needed — payments cascade from orders which we're preserving.

-- Function to safely delete the currently authenticated user.
--
-- What gets DELETED (user's own data):
--   auth.users row → cascades to:
--     consumer_profiles, user_preferences (user_id ON DELETE CASCADE)
--     businesses → business_categories, business_photos, surplus_bags
--       → bag_pickup_schedule (all ON DELETE CASCADE)
--     favorites owned by this user (user_id ON DELETE CASCADE)
--     notifications (user_id ON DELETE CASCADE)
--
-- What gets PRESERVED (other users' data):
--   orders from other customers (surplus_bag_id set to NULL)
--   reviews from other customers (business_id set to NULL)
--   payments (linked to orders, not directly to users)
--
CREATE OR REPLACE FUNCTION delete_own_account()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  DELETE FROM auth.users WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION delete_own_account() TO authenticated;

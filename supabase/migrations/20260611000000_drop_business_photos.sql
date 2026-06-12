-- Consolidate business photos onto businesses.photo_url (single photo per business).
-- The business_photos table is no longer written or read by the app; drop it.
-- Note: the 'business-photos' storage bucket is unrelated and stays in place.
DROP TABLE IF EXISTS "public"."business_photos" CASCADE;

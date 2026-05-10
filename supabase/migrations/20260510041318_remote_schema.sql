


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "cube" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "earthdistance" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."bag_status" AS ENUM (
    'draft',
    'active',
    'sold_out',
    'expired',
    'cancelled'
);


ALTER TYPE "public"."bag_status" OWNER TO "postgres";


COMMENT ON TYPE "public"."bag_status" IS 'Status of a surplus bag';



CREATE TYPE "public"."order_status" AS ENUM (
    'reserved',
    'collected',
    'cancelled'
);


ALTER TYPE "public"."order_status" OWNER TO "postgres";


COMMENT ON TYPE "public"."order_status" IS 'Status of the order';



CREATE OR REPLACE FUNCTION "public"."decrement_bag_quantity"("bag_id" "uuid", "amount" integer) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE surplus_bags
  SET quantity_available = GREATEST(quantity_available - amount, 0),
      updated_at = now()
  WHERE id = bag_id;
END;
$$;


ALTER FUNCTION "public"."decrement_bag_quantity"("bag_id" "uuid", "amount" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_own_account"() RETURNS "void"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
  DELETE FROM auth.users WHERE id = auth.uid();
$$;


ALTER FUNCTION "public"."delete_own_account"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_nearby_business_ids"("user_lat" double precision, "user_lon" double precision, "radius_meters" double precision) RETURNS TABLE("id" "uuid")
    LANGUAGE "sql" STABLE
    AS $$
  SELECT b.id
  FROM businesses b
  WHERE earth_box(ll_to_earth(user_lat, user_lon), radius_meters) @> ll_to_earth(b.latitude::double precision, b.longitude::double precision)
    AND earth_distance(ll_to_earth(user_lat, user_lon), ll_to_earth(b.latitude::double precision, b.longitude::double precision)) <= radius_meters;
$$;


ALTER FUNCTION "public"."get_nearby_business_ids"("user_lat" double precision, "user_lon" double precision, "radius_meters" double precision) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."bag_photos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "bag_id" "uuid" NOT NULL,
    "photo_url" "text" NOT NULL,
    "display_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."bag_photos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bag_pickup_schedule" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "bag_id" "uuid" NOT NULL,
    "day_of_week" integer NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "bag_pickup_schedule_day_of_week_check" CHECK ((("day_of_week" >= 0) AND ("day_of_week" <= 6)))
);


ALTER TABLE "public"."bag_pickup_schedule" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bag_price_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "surplus_bag_id" "uuid" NOT NULL,
    "original_price" numeric NOT NULL,
    "discounted_price" numeric NOT NULL,
    "changed_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."bag_price_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."business_categories" (
    "business_id" "uuid" NOT NULL,
    "category_id" "uuid" NOT NULL
);


ALTER TABLE "public"."business_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."business_hours" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "business_id" "uuid" NOT NULL,
    "day_of_week" integer NOT NULL,
    "open_time" time without time zone NOT NULL,
    "close_time" time without time zone NOT NULL,
    "is_closed" boolean DEFAULT false,
    CONSTRAINT "business_hours_day_of_week_check" CHECK ((("day_of_week" >= 0) AND ("day_of_week" <= 6)))
);


ALTER TABLE "public"."business_hours" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."business_photos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "business_id" "uuid" NOT NULL,
    "photo_url" "text" NOT NULL,
    "source" "text" DEFAULT 'google_maps'::"text",
    "is_selected" boolean DEFAULT true,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."business_photos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."businesses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "address" character varying(500) NOT NULL,
    "latitude" numeric(10,8) NOT NULL,
    "longitude" numeric(11,8) NOT NULL,
    "photo_url" "text",
    "rating" numeric(3,2) DEFAULT 0.00,
    "total_reviews" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "phone" "text",
    "country_id" "uuid",
    "google_place_id" "text"
);


ALTER TABLE "public"."businesses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying NOT NULL,
    "icon" character varying,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."consumer_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "country_id" "uuid"
);


ALTER TABLE "public"."consumer_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."countries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "code" "text" NOT NULL,
    "flag_emoji" "text" DEFAULT ''::"text" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."countries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."coupons" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" character varying NOT NULL,
    "discount_type" character varying NOT NULL,
    "discount_value" numeric NOT NULL,
    "min_purchase" numeric,
    "max_uses" integer,
    "current_uses" integer DEFAULT 0,
    "valid_from" timestamp with time zone NOT NULL,
    "valid_until" timestamp with time zone NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."coupons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."favorite_bags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "bag_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."favorite_bags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."favorites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "business_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."favorites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notification_preferences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "target_type" "text" NOT NULL,
    "target_id" "uuid" NOT NULL,
    "enabled" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "notification_preferences_target_type_check" CHECK (("target_type" = ANY (ARRAY['bag'::"text", 'business'::"text"])))
);


ALTER TABLE "public"."notification_preferences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" character varying NOT NULL,
    "title" character varying NOT NULL,
    "message" "text" NOT NULL,
    "is_read" boolean DEFAULT false,
    "related_order_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_coupons" (
    "order_id" "uuid" NOT NULL,
    "coupon_id" "uuid" NOT NULL,
    "discount_applied" numeric NOT NULL
);


ALTER TABLE "public"."order_coupons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_status_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "old_status" character varying,
    "new_status" character varying NOT NULL,
    "changed_by" "uuid",
    "changed_at" timestamp with time zone DEFAULT "now"(),
    "notes" "text"
);


ALTER TABLE "public"."order_status_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "surplus_bag_id" "uuid",
    "quantity" integer DEFAULT 1 NOT NULL,
    "total_price" numeric(10,2) NOT NULL,
    "pickup_code" character varying(10) NOT NULL,
    "pickup_start_time" time without time zone NOT NULL,
    "pickup_end_time" time without time zone NOT NULL,
    "pickup_date" "date" NOT NULL,
    "status" "public"."order_status",
    "reserved_at" timestamp with time zone DEFAULT "now"(),
    "collected_at" timestamp with time zone,
    "cancelled_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "valid_order_quantity" CHECK (("quantity" > 0))
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "total" numeric NOT NULL,
    "payment_method" character varying NOT NULL,
    "payment_status" character varying NOT NULL,
    "payment_id" character varying,
    "paid_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "subtotal" numeric,
    "breakdown" "jsonb"
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "business_id" "uuid",
    "rating" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "valid_rating" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."surplus_bags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "business_id" "uuid" NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "original_price" numeric(10,2) NOT NULL,
    "discounted_price" numeric(10,2) NOT NULL,
    "date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "quantity_total" integer NOT NULL,
    "quantity_available" integer NOT NULL,
    "pickup_start_time" time without time zone NOT NULL,
    "pickup_end_time" time without time zone NOT NULL,
    "status" "public"."bag_status" DEFAULT 'draft'::"public"."bag_status",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "bag_size" "text" DEFAULT 'medium'::"text",
    "value" numeric(10,2),
    CONSTRAINT "surplus_bags_bag_size_check" CHECK (("bag_size" = ANY (ARRAY['small'::"text", 'medium'::"text", 'large'::"text"]))),
    CONSTRAINT "valid_prices" CHECK (("discounted_price" < "original_price")),
    CONSTRAINT "valid_quantity" CHECK ((("quantity_available" >= 0) AND ("quantity_available" <= "quantity_total")))
);


ALTER TABLE "public"."surplus_bags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_preferences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "preference_type" "text" NOT NULL,
    "preference_values" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_preferences" OWNER TO "postgres";


ALTER TABLE ONLY "public"."bag_photos"
    ADD CONSTRAINT "bag_photos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bag_pickup_schedule"
    ADD CONSTRAINT "bag_pickup_schedule_bag_id_day_of_week_key" UNIQUE ("bag_id", "day_of_week");



ALTER TABLE ONLY "public"."bag_pickup_schedule"
    ADD CONSTRAINT "bag_pickup_schedule_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bag_price_history"
    ADD CONSTRAINT "bag_price_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."business_categories"
    ADD CONSTRAINT "business_categories_pkey" PRIMARY KEY ("business_id", "category_id");



ALTER TABLE ONLY "public"."business_hours"
    ADD CONSTRAINT "business_hours_business_id_day_of_week_key" UNIQUE ("business_id", "day_of_week");



ALTER TABLE ONLY "public"."business_hours"
    ADD CONSTRAINT "business_hours_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."business_photos"
    ADD CONSTRAINT "business_photos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."businesses"
    ADD CONSTRAINT "businesses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."countries"
    ADD CONSTRAINT "countries_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."countries"
    ADD CONSTRAINT "countries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."coupons"
    ADD CONSTRAINT "coupons_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."coupons"
    ADD CONSTRAINT "coupons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."favorite_bags"
    ADD CONSTRAINT "favorite_bags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."favorite_bags"
    ADD CONSTRAINT "favorite_bags_user_id_bag_id_key" UNIQUE ("user_id", "bag_id");



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_user_id_business_id_key" UNIQUE ("user_id", "business_id");



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_user_id_target_type_target_id_key" UNIQUE ("user_id", "target_type", "target_id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_coupons"
    ADD CONSTRAINT "order_coupons_pkey" PRIMARY KEY ("order_id", "coupon_id");



ALTER TABLE ONLY "public"."order_status_history"
    ADD CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pickup_code_key" UNIQUE ("pickup_code");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."surplus_bags"
    ADD CONSTRAINT "surplus_bags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_user_id_preference_type_key" UNIQUE ("user_id", "preference_type");



ALTER TABLE ONLY "public"."consumer_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."consumer_profiles"
    ADD CONSTRAINT "user_profiles_user_id_key" UNIQUE ("user_id");



CREATE INDEX "businesses_location_idx" ON "public"."businesses" USING "gist" ("extensions"."ll_to_earth"(("latitude")::double precision, ("longitude")::double precision));



CREATE INDEX "businesses_user_id_idx" ON "public"."businesses" USING "btree" ("user_id");



CREATE INDEX "orders_pickup_date_idx" ON "public"."orders" USING "btree" ("pickup_date");



CREATE INDEX "orders_surplus_bag_id_idx" ON "public"."orders" USING "btree" ("surplus_bag_id");



CREATE INDEX "orders_user_id_idx" ON "public"."orders" USING "btree" ("user_id");



CREATE INDEX "reviews_business_id_idx" ON "public"."reviews" USING "btree" ("business_id");



CREATE INDEX "reviews_user_id_idx" ON "public"."reviews" USING "btree" ("user_id");



CREATE INDEX "surplus_bags_business_date_idx" ON "public"."surplus_bags" USING "btree" ("business_id", "date");



CREATE INDEX "surplus_bags_business_id_idx" ON "public"."surplus_bags" USING "btree" ("business_id");



CREATE INDEX "surplus_bags_date_status_idx" ON "public"."surplus_bags" USING "btree" ("date", "status");



ALTER TABLE ONLY "public"."bag_photos"
    ADD CONSTRAINT "bag_photos_bag_id_fkey" FOREIGN KEY ("bag_id") REFERENCES "public"."surplus_bags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bag_pickup_schedule"
    ADD CONSTRAINT "bag_pickup_schedule_bag_id_fkey" FOREIGN KEY ("bag_id") REFERENCES "public"."surplus_bags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bag_price_history"
    ADD CONSTRAINT "bag_price_history_surplus_bag_id_fkey" FOREIGN KEY ("surplus_bag_id") REFERENCES "public"."surplus_bags"("id");



ALTER TABLE ONLY "public"."business_categories"
    ADD CONSTRAINT "business_categories_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."business_categories"
    ADD CONSTRAINT "business_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id");



ALTER TABLE ONLY "public"."business_hours"
    ADD CONSTRAINT "business_hours_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id");



ALTER TABLE ONLY "public"."business_photos"
    ADD CONSTRAINT "business_photos_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."businesses"
    ADD CONSTRAINT "businesses_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id");



ALTER TABLE ONLY "public"."businesses"
    ADD CONSTRAINT "businesses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."consumer_profiles"
    ADD CONSTRAINT "consumer_profiles_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id");



ALTER TABLE ONLY "public"."favorite_bags"
    ADD CONSTRAINT "favorite_bags_bag_id_fkey" FOREIGN KEY ("bag_id") REFERENCES "public"."surplus_bags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."favorite_bags"
    ADD CONSTRAINT "favorite_bags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_related_order_id_fkey" FOREIGN KEY ("related_order_id") REFERENCES "public"."orders"("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_coupons"
    ADD CONSTRAINT "order_coupons_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id");



ALTER TABLE ONLY "public"."order_coupons"
    ADD CONSTRAINT "order_coupons_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");



ALTER TABLE ONLY "public"."order_status_history"
    ADD CONSTRAINT "order_status_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."order_status_history"
    ADD CONSTRAINT "order_status_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_surplus_bag_id_fkey" FOREIGN KEY ("surplus_bag_id") REFERENCES "public"."surplus_bags"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."surplus_bags"
    ADD CONSTRAINT "surplus_bags_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."consumer_profiles"
    ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Anyone can read bag photos" ON "public"."bag_photos" FOR SELECT USING (true);



CREATE POLICY "Business owners can delete bag photos" ON "public"."bag_photos" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."surplus_bags" "sb"
     JOIN "public"."businesses" "b" ON (("b"."id" = "sb"."business_id")))
  WHERE (("sb"."id" = "bag_photos"."bag_id") AND ("b"."user_id" = "auth"."uid"())))));



CREATE POLICY "Business owners can insert bag photos" ON "public"."bag_photos" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."surplus_bags" "sb"
     JOIN "public"."businesses" "b" ON (("b"."id" = "sb"."business_id")))
  WHERE (("sb"."id" = "bag_photos"."bag_id") AND ("b"."user_id" = "auth"."uid"())))));



CREATE POLICY "Business owners can read bag orders" ON "public"."orders" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."surplus_bags" "sb"
     JOIN "public"."businesses" "b" ON (("b"."id" = "sb"."business_id")))
  WHERE (("sb"."id" = "orders"."surplus_bag_id") AND ("b"."user_id" = "auth"."uid"())))));



CREATE POLICY "Business owners can update bag orders" ON "public"."orders" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."surplus_bags" "sb"
     JOIN "public"."businesses" "b" ON (("b"."id" = "sb"."business_id")))
  WHERE (("sb"."id" = "orders"."surplus_bag_id") AND ("b"."user_id" = "auth"."uid"())))));



CREATE POLICY "Enable read access for all users" ON "public"."business_categories" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."business_hours" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."categories" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."reviews" FOR SELECT USING (true);



CREATE POLICY "Users can create orders" ON "public"."orders" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can create payments" ON "public"."payments" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."orders" "o"
  WHERE (("o"."id" = "payments"."order_id") AND ("o"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can read own orders" ON "public"."orders" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can read own payments" ON "public"."payments" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."orders" "o"
  WHERE (("o"."id" = "payments"."order_id") AND ("o"."user_id" = "auth"."uid"())))));



CREATE POLICY "anyone_can_read" ON "public"."businesses" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "anyone_can_read_bag_schedule" ON "public"."bag_pickup_schedule" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "anyone_can_read_countries" ON "public"."countries" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "anyone_can_read_photos" ON "public"."business_photos" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."bag_photos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bag_pickup_schedule" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bag_price_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."business_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."business_hours" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."business_photos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."businesses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."consumer_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."countries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."coupons" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."favorite_bags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."favorites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notification_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_coupons" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_status_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "owners_create_bags" ON "public"."surplus_bags" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."businesses"
  WHERE (("businesses"."id" = "surplus_bags"."business_id") AND ("businesses"."user_id" = "auth"."uid"())))));



CREATE POLICY "owners_insert_business_categories" ON "public"."business_categories" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."businesses"
  WHERE (("businesses"."id" = "business_categories"."business_id") AND ("businesses"."user_id" = "auth"."uid"())))));



CREATE POLICY "owners_manage_bag_schedule" ON "public"."bag_pickup_schedule" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."surplus_bags" "sb"
     JOIN "public"."businesses" "b" ON (("sb"."business_id" = "b"."id")))
  WHERE (("sb"."id" = "bag_pickup_schedule"."bag_id") AND ("b"."user_id" = "auth"."uid"())))));



CREATE POLICY "owners_manage_photos" ON "public"."business_photos" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."businesses"
  WHERE (("businesses"."id" = "business_photos"."business_id") AND ("businesses"."user_id" = "auth"."uid"())))));



CREATE POLICY "owners_update_own_bags" ON "public"."surplus_bags" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."businesses"
  WHERE (("businesses"."id" = "surplus_bags"."business_id") AND ("businesses"."user_id" = "auth"."uid"())))));



CREATE POLICY "owners_update_own_business" ON "public"."businesses" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "retrieve bags" ON "public"."surplus_bags" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."surplus_bags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_preferences" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_create_orders" ON "public"."orders" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "users_create_own_business" ON "public"."businesses" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "users_delete_own_favorites" ON "public"."favorites" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "users_insert_favorites" ON "public"."favorites" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "users_insert_own_preferences" ON "public"."user_preferences" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "users_insert_own_profile" ON "public"."consumer_profiles" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "users_manage_own_bag_favorites" ON "public"."favorite_bags" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "users_manage_own_notif_prefs" ON "public"."notification_preferences" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "users_update_own_preferences" ON "public"."user_preferences" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "users_update_own_profile" ON "public"."consumer_profiles" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "users_view_own_favorites" ON "public"."favorites" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "users_view_own_orders" ON "public"."orders" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "users_view_own_preferences" ON "public"."user_preferences" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "users_view_own_profile" ON "public"."consumer_profiles" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."orders";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT USAGE ON SCHEMA "public" TO "supabase_auth_admin";












































































































































































































































































































GRANT ALL ON FUNCTION "public"."decrement_bag_quantity"("bag_id" "uuid", "amount" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_bag_quantity"("bag_id" "uuid", "amount" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_bag_quantity"("bag_id" "uuid", "amount" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_own_account"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_own_account"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_own_account"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_nearby_business_ids"("user_lat" double precision, "user_lon" double precision, "radius_meters" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."get_nearby_business_ids"("user_lat" double precision, "user_lon" double precision, "radius_meters" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_nearby_business_ids"("user_lat" double precision, "user_lon" double precision, "radius_meters" double precision) TO "service_role";


















GRANT ALL ON TABLE "public"."bag_photos" TO "anon";
GRANT ALL ON TABLE "public"."bag_photos" TO "authenticated";
GRANT ALL ON TABLE "public"."bag_photos" TO "service_role";



GRANT ALL ON TABLE "public"."bag_pickup_schedule" TO "anon";
GRANT ALL ON TABLE "public"."bag_pickup_schedule" TO "authenticated";
GRANT ALL ON TABLE "public"."bag_pickup_schedule" TO "service_role";



GRANT ALL ON TABLE "public"."bag_price_history" TO "anon";
GRANT ALL ON TABLE "public"."bag_price_history" TO "authenticated";
GRANT ALL ON TABLE "public"."bag_price_history" TO "service_role";



GRANT ALL ON TABLE "public"."business_categories" TO "anon";
GRANT ALL ON TABLE "public"."business_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."business_categories" TO "service_role";



GRANT ALL ON TABLE "public"."business_hours" TO "anon";
GRANT ALL ON TABLE "public"."business_hours" TO "authenticated";
GRANT ALL ON TABLE "public"."business_hours" TO "service_role";



GRANT ALL ON TABLE "public"."business_photos" TO "anon";
GRANT ALL ON TABLE "public"."business_photos" TO "authenticated";
GRANT ALL ON TABLE "public"."business_photos" TO "service_role";



GRANT ALL ON TABLE "public"."businesses" TO "anon";
GRANT ALL ON TABLE "public"."businesses" TO "authenticated";
GRANT ALL ON TABLE "public"."businesses" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."consumer_profiles" TO "anon";
GRANT ALL ON TABLE "public"."consumer_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."consumer_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."countries" TO "anon";
GRANT ALL ON TABLE "public"."countries" TO "authenticated";
GRANT ALL ON TABLE "public"."countries" TO "service_role";



GRANT ALL ON TABLE "public"."coupons" TO "anon";
GRANT ALL ON TABLE "public"."coupons" TO "authenticated";
GRANT ALL ON TABLE "public"."coupons" TO "service_role";



GRANT ALL ON TABLE "public"."favorite_bags" TO "anon";
GRANT ALL ON TABLE "public"."favorite_bags" TO "authenticated";
GRANT ALL ON TABLE "public"."favorite_bags" TO "service_role";



GRANT ALL ON TABLE "public"."favorites" TO "anon";
GRANT ALL ON TABLE "public"."favorites" TO "authenticated";
GRANT ALL ON TABLE "public"."favorites" TO "service_role";



GRANT ALL ON TABLE "public"."notification_preferences" TO "anon";
GRANT ALL ON TABLE "public"."notification_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."order_coupons" TO "anon";
GRANT ALL ON TABLE "public"."order_coupons" TO "authenticated";
GRANT ALL ON TABLE "public"."order_coupons" TO "service_role";



GRANT ALL ON TABLE "public"."order_status_history" TO "anon";
GRANT ALL ON TABLE "public"."order_status_history" TO "authenticated";
GRANT ALL ON TABLE "public"."order_status_history" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";



GRANT ALL ON TABLE "public"."surplus_bags" TO "anon";
GRANT ALL ON TABLE "public"."surplus_bags" TO "authenticated";
GRANT ALL ON TABLE "public"."surplus_bags" TO "service_role";



GRANT ALL ON TABLE "public"."user_preferences" TO "anon";
GRANT ALL ON TABLE "public"."user_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."user_preferences" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";


  create policy "Authenticated users can delete 13q01k6_0"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'bag-photos'::text));



  create policy "Authenticated users can upload 13q01k6_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'bag-photos'::text));



  create policy "Public read 13q01k6_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'bag-photos'::text));

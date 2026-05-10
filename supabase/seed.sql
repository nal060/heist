-- Seed Panama (our first market)
INSERT INTO "public"."countries" (name, code, flag_emoji, is_active) VALUES ('Panama', 'PA', '🇵🇦', true) ON CONFLICT (code) DO NOTHING;
INSERT INTO "public"."categories" (name, icon) VALUES ('Comida', 'restaurant') ON CONFLICT DO NOTHING;
INSERT INTO "public"."categories" (name, icon) VALUES ('Panaderia', 'bakery-dining') ON CONFLICT DO NOTHING;
INSERT INTO "public"."categories" (name, icon) VALUES ('Supermercado', 'shopping-cart') ON CONFLICT DO NOTHING;
INSERT INTO "public"."categories" (name, icon) VALUES ('Cafe', 'coffee') ON CONFLICT DO NOTHING;
INSERT INTO "public"."categories" (name, icon) VALUES ('Restaurante', 'storefront') ON CONFLICT DO NOTHING;
INSERT INTO "public"."categories" (name, icon) VALUES ('Otros', 'more-horiz') ON CONFLICT DO NOTHING;

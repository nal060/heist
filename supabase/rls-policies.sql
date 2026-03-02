CREATE POLICY "users_insert_own_profile" ON consumer_profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_view_own_profile" ON consumer_profiles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "users_update_own_profile" ON consumer_profiles FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "users_create_own_business" ON businesses FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "owners_update_own_business" ON businesses FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "owners_insert_business_categories" ON business_categories FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND user_id = auth.uid()));

CREATE POLICY "owners_create_bags" ON surplus_bags FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND user_id = auth.uid()));
CREATE POLICY "owners_update_own_bags" ON surplus_bags FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND user_id = auth.uid()));

CREATE POLICY "users_create_orders" ON orders FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_view_own_orders" ON orders FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "users_insert_favorites" ON favorites FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_view_own_favorites" ON favorites FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "users_delete_own_favorites" ON favorites FOR DELETE TO authenticated USING (user_id = auth.uid());

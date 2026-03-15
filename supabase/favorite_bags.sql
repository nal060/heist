-- ─── Favorite Bags (individual bag favorites) ────────────────────────────────

CREATE TABLE favorite_bags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bag_id UUID NOT NULL REFERENCES surplus_bags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, bag_id)
);

ALTER TABLE favorite_bags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_bag_favorites"
  ON favorite_bags FOR ALL
  USING (auth.uid() = user_id);

-- ─── Notification Preferences (UI-ready, no push logic yet) ─────────────────

CREATE TABLE notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('bag', 'business')),
  target_id UUID NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id)
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_notif_prefs"
  ON notification_preferences FOR ALL
  USING (auth.uid() = user_id);

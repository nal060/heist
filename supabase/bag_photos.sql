-- Create bag_photos table
CREATE TABLE bag_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bag_id uuid NOT NULL REFERENCES surplus_bags(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  display_order int4 NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE bag_photos ENABLE ROW LEVEL SECURITY;

-- Anyone can read bag photos
CREATE POLICY "Anyone can read bag photos"
  ON bag_photos FOR SELECT
  TO public
  USING (true);

-- Business owners can insert bag photos
CREATE POLICY "Business owners can insert bag photos"
  ON bag_photos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM surplus_bags sb
      JOIN businesses b ON b.id = sb.business_id
      WHERE sb.id = bag_id
      AND b.user_id = auth.uid()
    )
  );

-- Business owners can delete bag photos
CREATE POLICY "Business owners can delete bag photos"
  ON bag_photos FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM surplus_bags sb
      JOIN businesses b ON b.id = sb.business_id
      WHERE sb.id = bag_id
      AND b.user_id = auth.uid()
    )
  );

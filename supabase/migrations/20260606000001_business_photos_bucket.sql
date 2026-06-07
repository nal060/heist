-- Create business-photos storage bucket for user-uploaded business profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-photos', 'business-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read business photos"
  ON storage.objects
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (bucket_id = 'business-photos');

CREATE POLICY "Authenticated users can upload business photos"
  ON storage.objects
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'business-photos');

CREATE POLICY "Authenticated users can delete business photos"
  ON storage.objects
  AS PERMISSIVE
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'business-photos');

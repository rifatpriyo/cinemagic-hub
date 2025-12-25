-- Create storage bucket for movie and concert posters
INSERT INTO storage.buckets (id, name, public)
VALUES ('posters', 'posters', true);

-- Allow public read access to posters
CREATE POLICY "Posters are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'posters');

-- Allow admins to upload posters
CREATE POLICY "Admins can upload posters"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'posters' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to update posters
CREATE POLICY "Admins can update posters"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'posters' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to delete posters
CREATE POLICY "Admins can delete posters"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'posters' 
  AND public.has_role(auth.uid(), 'admin')
);
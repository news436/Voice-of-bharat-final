-- Allow public read access to enabled ads
CREATE POLICY "Anyone can view enabled ads" ON public.ads
FOR SELECT USING (enabled = true); 
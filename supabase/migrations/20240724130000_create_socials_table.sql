-- Create socials table for social media links
CREATE TABLE public.socials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facebook_url TEXT,
  twitter_url TEXT,
  youtube_url TEXT,
  instagram_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION set_socials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on row modification
CREATE TRIGGER handle_socials_update
    BEFORE UPDATE ON socials
    FOR EACH ROW
    EXECUTE FUNCTION set_socials_updated_at();

-- Enable Row Level Security
ALTER TABLE socials ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to socials"
ON socials
FOR SELECT
USING (true);

-- Allow admin write access
CREATE POLICY "Allow admin write access to socials"
ON socials
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role'); 
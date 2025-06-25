-- Enhance ads table to support image-based ads with redirect URLs
ALTER TABLE public.ads 
ADD COLUMN image_url TEXT,
ADD COLUMN redirect_url TEXT,
ADD COLUMN ad_type VARCHAR(20) DEFAULT 'html' CHECK (ad_type IN ('html', 'image'));
 
-- Update existing ads to have html type
UPDATE public.ads SET ad_type = 'html' WHERE ad_type IS NULL; 
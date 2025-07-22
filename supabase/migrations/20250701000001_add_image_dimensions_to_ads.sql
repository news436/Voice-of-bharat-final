-- Add image dimension fields to ads table
ALTER TABLE public.ads 
ADD COLUMN image_width INTEGER,
ADD COLUMN image_height INTEGER,
ADD COLUMN mobile_height INTEGER,
ADD COLUMN desktop_height INTEGER;

-- Add comments for the new columns
COMMENT ON COLUMN public.ads.image_width IS 'Original width of the uploaded image in pixels';
COMMENT ON COLUMN public.ads.image_height IS 'Original height of the uploaded image in pixels';
COMMENT ON COLUMN public.ads.mobile_height IS 'Calculated height for mobile display based on image aspect ratio';
COMMENT ON COLUMN public.ads.desktop_height IS 'Calculated height for desktop display based on image aspect ratio'; 
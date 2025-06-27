-- Add Facebook video URL field to articles table
ALTER TABLE public.articles
ADD COLUMN facebook_video_url TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN public.articles.facebook_video_url IS 'Facebook video URL to be embedded in the article'; 
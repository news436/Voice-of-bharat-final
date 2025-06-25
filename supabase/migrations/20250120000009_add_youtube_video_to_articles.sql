-- Add YouTube video URL field to articles table
ALTER TABLE public.articles
ADD COLUMN youtube_video_url TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN public.articles.youtube_video_url IS 'YouTube video URL to be embedded in the article'; 
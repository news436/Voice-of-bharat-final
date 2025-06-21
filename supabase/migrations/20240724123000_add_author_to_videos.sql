ALTER TABLE public.videos
ADD COLUMN author_id UUID REFERENCES public.profiles(id);

-- While we are at it, let's allow videos to be featured like articles
ALTER TABLE public.videos
ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT false; 
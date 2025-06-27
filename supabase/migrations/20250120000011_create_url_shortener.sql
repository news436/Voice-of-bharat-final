-- Create URL shortener table
CREATE TABLE public.url_shortener (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  short_id VARCHAR(10) NOT NULL UNIQUE,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  clicks INTEGER NOT NULL DEFAULT 0
);

-- Create index for fast lookups
CREATE INDEX idx_url_shortener_short_id ON public.url_shortener(short_id);
CREATE INDEX idx_url_shortener_article_id ON public.url_shortener(article_id);

-- Enable RLS
ALTER TABLE public.url_shortener ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view short URLs" ON public.url_shortener
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert short URLs" ON public.url_shortener
FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'editor')
  )
);

CREATE POLICY "Authenticated users can update short URLs" ON public.url_shortener
FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'editor')
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_url_shortener_updated_at BEFORE UPDATE ON public.url_shortener
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); 
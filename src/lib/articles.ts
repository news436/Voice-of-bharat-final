import { supabase } from '@/integrations/supabase/client';

export async function getArticleBySlug(slug: string) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching article by slug:', error);
    return null;
  }

  return data;
} 
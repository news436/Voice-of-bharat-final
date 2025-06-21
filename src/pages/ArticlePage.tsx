import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select(`*, categories(name, slug), states(name), profiles(full_name, avatar_url), title_hi, summary_hi, content_hi`)
        .eq('slug', slug)
        .single();
      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setArticle(data);
      setLoading(false);
    };
    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="flex-1 flex items-center justify-center p-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-destructive mb-2">404 - Article Not Found</h1>
          <p className="mb-4 text-muted-foreground">Sorry, the article you are looking for does not exist.</p>
          <Link to="/" className="text-primary underline font-medium">Go Home</Link>
        </div>
      </div>
    );
  }

  // Use Hindi fields if language is 'hi' and field is not empty, else fallback to English
  const title = language === 'hi' && article.title_hi ? article.title_hi : article.title;
  const summary = language === 'hi' && article.summary_hi ? article.summary_hi : article.summary;
  const content = language === 'hi' && article.content_hi ? article.content_hi : article.content;

  return (
    <div className="bg-white dark:bg-black">
      <main className="container mx-auto px-4 py-6">
        <Card className="shadow-xl">
          <CardContent className="p-6">
            {article.featured_image_url && (
              <img
                src={article.featured_image_url}
                alt={title}
                className="w-full max-h-[500px] object-contain rounded-lg mb-8 mx-auto"
              />
            )}
            <div className="flex items-center space-x-2 mb-4">
              {article.categories && (
                <Badge variant="outline" className="border-black text-black">
                  {article.categories.name}
                </Badge>
              )}
              {article.is_breaking && <Badge variant="destructive">Breaking</Badge>}
              {article.is_featured && <Badge>Featured</Badge>}
              {article.states && (
                <Badge variant="secondary">{article.states.name}</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-4 leading-tight text-black dark:text-white">
              {title}
            </h1>
            {summary && (
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">{summary}</p>
            )}
            <div className="flex items-center mb-8 text-gray-500 text-sm">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{article.published_at ? new Date(article.published_at).toLocaleDateString() : ''}</span>
              <span className="mx-2">•</span>
              <span>By {article.profiles?.full_name || 'Unknown Author'}</span>
            </div>
            <article className="prose max-w-none prose-lg text-black dark:text-white" dangerouslySetInnerHTML={{ __html: content }} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ArticlePage; 
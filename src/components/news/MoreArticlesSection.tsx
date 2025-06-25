import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface MoreArticlesSectionProps {
  currentArticleId: string;
  currentArticleSlug: string;
}

export const MoreArticlesSection = ({ currentArticleId, currentArticleSlug }: MoreArticlesSectionProps) => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const { language, t } = useLanguage();

  const ARTICLES_PER_PAGE = 1; // Load one article at a time

  const fetchMoreArticles = async (pageNum: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id, 
          slug, 
          title, 
          title_hi, 
          summary, 
          summary_hi,
          featured_image_url, 
          published_at, 
          categories(name, slug), 
          profiles(full_name),
          is_breaking,
          is_featured,
          publisher_name
        `)
        .neq('id', currentArticleId) // Exclude current article
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .range(pageNum * ARTICLES_PER_PAGE, (pageNum + 1) * ARTICLES_PER_PAGE - 1);

      if (error) {
        console.error('Error fetching more articles:', error);
        setHasMore(false);
      } else if (data && data.length > 0) {
        setArticles(prev => [...prev, ...data]);
        if (data.length < ARTICLES_PER_PAGE) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error fetching more articles:', err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // Load first article when component mounts
  useEffect(() => {
    if (currentArticleId) {
      fetchMoreArticles(0);
    }
  }, [currentArticleId]);

  const handleShowMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMoreArticles(nextPage);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return formatDate(dateString);
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime;
  };

  if (articles.length === 0 && !hasMore && !loading) {
    return null; // Don't show section if no articles and not loading
  }

  return (
    <section className="mt-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          More Articles
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Continue reading more stories from Voice of Bharat
        </p>
      </div>

      <div className="space-y-8">
        {articles.map((article, index) => {
          const title = language === 'hi' && article.title_hi ? article.title_hi : article.title;
          const summary = language === 'hi' && article.summary_hi ? article.summary_hi : article.summary;
          
          return (
            <div key={article.id} className="animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
              <Card className="shadow-xl border-0 overflow-hidden bg-white dark:bg-gray-900 hover:shadow-2xl transition-shadow">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                  {/* Article Image */}
                  <div className="lg:col-span-1">
                    <Link to={`/article/${article.slug}`} className="block h-full">
                      <div className="relative h-64 lg:h-full overflow-hidden">
                        {article.featured_image_url ? (
                          <img
                            src={article.featured_image_url}
                            alt={title}
                            className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center">
                            <span className="text-4xl text-gray-500 dark:text-gray-400">📰</span>
                          </div>
                        )}
                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                          {article.is_breaking && (
                            <Badge variant="destructive" className="animate-pulse">
                              Breaking
                            </Badge>
                          )}
                          {article.is_featured && (
                            <Badge className="bg-yellow-500 text-black">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Article Content */}
                  <div className="lg:col-span-2 p-6 lg:p-8">
                    <div className="flex flex-col h-full">
                      {/* Article Meta */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{article.publisher_name || article.profiles?.full_name || 'Unknown Author'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatRelativeTime(article.published_at)}</span>
                        </div>
                      </div>

                      {/* Article Title */}
                      <Link to={`/article/${article.slug}`} className="block group">
                        <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                          {title}
                        </h3>
                      </Link>

                      {/* Article Summary */}
                      {summary && (
                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 leading-relaxed">
                          {summary}
                        </p>
                      )}

                      {/* Read More Button */}
                      <div className="mt-auto">
                        <Button asChild className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-all transform hover:scale-105">
                          <Link to={`/article/${article.slug}`}>
                            Read Full Article
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Show More Button after each article */}
              {index === articles.length - 1 && hasMore && (
                <div className="flex justify-center mt-6">
                  <Button
                    onClick={handleShowMore}
                    disabled={loading}
                    variant="outline"
                    size="lg"
                    className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-400 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 font-semibold px-8 py-3 rounded-lg transition-all"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        Loading...
                      </div>
                    ) : (
                      'Show More Articles'
                    )}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Show initial "Show More" button when no articles loaded yet */}
      {articles.length === 0 && hasMore && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={handleShowMore}
            disabled={loading}
            variant="outline"
            size="lg"
            className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-400 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 font-semibold px-8 py-3 rounded-lg transition-all"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </div>
            ) : (
              'Show More Articles'
            )}
          </Button>
        </div>
      )}

      {/* Final "View All Articles" link when no more articles */}
      {!hasMore && articles.length > 0 && (
        <div className="text-center mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You've reached the end of our articles
          </p>
          <Button asChild variant="outline" className="bg-red-600 text-white hover:bg-red-700 hover:text-white border-red-600">
            <Link to="/">
              View All Articles
            </Link>
          </Button>
        </div>
      )}
    </section>
  );
}; 
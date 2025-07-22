import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdSlot } from './AdSlot';

interface MoreArticlesSectionProps {
  currentArticleId: string;
  currentArticleSlug: string;
}

export const MoreArticlesSection = ({ currentArticleId, currentArticleSlug }: MoreArticlesSectionProps) => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const { language, t } = useLanguage();

  const ARTICLES_PER_PAGE = 4; // Show 4 at a time

  const fetchAllArticles = async () => {
    setLoading(true);
    try {
      const response = await supabase
        .from('articles')
        .select('*')
        .neq('id', currentArticleId)
        .order('published_at', { ascending: false });
      if (response.data) {
        setArticles(response.data);
      } else {
        console.error('Error fetching articles:', response.error);
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load all articles when component mounts
  useEffect(() => {
    if (currentArticleId) {
      fetchAllArticles();
    }
  }, [currentArticleId]);

  const handleShowMore = () => {
    setPage(page + 1);
  };

  // Helper for relative time
  function formatRelativeTime(dateString: string) {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    // If more than 7 days, show date
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  // Only show unique articles, not the current one
  const uniqueArticles = Array.from(
    new Map(
      articles
        .filter(article => article.id !== currentArticleId && article.slug !== currentArticleSlug)
        .map(article => [article.id, article])
    ).values()
  );
  const visibleArticles = uniqueArticles.slice(0, (page + 1) * ARTICLES_PER_PAGE);

  if (articles.length === 0 && !loading) {
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
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleArticles.map(article => (
          <Link key={article.id} to={`/article/${article.slug}`} className="block focus:outline-none focus:ring-2 focus:ring-black rounded-2xl">
            <div className="rounded-2xl shadow bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden hover:shadow-xl transition-all">
              {article.featured_image_url && (
                <img
                  src={article.featured_image_url}
                  alt={article.title}
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="p-3 flex-1 flex flex-col">
                <h3 className="font-bold text-base mb-1 text-black dark:text-white line-clamp-2">
                  {language === 'hi' && article.title_hi ? article.title_hi : article.title}
                </h3>
                <span className="text-xs text-gray-400 mb-1">
                  {article.published_at ? `${formatRelativeTime(article.published_at)} (${new Date(article.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })})` : ''}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {visibleArticles.length < uniqueArticles.length && (
        <div className="flex flex-col items-center mt-8">
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
              'View More'
            )}
          </Button>
          {/* Ad Slots 10 and 11 side by side after View More */}
          <div className="w-full flex flex-col md:flex-row justify-center items-center gap-6 my-8">
            <div className="flex-1 flex justify-center"><AdSlot slotNumber={10} /></div>
            <div className="flex-1 flex justify-center"><AdSlot slotNumber={11} /></div>
          </div>
        </div>
      )}
      {/* If all articles are shown, still show AdSlots 10 and 11 at the end */}
      {visibleArticles.length >= uniqueArticles.length && (
        <div className="w-full flex flex-col md:flex-row justify-center items-center gap-6 my-8">
          <div className="flex-1 flex justify-center"><AdSlot slotNumber={10} /></div>
          <div className="flex-1 flex justify-center"><AdSlot slotNumber={11} /></div>
        </div>
      )}
    </section>
  );
}; 
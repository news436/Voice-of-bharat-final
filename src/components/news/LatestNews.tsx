import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export function LatestNews() {
  const { t, language } = useLanguage();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      const { data } = await supabase.from('articles').select('*').order('published_at', { ascending: false });
      setArticles(data || []);
      setLoading(false);
    };
    fetchArticles();
  }, []);

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

  if (loading) {
    return <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse mb-6" />;
  }

  const showAll = articles.length > 20;
  const displayedArticles = showAll ? articles.slice(0, 20) : articles;

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-black dark:text-white mb-2 inline-block relative">
          {t('latest_news')}
          <span className="block h-1 bg-red-600 rounded-full mt-1 w-full" style={{ maxWidth: '100%' }} />
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayedArticles.map(article => (
          <Link key={article.id} to={`/article/${article.slug}`} className="block focus:outline-none focus:ring-2 focus:ring-black rounded-2xl">
            <div className="rounded-2xl shadow bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden hover:shadow-xl transition-all transition-transform duration-200 ease-in-out hover:scale-105">
              {article.featured_image_url && (
                <img
                  src={article.featured_image_url}
                  alt={article.title}
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="p-3 flex-1 flex flex-col">
                <h3 className="font-bold text-base mb-1 line-clamp-2 text-black dark:text-white">
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
      {showAll && (
        <div className="flex justify-center mt-6">
          <Link to="/search" className="text-red-600 font-semibold hover:underline text-lg">{t('view_all')}</Link>
        </div>
      )}
    </section>
  );
}

export default LatestNews; 
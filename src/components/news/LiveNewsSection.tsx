import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface LiveNewsSectionProps {
  articles: any[];
}

export const LiveNewsSection = ({ articles }: LiveNewsSectionProps) => {
  const { language, t } = useLanguage();

  if (!articles || articles.length === 0) {
    return null;
  }

  const mainArticle = articles[0];
  const otherArticles = articles.slice(1);

  const renderMainArticle = (article: any) => {
    const title = language === 'hi' && article.title_hi ? article.title_hi : article.title;
    const summary = language === 'hi' && article.summary_hi ? article.summary_hi : article.summary;

    return (
      <Link to={`/article/${article.slug}`} className="block focus:outline-none focus:ring-2 focus:ring-red-500 rounded-lg">
        <Card className="border-2 border-red-600 shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <CardContent className="p-0">
            {article.featured_image_url && (
              <div className="relative">
                <img
                  src={article.featured_image_url}
                  alt={title}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-red-600 text-white text-lg font-bold p-2 px-4 rounded-md animate-pulse">
                    {t('live.badge')}
                  </Badge>
                </div>
              </div>
            )}
            <div className="p-6">
              <h3 className="text-3xl font-extrabold text-black dark:text-white mb-2">{title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">{summary}</p>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{new Date(article.published_at).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  const renderOtherArticle = (article: any) => {
    const title = language === 'hi' && article.title_hi ? article.title_hi : article.title;
    return (
      <Link key={article.id} to={`/article/${article.slug}`} className="block focus:outline-none focus:ring-2 focus:ring-red-500 rounded-lg">
        <Card className="hover:shadow-lg transition-shadow duration-200 h-full">
          <CardContent className="p-4">
            {article.featured_image_url && (
              <div className="mb-2">
                <img
                  src={article.featured_image_url}
                  alt={title}
                  className="w-full h-auto object-cover rounded"
                />
              </div>
            )}
            <div className="flex items-center mb-2">
              <span className="text-red-500 mr-2">●</span>
              <h3 className="font-semibold text-black dark:text-white line-clamp-2">{title}</h3>
            </div>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{new Date(article.published_at).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <section className="mb-8">
       <h2 className="text-2xl font-bold text-red-600 dark:text-red-500 mb-4 border-b-2 border-red-600 pb-2 inline-flex items-center">
        <span className="mr-2">
            <svg className="w-6 h-6 animate-pulse" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586l-2.293-2.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd"></path></svg>
        </span>
        {t('live_news')}
      </h2>
      <div className="grid grid-cols-1 gap-8">
        {renderMainArticle(mainArticle)}
        {otherArticles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherArticles.map(renderOtherArticle)}
          </div>
        )}
      </div>
    </section>
  );
}; 
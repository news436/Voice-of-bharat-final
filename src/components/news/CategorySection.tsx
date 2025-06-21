import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CategorySectionProps {
  category: any;
  articles: any[];
}

export const CategorySection = ({ category, articles }: CategorySectionProps) => {
  if (articles.length === 0) return null;

  const { language, t } = useLanguage();

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold text-black dark:text-white border-b-2 border-red-600 pb-2 inline-block">
          {language === 'hi' && category.name_hi ? category.name_hi : category.name}
        </h2>
        <Link
          to={`/category/${category.slug}`}
          className="text-black dark:text-white hover:text-gray-700 font-bold text-lg px-4 py-2 rounded-full transition-colors bg-gray-100 dark:bg-gray-900 shadow-sm"
        >
          {t('view_all')}
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {articles.slice(0, 3).map((article) => (
          <Link key={article.id} to={`/article/${article.slug}`}>
            <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-red-600 transition-all cursor-pointer group overflow-hidden relative">
              <CardContent className="p-0">
                {article.featured_image_url && (
                  <div className="relative">
                    {article.is_breaking && (
                      <div className="absolute top-3 left-3 z-20 flex items-center">
                        <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow animate-pulse">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3.08l-6.928-12.16c-.77-1.414-2.694-1.414-3.464 0l-6.928 12.16c-.77 1.413.192 3.08 1.732 3.08z" /></svg>
                          Breaking
                        </span>
                      </div>
                    )}
                  <img
                    src={article.featured_image_url}
                    alt={article.title}
                      className="w-full h-44 object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-300"
                  />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-2xl" />
                  </div>
                )}
                <div className="p-5 space-y-2">
                  <div className="flex items-center flex-wrap min-w-0 mb-1">
                    <Badge variant="outline" className="border-gray-400 text-gray-700 dark:text-gray-200 text-xs px-2 py-0.5 rounded-full font-semibold tracking-wide opacity-80 max-w-xs truncate">
                      {category.name}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold leading-tight line-clamp-2 text-black dark:text-white text-lg">
                    {article.title}
                  </h3>
                    <span className="block w-8 h-1 bg-red-600 rounded-full mt-1 mb-1" />
                  </div>
                  {article.summary && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">{article.summary}</p>
                  )}
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{new Date(article.published_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

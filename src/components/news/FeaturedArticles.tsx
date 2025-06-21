import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Eye } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect, useRef } from 'react';
import { CricketScoreWidget } from './CricketScoreWidget';


interface FeaturedArticlesProps {
  articles: any[];
}
export const FeaturedArticles = ({ articles }: FeaturedArticlesProps) => {
  const { language, t } = useLanguage();
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  if (articles.length === 0) return null;

  // Auto-slide effect
  useEffect(() => {
    if (articles.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % articles.length);
    }, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [articles.length]);

  const mainArticle = articles[current];
  const mainTitle = language === 'hi' && mainArticle.title_hi ? mainArticle.title_hi : mainArticle.title;
  const mainSummary = language === 'hi' && mainArticle.summary_hi ? mainArticle.summary_hi : mainArticle.summary;
  // Side articles: next 4, skipping the current main
  const sideArticles = articles
    .filter((_, idx) => idx !== current)
    .slice(0, 4);

  return (
    <section>
      <h2 className="text-2xl font-semibold text-black dark:text-white border-b-2 border-red-600 pb-2 mb-6 inline-block">
        {t('featured_stories')}
      </h2>
      
      <div className="w-full">
        {/* Main Featured Article (Slider) */}
        <div className="transition-all duration-700 ease-in-out">
          <Link to={`/article/${mainArticle.slug}`}>
            <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden flex flex-col p-0">
              {mainArticle.featured_image_url && (
                <div className="relative w-full flex items-center justify-center overflow-hidden rounded-t-2xl h-64">
                  <img
                    src={mainArticle.featured_image_url}
                    alt={mainTitle}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-2 z-10">
                    {mainArticle.categories && (
                      <Badge className="bg-black text-white border border-white/20 text-xs px-3 py-1 rounded-full font-semibold tracking-wide opacity-80 shadow">{mainArticle.categories.name}</Badge>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
              )}
              <CardContent className="flex-1 flex flex-col justify-center p-4 sm:p-6">
                <h3 className="text-xl sm:text-2xl font-extrabold mb-2 leading-tight text-black dark:text-white line-clamp-2">
                  {mainTitle}
                </h3>
                {mainSummary && (
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 text-sm sm:text-base">
                    {mainSummary}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-auto pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(mainArticle.published_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          {/* Dots navigation */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {articles.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`transition-all duration-300 rounded-full ${idx === current ? 'w-5 h-2.5 bg-red-600' : 'w-2.5 h-2.5 bg-gray-400'} focus:outline-none`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

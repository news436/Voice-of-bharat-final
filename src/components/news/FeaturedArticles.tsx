import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useRef, useEffect } from 'react';
import { CricketScoreWidget } from './CricketScoreWidget';
import { supabase } from '@/integrations/supabase/client';

export const FeaturedArticles = () => {
  const { language, t } = useLanguage();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      const { data } = await supabase.from('articles').select('*').eq('is_featured', true).order('published_at', { ascending: false });
      setArticles(data || []);
      setLoading(false);
    };
    fetchFeatured();
  }, []);

  const resetInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % articles.length);
    }, 2000);
  };

  useEffect(() => {
    if (articles.length <= 1) return;
    resetInterval();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [articles.length]);

  if (loading) {
    return <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse mb-6" />;
  }
  if (articles.length === 0) return null;

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + articles.length) % articles.length);
    resetInterval();
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % articles.length);
    resetInterval();
  };

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
      
      <div className="w-full max-w-4xl mx-auto relative">
        {/* Main Featured Article (Slider) */}
        <div className="transition-all duration-700 ease-in-out">
          <Link to={`/article/${mainArticle.slug}`}>
            <Card className="transition-transform duration-200 ease-in-out hover:scale-105">
              {mainArticle.featured_image_url && (
                <div className="relative w-full aspect-video flex items-end justify-center overflow-hidden rounded-2xl bg-gray-200 dark:bg-gray-800" style={{minHeight:'320px', maxHeight:'480px'}}>
                  <img
                    src={mainArticle.featured_image_url}
                    alt={mainTitle}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 w-full p-4 pb-6">
                    <h3 className="text-xl sm:text-2xl font-extrabold leading-tight text-white drop-shadow-lg line-clamp-2">
                      {mainTitle}
                    </h3>
                    {mainSummary && (
                      <p className="text-white text-sm line-clamp-1 opacity-90 mt-1">
                        {mainSummary}
                      </p>
                    )}
                  </div>
                  <div className="absolute top-2 left-2 flex items-center gap-2 z-10">
                    {mainArticle.categories && (
                      <Badge className="bg-black text-white border border-white/20 text-xs px-3 py-1 rounded-full font-semibold tracking-wide opacity-80 shadow">{mainArticle.categories.name}</Badge>
                    )}
                  </div>
                </div>
              )}
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
        {articles.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/80 transition-all z-20"
              aria-label="Previous article"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/80 transition-all z-20"
              aria-label="Next article"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedArticles;
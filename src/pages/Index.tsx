import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { LiveStreamSection } from '@/components/news/LiveStreamSection';
import { Button } from '@/components/ui/button';
import { BreakingNewsTicker } from '@/components/news/BreakingNewsTicker';
import { useLanguage } from '@/contexts/LanguageContext';
import { VideoSection } from '@/components/news/VideoSection';
import WeatherReport from '@/components/news/WeatherReport';
import StockWidget from '@/components/news/StockWidget';
import { FeaturedArticles } from '@/components/news/FeaturedArticles';
import { Calendar } from 'lucide-react';
import { AdSlot } from '@/components/news/AdSlot';
import { AboutUsSection } from '@/components/news/AboutUsSection';

const Index = () => {
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [liveStreams, setLiveStreams] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const { language, t } = useLanguage();

  const ARTICLES_PER_PAGE = 8;

  const fetchRecentArticles = async (pageNum: number) => {
    setIsFetchingMore(true);
    const { data: articlesData, error } = await supabase
      .from('articles')
      .select('*, categories(name, slug), profiles(full_name)')
      .order('published_at', { ascending: false })
      .range(pageNum * ARTICLES_PER_PAGE, (pageNum + 1) * ARTICLES_PER_PAGE - 1);

    if (error) {
      console.error("Error fetching recent articles:", error);
      setHasMore(false);
    } else {
      setRecentArticles(prev => pageNum === 0 ? articlesData : [...prev, ...articlesData]);
      if (articlesData.length < ARTICLES_PER_PAGE) {
        setHasMore(false);
      }
    }
    setIsFetchingMore(false);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const { data: allArticles, error } = await supabase
        .from('articles')
          .select('*, categories(name, slug), profiles(full_name)')
          .order('published_at', { ascending: false });

        if (error) throw error;

        const featured = allArticles.filter(a => a.is_featured);
        setFeaturedArticles(featured);
        
        fetchRecentArticles(0);

        const { data: videosData } = await supabase.from('videos').select('*').order('created_at', { ascending: false }).limit(4);
        setVideos(videosData || []);
        
        const { data: streamsData } = await supabase.from('live_streams').select('*').eq('is_active', true);
        setLiveStreams(streamsData || []);

    } catch (error) {
        console.error("Error fetching page data:", error);
    } finally {
      setIsLoading(false);
    }
    };
    
    fetchInitialData();
  }, []);

  const handleShowMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchRecentArticles(nextPage);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black">
      <main className="container mx-auto px-4 py-6">
        <div className="my-6">
          <AdSlot slotNumber={2} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          <div className="lg:col-span-3">
        {featuredArticles.length > 0 && (
          <>
            <FeaturedArticles articles={featuredArticles} />
            <div className="my-6">
              <AdSlot slotNumber={4} />
            </div>
            {liveStreams.length > 0 && (
              <div className="my-6">
                <LiveStreamSection streams={liveStreams} />
              </div>
            )}
          </>
        )}
          </div>
          <div className="lg:col-span-1">
             <div className="grid grid-cols-1 gap-4">
               <div><WeatherReport /></div>
               <div><StockWidget /></div>
               <div><AdSlot slotNumber={1} /></div>
             </div>
          </div>
        </div>

              <section className="mb-12">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-6 border-b-2 border-red-600 pb-2 inline-block">
                  {t('latest_news')}
                </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                  {recentArticles.map((article) => {
                    const title = language === 'hi' && article.title_hi ? article.title_hi : article.title;
                    return (
                      <Link key={article.id} to={`/article/${article.slug}`} className="block focus:outline-none focus:ring-2 focus:ring-black rounded-2xl">
                       <Card className="hover:shadow-2xl transition-shadow cursor-pointer h-full flex flex-col relative overflow-hidden border border-gray-200 dark:border-gray-700">
                         <CardContent className="flex-1 flex flex-col p-0">
                            {article.featured_image_url && (
                             <div className="relative">
                              <img
                                src={article.featured_image_url}
                                alt={title}
                                 className="w-full h-48 object-cover"
                              />
                             </div>
                            )}
                            <div className="p-4 space-y-2 flex-1 flex flex-col">
                              <div className="flex items-center space-x-2">
                                {article.categories && (
                                 <Badge variant="outline" className="border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-xs font-medium px-2 py-0.5 rounded-md">
                                    {article.categories.name}
                                  </Badge>
                                )}
                              </div>
                              <h3 className="font-semibold leading-tight line-clamp-2 text-black dark:text-white">
                                {title}
                              </h3>
                              <div className="flex items-center text-sm text-gray-500 mt-auto">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>{new Date(article.published_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
          {isFetchingMore && (
            <div className="text-center mt-8">
               <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            </div>
          )}
          {hasMore && !isFetchingMore && (
            <div className="text-center mt-8">
              <Button
                onClick={handleShowMore}
                variant="outline"
                className="bg-red-600 text-white hover:bg-red-700 hover:text-white"
              >
                {t('view_more')}
              </Button>
            </div>
          )}
              </section>

        <div className="my-6">
          <AdSlot slotNumber={3} />
        </div>

        {videos.length > 0 && (
          <VideoSection videos={videos} />
        )}
        
        <AboutUsSection />
      </main>
    </div>
  );
};

export default Index;

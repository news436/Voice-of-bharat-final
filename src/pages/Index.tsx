import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Play, Eye, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { AdSlot } from '@/components/news/AdSlot';
import { BreakingNewsTicker } from '@/components/news/BreakingNewsTicker';
import { FeaturedArticles } from '@/components/news/FeaturedArticles';
import { VideoSection } from '@/components/news/VideoSection';
import { LiveStreamSection } from '@/components/news/LiveStreamSection';
import apiClient from '@/utils/api';
import WeatherReport from '@/components/news/WeatherReport';
import StockWidget from '@/components/news/StockWidget';
import { AboutUsSection } from '@/components/news/AboutUsSection';
import { NewsletterSection } from '@/components/news/NewsletterSection';
import { formatDistanceToNow } from 'date-fns';

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
  const { userProfile } = useAuth();

  const ARTICLES_PER_PAGE = 8;

  const fetchRecentArticles = async (pageNum: number) => {
    setIsFetchingMore(true);
    try {
      const response = await apiClient.getArticles({
        page: pageNum + 1,
        limit: ARTICLES_PER_PAGE
      });

      if (response.success) {
        setRecentArticles(prev => pageNum === 0 ? response.data : [...prev, ...response.data]);
        if (response.data.length < ARTICLES_PER_PAGE) {
          setHasMore(false);
        }
      } else {
        console.error("Error fetching recent articles:", response.error);
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching recent articles:", error);
      setHasMore(false);
    } finally {
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // Fetch all articles to get featured ones
        const allArticlesResponse = await apiClient.getArticles({ limit: 100 });
        if (allArticlesResponse.success) {
          const featured = allArticlesResponse.data.filter((a: any) => a.is_featured);
          setFeaturedArticles(featured);
          
          fetchRecentArticles(0);
        }

        // Fetch videos using API client
        const videosResponse = await apiClient.getVideos();
        if (videosResponse.success) {
          setVideos(videosResponse.data.slice(0, 4)); // Limit to 4 videos
        }
        
        // Fetch active live streams using API client
        const streamsResponse = await apiClient.getActiveLiveStreams();
        if (streamsResponse.success) {
          setLiveStreams(streamsResponse.data);
        }

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

  function formatShortTimeAgo(dateString: string) {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  }

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
               {/* Ad Slot 6 - Homepage sidebar */}
               <div><AdSlot slotNumber={6} /></div>
             </div>
          </div>
        </div>

        {/* Ad Slot 5 - Above Latest News */}
        <div className="mb-6">
          <AdSlot slotNumber={5} />
        </div>

              <section className="mb-12">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-6 border-b-2 border-red-600 pb-2 inline-block">
                  {t('latest_news')}
                </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                  {recentArticles.map((article) => {
                    const title = language === 'hi' && article.title_hi ? article.title_hi : article.title;
                    return (
                      <Link key={article.id} to={`/article/${article.slug}`} className="block focus:outline-none focus:ring-2 focus:ring-black rounded-xl">
                        <div className="rounded-xl shadow bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden hover:shadow-xl transition-all">
                          {article.featured_image_url && (
                            <img
                              src={article.featured_image_url}
                              alt={title}
                              className="w-full h-28 md:h-40 lg:h-48 object-cover"
                            />
                          )}
                          <div className="p-3 flex-1 flex flex-col">
                            <h3 className="font-bold text-sm mb-1 line-clamp-2 text-black dark:text-white">
                              {title}
                            </h3>
                            <div className="flex items-center text-xs text-gray-500 mt-auto whitespace-nowrap overflow-hidden text-ellipsis">
                              <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                              <span>{new Date(article.published_at).toLocaleDateString()}</span>
                              <span className="mx-1">·</span>
                              <span>{formatShortTimeAgo(article.published_at)}</span>
                            </div>
                          </div>
                        </div>
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
        
        {/* Ad Slot 7 - Above About Us section */}
        <div className="my-6">
          <AdSlot slotNumber={7} />
        </div>
        
        <AboutUsSection />
        <NewsletterSection />
      </main>
    </div>
  );
};

export default Index;


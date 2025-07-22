import { useState, useEffect, Suspense, lazy } from 'react';
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
import WeatherReport from '@/components/news/WeatherReport';
import StockWidget from '@/components/news/StockWidget';
import { formatDistanceToNow } from 'date-fns';
import { useArticleCache } from '@/contexts/ArticleCacheContext';

const FeaturedArticles = lazy(() => import('@/components/news/FeaturedArticles'));
const VideoSection = lazy(() => import('@/components/news/VideoSection'));
const LiveStreamSection = lazy(() => import('@/components/news/LiveStreamSection'));
const AboutUsSection = lazy(() => import('@/components/news/AboutUsSection'));
const NewsletterSection = lazy(() => import('@/components/news/NewsletterSection'));
const LatestNews = lazy(() => import('@/components/news/LatestNews'));

const Index = () => {
  const { getArticle, setArticles } = useArticleCache();
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const { language, t } = useLanguage();
  const { userProfile } = useAuth();
  const [liveStreams, setLiveStreams] = useState<any[]>([]);

  const ARTICLES_PER_PAGE = 8;

  // Load from localStorage cache first
  useEffect(() => {
    const cached = localStorage.getItem('latestNewsCache');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setAllArticles(parsed);
        setArticles(parsed);
        setLoading(false);
      } catch {}
    }
    // Always fetch fresh data
    const fetchAllArticles = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false });
      if (data) {
        setArticles(data);
        setAllArticles(data);
        localStorage.setItem('latestNewsCache', JSON.stringify(data));
      }
      setLoading(false);
    };
    fetchAllArticles();
  }, []);

  // Filter for featured, breaking, latest, etc. from allArticles
  const featuredArticles = allArticles.filter(a => a.is_featured);
  const breakingArticles = allArticles.filter(a => a.is_breaking);
  // Latest news is now ALL articles, not filtered
  const latestArticles = allArticles;

  const fetchRecentArticles = async (pageNum: number) => {
    setIsFetchingMore(true);
    try {
      const response = await supabase
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false })
        .range(pageNum * ARTICLES_PER_PAGE, (pageNum + 1) * ARTICLES_PER_PAGE - 1);

      if (response.data) {
        setAllArticles(prev => pageNum === 0 ? response.data : [...prev, ...response.data]);
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
        // Fetch videos using Supabase
        const videosResponse = await supabase
          .from('videos')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4);
        if (videosResponse.data) {
          setVideos(videosResponse.data);
        }
        
        // Fetch active live streams using Supabase
        const streamsResponse = await supabase
          .from('live_streams')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        if (streamsResponse.data) {
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
            {loading ? (
              <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse mb-6" />
            ) : featuredArticles.length > 0 && (
              <Suspense fallback={<div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse mb-6" />}>
                <FeaturedArticles articles={featuredArticles} />
              </Suspense>
            )}
            <div className="my-6">
              <AdSlot slotNumber={4} />
            </div>
            {loading ? (
              <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse mb-6" />
            ) : null
            }
            {loading ? (
              <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse mb-6" />
            ) : (
              <>
                {liveStreams.length > 0 && (
                  <Suspense fallback={<div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse mb-6" />}>
                    <LiveStreamSection streams={liveStreams} />
                  </Suspense>
                )}
              </>
            )}
          </div>
          <div className="lg:col-span-1">
             <div className="grid grid-cols-1 gap-4">
               <div><WeatherReport /></div>
               <div><StockWidget /></div>
               <div><AdSlot slotNumber={1} /></div>
               <div><AdSlot slotNumber={12} /></div>
             </div>
          </div>
        </div>

        {/* Ad Slot 5 - Above Latest News */}
        <div className="mb-6">
          <AdSlot slotNumber={5} />
        </div>

        {/* Latest News - full width section below the grid and above videos */}
        <div className="mb-12">
          <Suspense fallback={<div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse mb-6" />}>
            <LatestNews articles={latestArticles} />
          </Suspense>
          {latestArticles.length === 0 && (
            <div className="text-center text-gray-500 my-8">No news articles available.</div>
          )}
        </div>

        {/* Ad Slot 14 - Between Latest News and Latest Videos */}
        <div className="my-6">
          <AdSlot slotNumber={14} />
        </div>

        {videos.length > 0 && (
          <Suspense fallback={<div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse mb-6" />}>
            <VideoSection videos={videos} />
          </Suspense>
        )}
        
        <Suspense fallback={<div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse mb-6" />}>
          <AboutUsSection />
        </Suspense>
        {/* Ad Slot 7 - Below About Us section */}
        <div className="my-6">
          <AdSlot slotNumber={7} />
        </div>
        <Suspense fallback={<div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse mb-6" />}>
          <NewsletterSection />
        </Suspense>

        {/* Ad Slot 3 - Homepage bottom banner */}
        <div className="my-6">
          <AdSlot slotNumber={3} />
        </div>
      </main>
    </div>
  );
};

export default Index;



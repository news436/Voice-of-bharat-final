import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Play } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdSlot } from '@/components/news/AdSlot';
import apiClient from '@/utils/api';

const StatePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [state, setState] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showingAllIndia, setShowingAllIndia] = useState(false);
  const { language, t } = useLanguage();

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all states for sidebar using API client
        const statesResponse = await apiClient.getStates();
        if (statesResponse.success) {
          setStates(statesResponse.data);
        }
        
        // Fetch all categories for header/sidebar using API client
        const categoriesResponse = await apiClient.getCategories();
        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data);
        }

        // Fetch specific state using API client
        const stateResponse = await apiClient.get(`/states/${slug}`);
        if (!stateResponse.success || !stateResponse.data) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setState(stateResponse.data);
        
        // Fetch articles for this state using API client
        const articlesResponse = await apiClient.getArticles({ 
          state: stateResponse.data.slug 
        });
        if (articlesResponse.success) {
          setArticles(articlesResponse.data);
        }
        
        // Fetch videos for this state using API client
        const videosResponse = await apiClient.getVideos();
        let stateVideos: any[] = [];
        if (videosResponse.success) {
          stateVideos = videosResponse.data.filter((video: any) => 
            video.state_id === stateResponse.data.id
          );
          setVideos(stateVideos);
        }

        // If no state-specific content, fetch all India news as fallback
        if ((!articlesResponse.success || articlesResponse.data.length === 0) && 
            (!videosResponse.success || stateVideos.length === 0)) {
          setShowingAllIndia(true);
          
          // Fetch all India articles
          const allIndiaArticlesResponse = await apiClient.getArticles({ limit: 20 });
          if (allIndiaArticlesResponse.success) {
            setArticles(allIndiaArticlesResponse.data);
          }
          
          // Fetch all India videos
          const allIndiaVideosResponse = await apiClient.getVideos();
          if (allIndiaVideosResponse.success) {
            setVideos(allIndiaVideosResponse.data.slice(0, 12)); // Limit to 12 videos
          }
        }
      } catch (error) {
        console.error('Error fetching state data:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (notFound || !state) {
    return (
      <div className="flex-1 flex items-center justify-center p-10">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-destructive mb-2">404 - State Not Found</h1>
            <p className="mb-4 text-muted-foreground">Sorry, the state you are looking for does not exist.</p>
            <Link to="/" className="text-primary underline font-medium">Go Home</Link>
          </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black">
      <main className="container mx-auto px-4 py-8">
        {/* Ad Slot 5 - State pages top banner */}
        <div className="mb-6">
          <AdSlot slotNumber={5} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Articles */}
            <section>
              <h2 className="text-2xl font-bold text-black dark:text-white mb-6 pb-2 border-b-2 border-red-600 inline-block">
                {showingAllIndia ? `${t('news_articles')} - All India` : `${t('news_articles')} - ${state.name}`}
              </h2>
              {showingAllIndia && (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    No specific content found for {state.name}. Showing all India news instead.
                  </p>
                </div>
              )}
              {articles.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-300">{t('no_articles_in_state')}</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                  {articles.map((article) => {
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
              )}
            </section>

            {/* Videos */}
            {videos.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-black dark:text-white mb-6 pb-2 border-b-2 border-red-600 inline-block">
                {showingAllIndia ? `${t('videos')} - All India` : `${t('videos')} - ${state.name}`}
              </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                  {videos.map((video) => {
                    const title = language === 'hi' && video.title_hi ? video.title_hi : video.title;
                    return (
                      <Link key={video.id} to={`/video/${video.id}`} className="block focus:outline-none focus:ring-2 focus:ring-black rounded-xl">
                        <div className="rounded-xl shadow bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden hover:shadow-xl transition-all">
                          {video.thumbnail_url && (
                            <div className="relative">
                              <img
                                src={video.thumbnail_url}
                                alt={title}
                                className="w-full h-28 md:h-40 lg:h-48 object-cover"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                                <Play className="h-8 w-8 text-white" />
                              </div>
                            </div>
                          )}
                          <div className="p-3 flex-1 flex flex-col">
                            <h3 className="font-bold text-sm mb-1 line-clamp-2 text-black dark:text-white">
                              {title}
                            </h3>
                            <div className="flex items-center text-xs text-gray-500 mt-auto whitespace-nowrap overflow-hidden text-ellipsis">
                              <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                              <span>{new Date(video.created_at).toLocaleDateString()}</span>
                              <span className="mx-1">·</span>
                              <span>{formatShortTimeAgo(video.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
              )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* State Info */}
            <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-black/90">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-black dark:text-white mb-4">
                  {language === 'hi' && state.name_hi ? state.name_hi : state.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {language === 'hi' && state.description_hi ? state.description_hi : state.description}
                </p>
                <div className="text-sm text-gray-500">
                  <p><strong>Articles:</strong> {articles.length}</p>
                  <p><strong>Videos:</strong> {videos.length}</p>
                </div>
              </CardContent>
            </Card>

            {/* Other States */}
            {states.length > 1 && (
              <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-black/90">
              <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-black dark:text-white mb-4">{t('other_states')}</h3>
                <div className="space-y-2">
                    {states
                      .filter(s => s.id !== state.id)
                      .slice(0, 5)
                      .map((otherState) => (
                      <Link
                          key={otherState.id}
                          to={`/state/${otherState.slug}`}
                          className="block text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          {language === 'hi' && otherState.name_hi ? otherState.name_hi : otherState.name}
                      </Link>
                      ))}
                </div>
              </CardContent>
            </Card>
            )}

            {/* Ad Slot 6 - State pages sidebar */}
            <div>
              <AdSlot slotNumber={6} />
            </div>
          </div>
        </div>
        
        {/* Ad Slot 7 - State pages bottom banner */}
        <div className="mt-8">
          <AdSlot slotNumber={7} />
        </div>
      </main>
    </div>
  );
};

export default StatePage; 
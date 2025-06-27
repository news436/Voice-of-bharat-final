import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Play, MapPin, FileText, Video, AlertCircle } from 'lucide-react';
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
        if (videosResponse.success) {
          const stateVideos = videosResponse.data.filter((video: any) => 
            video.state_id === stateResponse.data.id
          );
          setVideos(stateVideos);
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
                {t('news_articles')} - {state.name}
              </h2>
              {articles.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                    No Articles Available
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    No articles are currently available for {state.name}.
                  </p>
                </div>
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
                {t('videos')} - {state.name}
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
                <div className="flex items-center mb-4">
                  <MapPin className="h-6 w-6 text-red-600 mr-3" />
                  <h3 className="text-xl font-bold text-black dark:text-white">{state.name}</h3>
                </div>
                {state.description && (
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    {state.description}
                  </p>
                )}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-black dark:text-white">Articles</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {articles.length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center">
                      <Video className="h-5 w-5 text-red-600 mr-2" />
                      <span className="text-sm font-medium text-black dark:text-white">Videos</span>
                    </div>
                    <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      {videos.length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Other States */}
              <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-black/90">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-black dark:text-white mb-4 flex items-center">
                  <MapPin className="h-5 w-5 text-gray-600 mr-2" />
                  Other States
                </h3>
                <div className="space-y-3">
                  {states.slice(0, 8).map((otherState) => (
                      <Link
                          key={otherState.id}
                          to={`/state/${otherState.slug}`}
                      className={`block p-3 rounded-lg border transition-all hover:shadow-md ${
                        otherState.slug === slug 
                          ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' 
                          : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                          <span className={`text-sm font-medium ${
                            otherState.slug === slug 
                              ? 'text-red-800 dark:text-red-200' 
                              : 'text-black dark:text-white'
                          }`}>
                            {otherState.name}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {otherState.slug === slug ? 'Current' : 'View'}
                        </Badge>
                      </div>
                      </Link>
                      ))}
                </div>
              </CardContent>
            </Card>

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
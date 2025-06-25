import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Play } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdSlot } from '@/components/news/AdSlot';

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Fetch all states for sidebar
      const { data: allStates } = await supabase.from('states').select('*').order('name');
      setStates(allStates || []);
      // Fetch all categories for header/sidebar
      const { data: allCategories } = await supabase.from('categories').select('*').order('name');
      setCategories(allCategories || []);

      const { data: stateData, error: stateError } = await supabase.from('states').select('*').eq('slug', slug).single();
      if (stateError || !stateData) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setState(stateData);
      
      const { data: stateArticles } = await supabase
        .from('articles')
        .select('*, categories(name, slug), profiles(full_name), states(name, slug)')
        .eq('state_id', stateData.id)
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      setArticles(stateArticles || []);
      
      const { data: stateVideos } = await supabase
        .from('videos')
        .select('*, categories(name), states(name, slug)')
        .eq('state_id', stateData.id)
        .order('created_at', { ascending: false });
      setVideos(stateVideos || []);
      
      setLoading(false);
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
                {t('news_articles')}
              </h2>
              {articles.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-300">{t('no_articles_in_state')}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {articles.map((article) => (
                    <Link key={article.id} to={`/article/${article.slug}`} className="block focus:outline-none focus:ring-2 focus:ring-red-600 rounded-2xl">
                      <Card className="hover:shadow-2xl transition-shadow cursor-pointer h-full flex flex-col border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-black/90">
                        <CardContent className="p-0 flex-1 flex flex-col">
                          {article.featured_image_url && (
                            <img
                              src={article.featured_image_url}
                              alt={article.title}
                              className="w-full h-auto object-cover rounded-t-2xl"
                            />
                          )}
                          <div className="space-y-2 flex-1 flex flex-col p-4">
                            <div className="flex items-center space-x-2">
                              {article.is_breaking && (
                                <Badge variant="destructive">Breaking</Badge>
                              )}
                            </div>
                            <h3 className="font-semibold leading-tight line-clamp-2 text-black dark:text-white">
                              {article.title}
                            </h3>
                            {article.summary && (
                              <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">{article.summary}</p>
                            )}
                            <div className="flex items-center text-sm text-gray-500 mt-auto">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{new Date(article.published_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Videos */}
            {videos.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-black dark:text-white mb-6 pb-2 border-b-2 border-red-600 inline-block">
                {t('videos')}
              </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {videos.map((video) => (
                    <Link key={video.id} to={`/video/${video.id}`} className="block focus:outline-none focus:ring-2 focus:ring-red-600 rounded-2xl">
                      <Card className="hover:shadow-2xl transition-shadow cursor-pointer h-full flex flex-col border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-black/90">
                        <CardContent className="p-0 flex-1 flex flex-col">
                          {video.thumbnail_url && (
                            <div className="relative">
                            <img
                              src={video.thumbnail_url}
                              alt={video.title}
                              className="w-full h-auto object-cover rounded-t-2xl"
                            />
                              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-t-2xl">
                                <Play className="h-12 w-12 text-white" />
                              </div>
                            </div>
                          )}
                          <div className="space-y-2 flex-1 flex flex-col p-4">
                            <div className="flex items-center space-x-2">
                              {video.categories && (
                                <Badge variant="outline" className="border-black text-black dark:border-white dark:text-white">
                                  {video.categories.name}
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-semibold leading-tight line-clamp-2 text-black dark:text-white">
                              {video.title}
                            </h3>
                            {video.description && (
                              <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">{video.description}</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
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
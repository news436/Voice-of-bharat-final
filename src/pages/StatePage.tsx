import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Play } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

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
    <div className="bg-gray-50 dark:bg-black/95">
      <main className="max-w-7xl mx-auto px-2 sm:px-6 py-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white mb-10 flex items-center gap-2">
          <span className="block w-2 h-8 bg-red-600 rounded-full mr-2" />
          {state.name} {t('news_articles')} & {t('videos')}
        </h1>
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
                              className="w-full h-48 object-cover rounded-t-2xl"
                            />
                          )}
                          <div className="space-y-2 flex-1 flex flex-col p-4">
                            <div className="flex items-center space-x-2">
                              {article.categories && (
                                <Badge variant="outline" className="border-black text-black dark:border-white dark:text-white">
                                  {article.categories.name}
                                </Badge>
                              )}
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
            <section>
              <h2 className="text-2xl font-bold text-black dark:text-white mb-6 pb-2 border-b-2 border-red-600 inline-block">
                {t('videos')}
              </h2>
              {videos.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-300">No videos found for this state.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {videos.map((video) => (
                    <a key={video.id} href={video.video_url} target="_blank" rel="noopener noreferrer" className="block focus:outline-none focus:ring-2 focus:ring-red-600 rounded-2xl">
                      <Card className="hover:shadow-2xl transition-shadow cursor-pointer h-full flex flex-col border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-black/90">
                        <CardContent className="p-0 flex-1 flex flex-col">
                          {video.thumbnail_url && (
                            <img
                              src={video.thumbnail_url}
                              alt={video.title}
                              className="w-full h-48 object-cover rounded-t-2xl"
                            />
                          )}
                          <div className="space-y-2 flex-1 flex flex-col p-4">
                            <div className="flex items-center space-x-2">
                              {video.categories && (
                                <Badge variant="outline" className="border-black text-black dark:border-white dark:text-white">
                                  {video.categories.name}
                                </Badge>
                              )}
                              <Badge className="bg-red-600 text-white capitalize">{video.video_type}</Badge>
                            </div>
                            <h3 className="font-semibold leading-tight line-clamp-2 text-black dark:text-white">
                              {video.title}
                            </h3>
                            {video.description && (
                              <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">{video.description}</p>
                            )}
                            <div className="flex items-center text-sm text-gray-500 mt-auto">
                              <Play className="h-4 w-4 mr-1" />
                              <span>{new Date(video.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </a>
                  ))}
                </div>
              )}
            </section>
          </div>
          {/* Sidebar */}
          <div className="space-y-8">
            {/* Categories */}
            <Card className="bg-white dark:bg-black rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-black dark:text-white">
                  <span className="block w-2 h-6 bg-red-600 rounded-full mr-2" />
                  {t('categories')}
                </h3>
                <div className="space-y-2">
                  {categories.map((category) => {
                    const name = language === 'hi' && category.name_hi ? category.name_hi : category.name;
                    return (
                      <Link
                        key={category.id}
                        to={`/category/${category.slug}`}
                        className="block font-bold text-black dark:text-white px-4 py-2 rounded-xl transition-all border-l-4 border-transparent hover:border-red-600 hover:bg-red-50 dark:hover:bg-gray-900 hover:text-red-700 dark:hover:text-red-400"
                      >
                        {name}
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            {/* States */}
            <Card className="bg-white dark:bg-black rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-black dark:text-white">
                  <span className="block w-2 h-6 bg-red-600 rounded-full mr-2" />
                  {t('states')}
                </h3>
                <div className="space-y-2">
                  {states.map((s) => {
                    const name = language === 'hi' && s.name_hi ? s.name_hi : s.name;
                    return (
                      <Link
                        key={s.id}
                        to={`/state/${s.slug}`}
                        className={`block font-bold text-black dark:text-white px-4 py-2 rounded-xl transition-all border-l-4 border-transparent hover:border-red-600 hover:bg-red-50 dark:hover:bg-gray-900 hover:text-red-700 dark:hover:text-red-400${s.id === state.id ? ' bg-red-50 dark:bg-gray-900 font-bold text-red-700 dark:text-red-400 border-red-600' : ''}`}
                      >
                        {name}
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StatePage; 
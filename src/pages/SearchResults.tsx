import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Play } from 'lucide-react';
import { NewsHeader } from '@/components/news/NewsHeader';
import { useLanguage } from '@/contexts/LanguageContext';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchResults = () => {
  const query = useQuery();
  const rawSearchTerm = query.get('q') || '';
  const searchTerm = rawSearchTerm.trim().toLowerCase();
  const [articles, setArticles] = useState<any[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Fetch all categories for header
      const { data: cats } = await supabase.from('categories').select('*').order('name');
      setCategories(cats || []);
      // Fetch all states for header
      const { data: sts } = await supabase.from('states').select('*').order('name');
      setStates(sts || []);
      // Featured articles: title OR summary OR title_hi OR summary_hi
      let featuredQuery = supabase
        .from('articles')
        .select('*, categories(name, slug), states(name, slug)')
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('published_at', { ascending: false });
      if (searchTerm) {
        featuredQuery = featuredQuery.or(`title.ilike.%${searchTerm}%,summary.ilike.%${searchTerm}%,title_hi.ilike.%${searchTerm}%,summary_hi.ilike.%${searchTerm}%`);
      }
      const { data: featured } = await featuredQuery;
      setFeaturedArticles(featured || []);
      // Regular articles: title OR summary OR title_hi OR summary_hi
      let articleQuery = supabase
        .from('articles')
        .select('*, categories(name, slug), states(name, slug)')
        .eq('status', 'published')
        .eq('is_featured', false)
        .order('published_at', { ascending: false });
      if (searchTerm) {
        articleQuery = articleQuery.or(`title.ilike.%${searchTerm}%,summary.ilike.%${searchTerm}%,title_hi.ilike.%${searchTerm}%,summary_hi.ilike.%${searchTerm}%`);
      }
      const { data: arts } = await articleQuery;
      setArticles(arts || []);
      // Videos: title OR description OR title_hi OR description_hi
      let videoQuery = supabase
        .from('videos')
        .select('*, categories(name), states(name, slug)')
        .order('created_at', { ascending: false });
      if (searchTerm) {
        videoQuery = videoQuery.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,title_hi.ilike.%${searchTerm}%,description_hi.ilike.%${searchTerm}%`);
      }
      const { data: vids } = await videoQuery;
      setVideos(vids || []);
      setLoading(false);
    };
    fetchData();
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col">
      <NewsHeader categories={categories} states={states} />
      <main className="flex-1 container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-6">Search Results</h1>
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black"></div>
            <span className="ml-4 text-gray-600">Searching for "{rawSearchTerm}"...</span>
          </div>
        ) : (
          <>
            {/* Featured Stories */}
            {featuredArticles.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-black dark:text-white mb-4 border-b-2 border-black pb-2">{t('featured_stories')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {featuredArticles.map((article) => {
                    const title = language === 'hi' && article.title_hi ? article.title_hi : article.title;
                    const summary = language === 'hi' && article.summary_hi ? article.summary_hi : article.summary;
                    return (
                      <Link key={article.id} to={`/article/${article.slug}`} className="block focus:outline-none focus:ring-2 focus:ring-black rounded-2xl">
                        <Card className="hover:shadow-2xl transition-shadow cursor-pointer h-full flex flex-col">
                          <CardContent className="p-4 flex-1 flex flex-col">
                            {article.featured_image_url && (
                              <img
                                src={article.featured_image_url}
                                alt={title}
                                className="w-full h-48 object-cover rounded-2xl mb-4"
                              />
                            )}
                            <div className="space-y-2 flex-1 flex flex-col">
                              <div className="flex items-center space-x-2">
                                {article.categories && (
                                  <Badge variant="outline" className="border-black text-black">
                                    {language === 'hi' && article.categories.name_hi ? article.categories.name_hi : article.categories.name}
                                  </Badge>
                                )}
                                {article.is_breaking && (
                                  <Badge variant="destructive">Breaking</Badge>
                                )}
                              </div>
                              <h3 className="font-semibold leading-tight line-clamp-2 text-black dark:text-white">
                                {title}
                              </h3>
                              {summary && (
                                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">{summary}</p>
                              )}
                              <div className="flex items-center text-sm text-gray-500 mt-auto">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>{article.published_at ? new Date(article.published_at).toLocaleDateString() : ''}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
            {/* Articles */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-4 border-b-2 border-black pb-2">{t('latest_news')}</h2>
              {articles.length === 0 ? (
                <div className="text-gray-500">No articles found for "{rawSearchTerm}".</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {articles.map((article) => {
                    const title = language === 'hi' && article.title_hi ? article.title_hi : article.title;
                    const summary = language === 'hi' && article.summary_hi ? article.summary_hi : article.summary;
                    return (
                      <Link key={article.id} to={`/article/${article.slug}`} className="block focus:outline-none focus:ring-2 focus:ring-black rounded-2xl">
                        <Card className="hover:shadow-2xl transition-shadow cursor-pointer h-full flex flex-col">
                          <CardContent className="p-4 flex-1 flex flex-col">
                            {article.featured_image_url && (
                              <img
                                src={article.featured_image_url}
                                alt={title}
                                className="w-full h-48 object-cover rounded-2xl mb-4"
                              />
                            )}
                            <div className="space-y-2 flex-1 flex flex-col">
                              <div className="flex items-center space-x-2">
                                {article.categories && (
                                  <Badge variant="outline" className="border-black text-black">
                                    {language === 'hi' && article.categories.name_hi ? article.categories.name_hi : article.categories.name}
                                  </Badge>
                                )}
                                {article.is_breaking && (
                                  <Badge variant="destructive">Breaking</Badge>
                                )}
                              </div>
                              <h3 className="font-semibold leading-tight line-clamp-2 text-black dark:text-white">
                                {title}
                              </h3>
                              {summary && (
                                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">{summary}</p>
                              )}
                              <div className="flex items-center text-sm text-gray-500 mt-auto">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>{article.published_at ? new Date(article.published_at).toLocaleDateString() : ''}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
            {/* Videos */}
            {videos.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-black dark:text-white mb-4 border-b-2 border-black pb-2">Videos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {videos.map((video) => (
                    <Link key={video.id} to={`/video/${video.id}`} className="block focus:outline-none focus:ring-2 focus:ring-black rounded-2xl">
                      <Card className="hover:shadow-2xl transition-shadow cursor-pointer h-full flex flex-col">
                        <CardContent className="p-4 flex-1 flex flex-col">
                          {video.thumbnail_url && (
                            <img
                              src={video.thumbnail_url}
                              alt={video.title}
                              className="w-full h-48 object-cover rounded-2xl mb-4"
                            />
                          )}
                          <div className="space-y-2 flex-1 flex flex-col">
                            <div className="flex items-center space-x-2">
                              {video.categories && (
                                <Badge variant="outline" className="border-black text-black">
                                  {video.categories.name}
                                </Badge>
                              )}
                              {video.states && (
                                <Badge variant="secondary">{video.states.name}</Badge>
                              )}
                            </div>
                            <h3 className="font-semibold leading-tight line-clamp-2 flex items-center text-black dark:text-white">
                              <Play className="h-4 w-4 mr-1 inline-block text-black" />
                              {video.title}
                            </h3>
                            {video.description && (
                              <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">{video.description}</p>
                            )}
                            <div className="flex items-center text-sm text-gray-500 mt-auto">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{video.created_at ? new Date(video.created_at).toLocaleDateString() : ''}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}
            {/* No results at all */}
            {featuredArticles.length === 0 && articles.length === 0 && videos.length === 0 && (
              <div className="text-gray-500">No results found for "{rawSearchTerm}".</div>
            )}
          </>
        )}
      </main>
      <Footer categories={categories} />
    </div>
  );
};

function Footer({ categories }: { categories: any[] }) {
  const { language, t } = useLanguage();
  return (
    <footer className="bg-gray-900 text-white py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-red-400">Voice Of Bharat</h3>
            <p className="text-gray-300">
              Your trusted source for latest news and updates from across India.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t('quick_links')}</h4>
            <div className="space-y-2">
              <Link to="/about" className="block text-gray-300 hover:text-white">{t('about_us')}</Link>
              <Link to="/contact" className="block text-gray-300 hover:text-white">{t('contact')}</Link>
              <Link to="/privacy" className="block text-gray-300 hover:text-white">{t('privacy_policy')}</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t('categories')}</h4>
            <div className="space-y-2">
              {categories.slice(0, 5).map((category) => {
                const name = language === 'hi' && category.name_hi ? category.name_hi : category.name;
                return (
                  <Link
                    key={category.id}
                    to={`/category/${category.slug}`}
                    className="block text-gray-300 hover:text-white"
                  >
                    {name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t('connect')}</h4>
            <div className="space-y-2">
              <a href="#" className="block text-gray-300 hover:text-white">{t('facebook')}</a>
              <a href="#" className="block text-gray-300 hover:text-white">{t('twitter')}</a>
              <a href="#" className="block text-gray-300 hover:text-white">{t('youtube')}</a>
              <a href="#" className="block text-gray-300 hover:text-white">{t('instagram')}</a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © 2024 Voice Of Bharat. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default SearchResults; 
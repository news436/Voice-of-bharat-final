import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, Video, AlertCircle, Tag } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdSlot } from '@/components/news/AdSlot';
import { SupabaseCategory, SupabaseArticle } from '@/integrations/supabase/types';
import { useArticleCache } from '@/contexts/ArticleCacheContext';

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<SupabaseCategory | null>(null);
  const [articles, setArticles] = useState<SupabaseArticle[]>([]);
  const [categories, setCategories] = useState<SupabaseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();
  const { getArticle, setArticle: setArticleCache } = useArticleCache();

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
    const fetchCategoryData = async () => {
      setLoading(true);
      
      try {
        // Fetch all categories for sidebar using Supabase client
        const categoriesResponse = await supabase
          .from('categories')
          .select('*');
        if (categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        }

        // Fetch category using Supabase client
        const categoryResponse = await supabase
          .from('categories')
          .select('*')
          .eq('slug', slug);
        if (!categoryResponse.data || categoryResponse.data.length === 0) {
          setLoading(false);
          return;
        }
        setCategory(categoryResponse.data[0]);
        
        // Try to get articles for this category from cache
        // We'll use the cache if all articles for this category are present
        let cachedArticles = [];
        const articlesResponse = await supabase
          .from('articles')
          .select('*')
          .eq('category_id', categoryResponse.data[0].id);
        if (articlesResponse.data) {
          // Store all in cache
          articlesResponse.data.forEach(a => setArticleCache(a));
          setArticles(articlesResponse.data as SupabaseArticle[]);
        }
      } catch (error) {
        console.error('Error fetching category data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategoryData();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!category) {
    return <div className="text-center p-10">Category not found.</div>;
  }

  return (
    <div className="bg-white dark:bg-black">
      <main className="container mx-auto px-4 py-8">
        {/* Ad Slot 5 - Category pages top banner */}
        <div className="mb-6">
          <AdSlot slotNumber={5} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <h1 className="text-3xl font-bold text-black dark:text-white mb-4">
              {language === 'hi' && category.name_hi ? category.name_hi : category.name}
            </h1>
            <p className="mb-8 text-gray-700 dark:text-gray-300">
              {language === 'hi' && category.description_hi ? category.description_hi : category.description}
            </p>

            {articles.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  No Articles Available
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  No articles are currently available for {language === 'hi' && category.name_hi ? category.name_hi : category.name}.
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
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            {/* Category Info */}
            <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-black/90">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Tag className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-xl font-bold text-black dark:text-white">
                    {language === 'hi' && category.name_hi ? category.name_hi : category.name}
                  </h3>
                </div>
                {category.description && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    {language === 'hi' && category.description_hi ? category.description_hi : category.description}
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
                </div>
              </CardContent>
            </Card>

            {/* Other Categories */}
            <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-black/90">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-black dark:text-white mb-4 flex items-center">
                  <Tag className="h-5 w-5 text-gray-600 mr-2" />
                  Other Categories
                </h3>
                <div className="space-y-3">
                  {categories.slice(0, 8).map((otherCategory) => (
                    <Link 
                      key={otherCategory.id} 
                      to={`/category/${otherCategory.slug}`}
                      className={`block p-3 rounded-lg border transition-all hover:shadow-md ${
                        otherCategory.slug === slug 
                          ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' 
                          : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Tag className="h-4 w-4 text-gray-500 mr-2" />
                          <span className={`text-sm font-medium ${
                            otherCategory.slug === slug 
                              ? 'text-blue-800 dark:text-blue-200' 
                              : 'text-black dark:text-white'
                          }`}>
                            {language === 'hi' && otherCategory.name_hi ? otherCategory.name_hi : otherCategory.name}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {otherCategory.slug === slug ? 'Current' : 'View'}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ad Slot 6 - Category pages sidebar */}
            <div>
              <AdSlot slotNumber={6} />
            </div>
          </div>
        </div>
        
        {/* Ad Slot 7 - Category pages bottom banner */}
        <div className="mt-8">
          <AdSlot slotNumber={7} />
        </div>
      </main>
    </div>
  );
};

export default CategoryPage; 
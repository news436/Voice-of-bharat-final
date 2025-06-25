import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdSlot } from '@/components/news/AdSlot';
import apiClient from '@/utils/api';

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

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
        // Fetch category using API client
        const categoryResponse = await apiClient.get(`/categories/${slug}`);
        if (!categoryResponse.success || !categoryResponse.data) {
          setLoading(false);
          return;
        }
        setCategory(categoryResponse.data);
        
        // Fetch articles for this category using API client
        const articlesResponse = await apiClient.getArticles({ 
          category: categoryResponse.data.slug 
        });
        if (articlesResponse.success) {
          setArticles(articlesResponse.data);
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
          </div>
          
          <div className="lg:col-span-1 space-y-6">
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
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdSlot } from '@/components/news/AdSlot';

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true);
      
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (catError || !catData) {
        setLoading(false);
        return;
      }
      setCategory(catData);
      
      const { data: articlesData, error: articlesError } = await supabase
        .from('articles')
        .select('*')
        .eq('category_id', catData.id)
        .order('published_at', { ascending: false });
        
      if (articlesError) {
        setLoading(false);
        return;
      }
      setArticles(articlesData || []);
      setLoading(false);
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => {
                 const title = language === 'hi' && article.title_hi ? article.title_hi : article.title;
                 return (
                  <Link key={article.id} to={`/article/${article.slug}`} className="block">
                    <Card className="hover:shadow-lg transition-shadow">
                      {article.featured_image_url && (
                        <img src={article.featured_image_url} alt={title} className="w-full h-48 object-cover rounded-t-lg" />
                      )}
                      <CardContent className="p-4">
                        <h2 className="text-xl font-bold mb-2 text-black dark:text-white">{title}</h2>
                        <Badge variant="secondary">{category.name}</Badge>
                      </CardContent>
                    </Card>
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
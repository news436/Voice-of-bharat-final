import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, X, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const FeaturedArticlesManager = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    fetchFeaturedArticles();
  }, []);

  const fetchFeaturedArticles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching featured articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllArticles = async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setAllArticles(data || []);
  };

  const handleRemoveFeatured = async (articleId: string) => {
    try {
      const { error } = await supabase
        .from('articles')
        .update({ is_featured: false })
        .eq('id', articleId);
      if (error) throw error;
      toast({ title: 'Success', description: 'Article removed from featured.' });
      fetchFeaturedArticles();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleAddToFeatured = async (articleId: string) => {
    try {
      const { error } = await supabase
        .from('articles')
        .update({ is_featured: true })
        .eq('id', articleId);
      if (error) throw error;
      toast({ title: 'Success', description: 'Article added to featured.' });
      setShowAddModal(false);
      fetchFeaturedArticles();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const filteredAllArticles = allArticles.filter(
    (a) =>
      !a.is_featured &&
      (a.title?.toLowerCase().includes(search.toLowerCase()) ||
        a.summary?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <Star className="h-7 w-7 text-yellow-500" /> Featured Articles
        </h2>
        <Button
          variant="outline"
          className="flex items-center gap-2 border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50"
          onClick={async () => {
            await fetchAllArticles();
            setShowAddModal(true);
          }}
        >
          <Plus className="h-5 w-5" /> Add from Existing
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-12">Loading featured articles...</div>
        ) : articles.slice(0, visibleCount).length === 0 ? (
          <div className="col-span-full text-gray-500 text-center">No featured articles found.</div>
        ) : (
          articles.slice(0, visibleCount).map(article => (
            <div
              key={article.id}
              className="rounded-xl shadow bg-white dark:bg-gray-900 border border-yellow-200 dark:border-yellow-700 flex flex-col overflow-hidden hover:shadow-xl transition-all"
            >
              {article.featured_image_url && (
                <img
                  src={article.featured_image_url}
                  alt={article.title}
                  className="w-full h-28 object-cover"
                />
              )}
              <div className="p-3 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className="ml-auto text-xs text-gray-400">
                    {new Date(article.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-1 line-clamp-2">{article.title}</h3>
                <Button
                  size="sm"
                  className="mt-auto w-full bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => handleRemoveFeatured(article.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      {articles.length > visibleCount && (
        <div className="flex justify-center mt-4">
          <Button onClick={() => setVisibleCount(visibleCount + 4)} variant="outline">View More</Button>
        </div>
      )}
      {/* Add from Existing Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
              onClick={() => setShowAddModal(false)}
            >
              <X className="h-6 w-6" />
            </button>
            <h3 className="text-xl font-bold mb-4">Add Article to Featured</h3>
            <input
              type="text"
              placeholder="Search articles by title or summary..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <div className="max-h-96 overflow-y-auto space-y-4">
              {filteredAllArticles.length === 0 ? (
                <div className="text-gray-500 text-center">No articles found.</div>
              ) : (
                filteredAllArticles.map(article => (
                  <div
                    key={article.id}
                    className="flex items-center gap-4 p-3 rounded-lg border hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition cursor-pointer"
                  >
                    {article.featured_image_url && (
                      <img
                        src={article.featured_image_url}
                        alt={article.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-base line-clamp-1">{article.title}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-yellow-400 text-yellow-700"
                      onClick={() => handleAddToFeatured(article.id)}
                    >
                      <Star className="h-4 w-4 mr-1 text-yellow-500" /> Add
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, X, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import apiClient from '@/utils/api';

export const FeaturedArticlesManager = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchFeaturedArticles();
  }, []);

  const fetchFeaturedArticles = async (pageNum = 1) => {
    if (pageNum === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      console.log('🔍 Fetching featured articles for page:', pageNum);
      const response = await apiClient.getFeaturedArticles({
        page: pageNum,
        limit: ITEMS_PER_PAGE
      });
      console.log('✅ Featured articles response:', response);
      
      if (response.success) {
        if (pageNum === 1) {
          setArticles(response.data || []);
        } else {
          setArticles(prev => [...prev, ...(response.data || [])]);
        }
        
        // Check if there are more articles to load
        setHasMore(response.data.length === ITEMS_PER_PAGE);
        setPage(pageNum);
      } else {
        throw new Error(response.error || 'Failed to fetch featured articles');
      }
    } catch (error) {
      console.error('❌ Error fetching featured articles:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch featured articles',
        variant: 'destructive'
      });
    } finally {
      if (pageNum === 1) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };

  const fetchAllArticles = async () => {
    try {
      const response = await apiClient.getArticles({ limit: 1000 });
      if (response.success) {
        setAllArticles(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching all articles:', error);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchFeaturedArticles(page + 1);
    }
  };

  const handleRemoveFeatured = async (articleId: string) => {
    try {
      console.log('🎯 Attempting to remove featured tag from article:', articleId);
      const response = await apiClient.updateArticle(articleId, { 
        is_featured: false,
        updated_at: new Date().toISOString()
      });
      console.log('✅ Remove featured response:', response);
      if (response.success) {
        toast({ title: 'Success', description: 'Article removed from featured.' });
        // Reset to first page and fetch articles
        setPage(1);
        await fetchFeaturedArticles(1);
      } else {
        throw new Error(response.error || 'Failed to update article');
      }
    } catch (error: any) {
      console.error('❌ Error removing featured tag:', error);
      toast({ 
        title: 'Error', 
        description: `Failed to remove featured tag: ${error.message}`, 
        variant: 'destructive' 
      });
    }
  };

  const handleAddToFeatured = async (articleId: string) => {
    try {
      const response = await apiClient.updateArticle(articleId, { is_featured: true });
      if (response.success) {
        toast({ title: 'Success', description: 'Article added to featured.' });
        setShowAddModal(false);
        // Reset to first page and fetch articles
        setPage(1);
        await fetchFeaturedArticles(1);
      } else {
        throw new Error(response.error || 'Failed to update article');
      }
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
        ) : articles.length === 0 ? (
          <div className="col-span-full text-gray-500 text-center">No featured articles found.</div>
        ) : (
          articles.map(article => (
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
      {hasMore && !isLoading && (
        <div className="flex justify-center mt-4">
          <Button 
            onClick={handleLoadMore} 
            variant="outline"
            disabled={isLoadingMore}
          >
            {isLoadingMore ? 'Loading...' : 'Load More'}
          </Button>
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
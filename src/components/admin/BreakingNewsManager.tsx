import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, AlertTriangle, Eye, EyeOff, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const BreakingNewsManager = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    is_breaking: true,
    status: 'published' as 'draft' | 'published'
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchBreakingNews();
  }, []);

  const fetchBreakingNews = async (pageNum = 1) => {
    if (pageNum === 1) {
    setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      console.log('🔍 Fetching breaking news for page:', pageNum);
      const response = await supabase
        .from('articles')
        .select('*')
        .eq('is_breaking', true)
        .order('created_at', { ascending: false })
        .range((pageNum - 1) * ITEMS_PER_PAGE, pageNum * ITEMS_PER_PAGE - 1);
      console.log('✅ Breaking news response:', response);
      
      if (response.data) {
        if (pageNum === 1) {
        setArticles(response.data || []);
        } else {
          setArticles(prev => [...prev, ...(response.data || [])]);
        }
        
        // Check if there are more articles to load
        setHasMore(response.data.length === ITEMS_PER_PAGE);
        setPage(pageNum);
      } else {
        throw new Error(response.error?.message || String(response.error) || 'Failed to fetch breaking news');
      }
    } catch (error) {
      console.error('❌ Error fetching breaking news:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch breaking news',
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
      const response = await supabase
        .from('articles')
        .select('*')
        .eq('is_breaking', false);
      if (response.data) {
        setAllArticles(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching all articles:', error);
    }
  };

  const handleEdit = (article: any) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      summary: article.summary || '',
      content: article.content || '',
      is_breaking: article.is_breaking,
      status: article.status
    });
    setShowForm(true);
  };

  const handleDelete = async (articleId: string) => {
    if (!confirm('Are you sure you want to delete this breaking news?')) return;

    try {
      const response = await supabase
        .from('articles')
        .delete()
        .eq('id', articleId);
      if (response.data) {
        toast({
          title: "Success",
          description: "Breaking news deleted successfully.",
        });
        fetchBreakingNews();
      } else {
        throw new Error(response.error?.message || String(response.error) || 'Failed to delete article');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleBreakingStatus = async (articleId: string, currentStatus: boolean) => {
    try {
      const response = await supabase
        .from('articles')
        .update({ is_breaking: !currentStatus })
        .eq('id', articleId);
      if (response.data) {
        toast({
          title: "Success",
          description: `Article ${!currentStatus ? 'marked as' : 'removed from'} breaking news.`,
        });
        fetchBreakingNews();
      } else {
        throw new Error(response.error?.message || String(response.error) || 'Failed to update article');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const togglePublishStatus = async (articleId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      const response = await supabase
        .from('articles')
        .update({ 
          status: newStatus,
          published_at: newStatus === 'published' ? new Date().toISOString() : null
        })
        .eq('id', articleId);
      if (response.data) {
        toast({
          title: "Success",
          description: `Article ${newStatus === 'published' ? 'published' : 'unpublished'} successfully.`,
        });
        fetchBreakingNews();
      } else {
        throw new Error(response.error?.message || String(response.error) || 'Failed to update article');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveBreaking = async (articleId: string) => {
    try {
      console.log('🎯 Attempting to remove breaking tag from article:', articleId);
      const response = await supabase
        .from('articles')
        .update({ 
          is_breaking: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', articleId)
        .select();
      console.log('✅ Remove breaking response:', response);
      if (!response.error) {
        toast({ title: 'Success', description: 'Article removed from breaking news.' });
        // Reset to first page and fetch articles
        setPage(1);
        await fetchBreakingNews(1);
      } else {
        throw new Error(response.error?.message || String(response.error) || 'Failed to update article');
      }
    } catch (error: any) {
      console.error('❌ Error removing breaking tag:', error);
      toast({ 
        title: 'Error', 
        description: `Failed to remove breaking tag: ${error?.message || String(error)}`, 
        variant: 'destructive' 
      });
    }
  };

  const handleAddToBreaking = async (articleId: string) => {
    try {
      const response = await supabase
        .from('articles')
        .update({ is_breaking: true })
        .eq('id', articleId);
      if (response.data) {
        toast({ title: 'Success', description: 'Article added to breaking news.' });
        setShowAddModal(false);
        // Reset to first page and fetch articles
        setPage(1);
        await fetchBreakingNews(1);
      } else {
        throw new Error(response.error?.message || String(response.error) || 'Failed to update article');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchBreakingNews(page + 1);
    }
  };

  const filteredAllArticles = allArticles.filter(
    (a) =>
      !a.is_breaking &&
      a.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading breaking news...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-7 w-7 text-red-500" /> Breaking News
        </h2>
        <Button
          variant="outline"
          className="flex items-center gap-2 border-2 border-red-400 text-red-700 hover:bg-red-50"
          onClick={async () => {
            await fetchAllArticles();
            setShowAddModal(true);
          }}
        >
          <Plus className="h-5 w-5" /> Add from Existing
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {articles.length === 0 ? (
          <div className="col-span-full text-gray-500 text-center">No breaking news found.</div>
        ) : (
          articles.map(article => (
          <div
            key={article.id}
            className="rounded-xl shadow bg-white dark:bg-gray-900 border border-red-200 dark:border-red-700 flex flex-col overflow-hidden hover:shadow-xl transition-all"
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
                <Badge variant="destructive" className="animate-pulse">
                  BREAKING
                </Badge>
                <span className="ml-auto text-xs text-gray-400">
                  {new Date(article.created_at).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-bold text-lg mb-1 line-clamp-2">{article.title}</h3>
              <Button
                size="sm"
                className="mt-auto w-full bg-red-600 hover:bg-red-700 text-white"
                onClick={() => handleRemoveBreaking(article.id)}
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
            <h3 className="text-xl font-bold mb-4">Add Article to Breaking News</h3>
            <input
              type="text"
              placeholder="Search articles by title..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            <div className="max-h-96 overflow-y-auto space-y-4">
              {filteredAllArticles.length === 0 ? (
                <div className="text-gray-500 text-center">No articles found.</div>
              ) : (
                filteredAllArticles.map(article => (
                  <div
                    key={article.id}
                    className="flex items-center gap-4 p-3 rounded-lg border hover:bg-red-50 dark:hover:bg-red-900/20 transition cursor-pointer"
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
                      className="border-red-400 text-red-700"
                      onClick={() => handleAddToBreaking(article.id)}
                    >
                      <AlertTriangle className="h-4 w-4 mr-1 text-red-500" /> Add
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

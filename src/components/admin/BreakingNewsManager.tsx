
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
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

  useEffect(() => {
    fetchBreakingNews();
  }, []);

  const fetchBreakingNews = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          categories(name, slug),
          states(name, slug)
        `)
        .eq('is_breaking', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching breaking news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const articleData = {
        ...formData,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        published_at: formData.status === 'published' ? new Date().toISOString() : null
      };

      if (editingArticle) {
        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', editingArticle.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Breaking news updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('articles')
          .insert([articleData]);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Breaking news created successfully.",
        });
      }

      setShowForm(false);
      setEditingArticle(null);
      setFormData({
        title: '',
        summary: '',
        content: '',
        is_breaking: true,
        status: 'published'
      });
      fetchBreakingNews();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', articleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Breaking news deleted successfully.",
      });
      
      fetchBreakingNews();
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
      const { error } = await supabase
        .from('articles')
        .update({ is_breaking: !currentStatus })
        .eq('id', articleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Article ${!currentStatus ? 'marked as' : 'removed from'} breaking news.`,
      });
      
      fetchBreakingNews();
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
      const { error } = await supabase
        .from('articles')
        .update({ 
          status: newStatus,
          published_at: newStatus === 'published' ? new Date().toISOString() : null
        })
        .eq('id', articleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Article ${newStatus === 'published' ? 'published' : 'unpublished'} successfully.`,
      });
      
      fetchBreakingNews();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading breaking news...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Breaking News Management</h2>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingArticle(null);
            setFormData({
              title: '',
              summary: '',
              content: '',
              is_breaking: true,
              status: 'published'
            });
          }}
          className="bg-red-600 hover:bg-red-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Breaking News
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingArticle ? 'Edit Breaking News' : 'Create Breaking News'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Summary</label>
                <Textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_breaking}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_breaking: checked })}
                  />
                  <label className="text-sm font-medium">Breaking News</label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.status === 'published'}
                    onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? 'published' : 'draft' })}
                  />
                  <label className="text-sm font-medium">Publish Immediately</label>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                  {editingArticle ? 'Update' : 'Create'} Breaking News
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingArticle(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6">
        {articles.map((article) => (
          <Card key={article.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {article.is_breaking && (
                      <Badge variant="destructive" className="animate-pulse">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        BREAKING
                      </Badge>
                    )}
                    <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                      {article.status}
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{article.title}</h3>
                  
                  {article.summary && (
                    <p className="text-gray-600 mb-2">{article.summary}</p>
                  )}
                  
                  <div className="text-sm text-gray-500">
                    Created: {new Date(article.created_at).toLocaleString()}
                    {article.published_at && (
                      <span className="ml-4">
                        Published: {new Date(article.published_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleBreakingStatus(article.id, article.is_breaking)}
                    className={article.is_breaking ? "text-red-600" : "text-green-600"}
                  >
                    <AlertTriangle className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePublishStatus(article.id, article.status)}
                    className={article.status === 'published' ? "text-green-600" : "text-blue-600"}
                  >
                    {article.status === 'published' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  
                  <Button variant="outline" size="sm" onClick={() => handleEdit(article)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button variant="outline" size="sm" onClick={() => handleDelete(article.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

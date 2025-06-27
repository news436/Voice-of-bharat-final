import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PlusCircle, MoreHorizontal, File, ListFilter, ArrowLeft, Save, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { isValidYoutubeUrl, getYoutubeEmbedUrl } from '@/lib/youtube-utils';
import { isValidFacebookUrl, getFacebookEmbedUrl } from '@/lib/facebook-utils';
import apiClient from '@/utils/api';

const ReactQuill = lazy(() =>
  import('react-quill').then(module => {
    const Quill = module.Quill;
    const Parchment = Quill.import('parchment');

    // Create a custom line-height style
    const LineHeightStyle = new Parchment.Attributor.Style(
      'lineheight', 
      'line-height', 
      {
        scope: Parchment.Scope.BLOCK, // Apply to the entire block
        whitelist: ['1', '1.5', '2', '2.5', '3']
      }
    );
    
    Quill.register({ 'formats/lineheight': LineHeightStyle }, true);
    
    return { default: module.default };
  })
);

type Article = any; // Replace with a proper type definition

type ArticleFormData = {
  title: string;
  title_hi: string;
  slug: string;
  summary: string;
  summary_hi: string;
  content: string;
  content_hi: string;
  featured_image_url: string;
  youtube_video_url: string;
  facebook_video_url: string;
  status: 'draft' | 'published' | 'archived';
  is_breaking: boolean;
  is_featured: boolean;
  category_id: string;
  state_id: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  publisher_name: string;
};

export const ArticleManager = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '', title_hi: '', slug: '', summary: '', summary_hi: '', content: '', content_hi: '',
    featured_image_url: '', youtube_video_url: '', facebook_video_url: '', status: 'draft', is_breaking: false, is_featured: false,
    category_id: '', state_id: '', meta_title: '', meta_description: '', meta_keywords: '',
    publisher_name: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { language } = useLanguage();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // Fetch articles using API client
      const articlesResponse = await apiClient.getArticles({ limit: 1000 });
      if (articlesResponse.success) {
        setArticles(articlesResponse.data);
      }

      // Fetch categories using API client
      const categoriesResponse = await apiClient.getCategories();
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data);
      }

      // Fetch states using API client
      const statesResponse = await apiClient.getStates();
      if (statesResponse.success) {
        setStates(statesResponse.data);
      }
    } catch (error: any) {
      toast({ title: "Error fetching data", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

  const uploadImage = async (file: File) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  
    if (!cloudName || !uploadPreset) {
      toast({ title: "Configuration Error", description: "Cloudinary configuration is missing.", variant: "destructive" });
      throw new Error("Cloudinary configuration is missing.");
    }
  
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('upload_preset', uploadPreset);
  
    const response = await fetch(url, { method: 'POST', body: uploadFormData });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Image upload failed: ${errorData.error.message}`);
    }
  
    const data = await response.json();
    return data.secure_url;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated.");

      let finalImageUrl = formData.featured_image_url;
      if (imageFile) {
        toast({ title: "Uploading image...", description: "Please wait a moment." });
        finalImageUrl = await uploadImage(imageFile);
      }

      const articleData = {
        ...formData,
        featured_image_url: finalImageUrl,
        slug: formData.slug || generateSlug(formData.title),
        author_id: user.id,
        published_at: editingArticle 
          ? (formData.status === 'published' && !editingArticle.published_at 
              ? new Date().toISOString() 
              : editingArticle.published_at)
          : (formData.status === 'published' ? new Date().toISOString() : null),
        category_id: formData.category_id || null,
        state_id: formData.state_id || null,
      };

      if (editingArticle) {
        const response = await apiClient.updateArticle(editingArticle.id, articleData);
        if (response.success) {
          toast({ title: "Success", description: "Article updated." });
        } else {
          throw new Error(response.error || 'Failed to update article');
        }
      } else {
        const response = await apiClient.createArticle(articleData);
        if (response.success) {
          toast({ title: "Success", description: "Article created." });
        } else {
          throw new Error(response.error || 'Failed to create article');
        }
      }
      resetForm();
      fetchInitialData();
    } catch (error: any) {
      toast({ title: "Error submitting article", description: error.message, variant: "destructive" });
    }
  };

  const handleEditClick = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title || '', title_hi: article.title_hi || '', slug: article.slug || '',
      summary: article.summary || '', summary_hi: article.summary_hi || '',
      content: article.content || '', content_hi: article.content_hi || '',
      featured_image_url: article.featured_image_url || '', status: article.status || 'draft',
      is_breaking: article.is_breaking || false, is_featured: article.is_featured || false,
      category_id: article.category_id || '', state_id: article.state_id || '',
      meta_title: article.meta_title || '', meta_description: article.meta_description || '',
      meta_keywords: article.meta_keywords || '',
      publisher_name: article.publisher_name || article.profiles?.full_name || '',
      youtube_video_url: article.youtube_video_url || '',
      facebook_video_url: article.facebook_video_url || ''
    });
    setShowForm(true);
    setImageFile(null);
    setImagePreview(article.featured_image_url || null);
  };
  
  const handleDelete = async (articleId: string) => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) return;
    try {
      const response = await apiClient.deleteArticle(articleId);
      if (response.success) {
        toast({ title: "Success", description: "Article deleted." });
        fetchInitialData();
      } else {
        throw new Error(response.error || 'Failed to delete article');
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setEditingArticle(null);
    setFormData({
      title: '', title_hi: '', slug: '', summary: '', summary_hi: '', content: '', content_hi: '',
      featured_image_url: '', status: 'draft', is_breaking: false, is_featured: false,
      category_id: '', state_id: '', meta_title: '', meta_description: '', meta_keywords: '',
      publisher_name: '', youtube_video_url: '', facebook_video_url: ''
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingArticle(null);
    setFormData({
      title: '', title_hi: '', slug: '', summary: '', summary_hi: '', content: '', content_hi: '',
      featured_image_url: '', status: 'draft', is_breaking: false, is_featured: false,
      category_id: '', state_id: '', meta_title: '', meta_description: '', meta_keywords: '',
      publisher_name: '', youtube_video_url: '', facebook_video_url: ''
    });
  };

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      [{ 'lineheight': ['1', '1.5', '2', '2.5', '3'] }],
      ['clean']
    ],
  }), []);

  useEffect(() => {
    // Dynamically import Quill CSS
    import('react-quill/dist/quill.snow.css');
  }, []);

  // Filtered articles based on search
  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles;
    const q = searchQuery.trim().toLowerCase();
    return articles.filter(a =>
      (a.title && a.title.toLowerCase().includes(q)) ||
      (a.title_hi && a.title_hi.toLowerCase().includes(q))
    );
  }, [articles, searchQuery]);

  if (showForm) {
    return (
      <div className="flex flex-col h-full">
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
            <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={resetForm}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to articles</span>
            </Button>
            <h2 className="flex-1 text-xl font-semibold">
              {editingArticle ? `Edit Article: ${editingArticle.title}` : 'Create New Article'}
            </h2>
            <div className="flex items-center gap-4">
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              <Button type="submit" className="gap-1">
                <Save className="h-4 w-4" />
                {editingArticle ? 'Save Changes' : 'Publish Article'}
              </Button>
            </div>
          </header>

          <main className="grid flex-1 gap-6 p-6 md:grid-cols-3 lg:grid-cols-4">
            <div className="md:col-span-2 lg:col-span-3 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Article Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" placeholder="Enter article title..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input id="slug" placeholder="e.g., my-awesome-article (auto-generated if blank)" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
                  </div>
                  <div>
                    <Label htmlFor="summary">Summary</Label>
                    <Textarea id="summary" placeholder="A brief summary of the article" value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} />
                  </div>
                  <div>
                    <Label>Main Content</Label>
                    <Suspense fallback={<div className="h-64 w-full rounded-md border flex items-center justify-center">Loading Editor...</div>}>
                      <div className="bg-white">
                        <ReactQuill theme="snow" value={formData.content} onChange={content => setFormData({...formData, content})} modules={quillModules} className="h-64 mb-12"/>
                      </div>
                    </Suspense>
                  </div>
                </CardContent>
              </Card>

              <Card>
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <span className="text-red-600">हिंदी सामग्री</span>
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-6 p-6">
                    <div>
                      <Label htmlFor="title_hi" className="flex items-center gap-2">
                        Title (Hindi) <span className="text-red-500">*</span>
                      </Label>
                      <Input id="title_hi" placeholder="लेख का हिंदी शीर्षक दर्ज करें..." value={formData.title_hi} onChange={e => setFormData({...formData, title_hi: e.target.value})} />
                    </div>
                    <div>
                      <Label htmlFor="summary_hi" className="flex items-center gap-2">
                        Summary (Hindi) <span className="text-red-500">*</span>
                      </Label>
                      <Textarea id="summary_hi" placeholder="लेख का संक्षिप्त सारांश हिंदी में दर्ज करें..." value={formData.summary_hi} onChange={e => setFormData({...formData, summary_hi: e.target.value})} />
                    </div>
                    <div>
                      <Label className="flex items-center gap-2">
                        Main Content (Hindi) <span className="text-red-500">*</span>
                      </Label>
                      <Suspense fallback={<div className="h-64 w-full rounded-md border flex items-center justify-center">Loading Editor...</div>}>
                        <div className="bg-white">
                           <ReactQuill 
                             theme="snow" 
                             value={formData.content_hi} 
                             onChange={content => setFormData({...formData, content_hi: content})} 
                             modules={quillModules} 
                             className="h-64 mb-12" 
                             placeholder="लेख की मुख्य सामग्री हिंदी में लिखें..."
                           />
                        </div>
                      </Suspense>
                    </div>
                 </CardContent>
              </Card>
            </div>

            <div className="md:col-span-1 lg:col-span-1 space-y-6">
               <Card>
                  <CardHeader><CardTitle>Publishing</CardTitle></CardHeader>
                  <CardContent className="space-y-6 p-6">
                     <div className="space-y-2">
                        <Label htmlFor="publisher_name">Publisher Name</Label>
                        <Input 
                          id="publisher_name" 
                          placeholder="Enter publisher/author name" 
                          value={formData.publisher_name} 
                          onChange={e => setFormData({...formData, publisher_name: e.target.value})} 
                        />
                        <p className="text-xs text-muted-foreground">This name will be displayed as the author on the article page.</p>
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'draft' | 'published' | 'archived' }))}
                        >
                          <SelectTrigger id="status" aria-label="Select status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                     </div>
                     <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                           <Label htmlFor="is_breaking">Breaking News</Label>
                           <p className="text-xs text-muted-foreground">Display as a top story.</p>
                        </div>
                        <Switch id="is_breaking" checked={formData.is_breaking} onCheckedChange={checked => setFormData({...formData, is_breaking: checked})} />
                     </div>
                     <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                           <Label htmlFor="is_featured">Featured Article</Label>
                           <p className="text-xs text-muted-foreground">Highlight on homepage.</p>
                        </div>
                        <Switch id="is_featured" checked={formData.is_featured} onCheckedChange={checked => setFormData({...formData, is_featured: checked})} />
                     </div>
                  </CardContent>
               </Card>
               <Card>
                  <CardHeader><CardTitle>Details</CardTitle></CardHeader>
                  <CardContent className="space-y-6 p-6">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={formData.category_id} onValueChange={id => setFormData({...formData, category_id: id})}>
                           <SelectTrigger id="category"><SelectValue placeholder="Select a category" /></SelectTrigger>
                           <SelectContent>
                              {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                           </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Select value={formData.state_id} onValueChange={id => setFormData({...formData, state_id: id})}>
                           <SelectTrigger id="state"><SelectValue placeholder="Select a state" /></SelectTrigger>
                           <SelectContent>
                              {states.map(st => <SelectItem key={st.id} value={st.id}>{st.name}</SelectItem>)}
                           </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="featured_image">Featured Image</Label>
                        {imagePreview && (
                          <div className="w-full">
                            <img src={imagePreview} alt="Article preview" className="rounded-lg w-full h-auto object-cover shadow-md" />
                          </div>
                        )}
                        <Input 
                          id="featured_image"
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setImageFile(file);
                              setImagePreview(URL.createObjectURL(file));
                            }
                          }}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                        <p className="text-xs text-muted-foreground">Upload an image to set it as the featured image.</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="youtube_video_url">YouTube Video URL</Label>
                        <Input 
                          id="youtube_video_url"
                          type="url" 
                          placeholder="https://www.youtube.com/watch?v=..." 
                          value={formData.youtube_video_url} 
                          onChange={e => setFormData({...formData, youtube_video_url: e.target.value})} 
                        />
                        <p className="text-xs text-muted-foreground">Optional: Add a YouTube video URL to embed in the article. The video will be displayed within the article content.</p>
                        
                        {/* YouTube Video Preview */}
                        {formData.youtube_video_url && isValidYoutubeUrl(formData.youtube_video_url) && (
                          <div className="mt-4">
                            <p className="text-xs text-green-600 dark:text-green-400 mb-2">✓ Valid YouTube URL - Preview:</p>
                            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                              <iframe
                                src={getYoutubeEmbedUrl(formData.youtube_video_url) || ''}
                                title="YouTube video preview"
                                className="absolute top-0 left-0 w-full h-full rounded-lg border"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                              />
                            </div>
                          </div>
                        )}
                        
                        {formData.youtube_video_url && !isValidYoutubeUrl(formData.youtube_video_url) && (
                          <div className="mt-2">
                            <p className="text-xs text-red-600 dark:text-red-400">⚠ Invalid YouTube URL format</p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="facebook_video_url">Facebook Video URL</Label>
                        <Input 
                          id="facebook_video_url"
                          type="url" 
                          placeholder="https://www.facebook.com/share/v/..." 
                          value={formData.facebook_video_url} 
                          onChange={e => setFormData({...formData, facebook_video_url: e.target.value})} 
                        />
                        <p className="text-xs text-muted-foreground">Optional: Add a Facebook video URL to embed in the article. The video will be displayed within the article content.</p>
                        
                        {/* Facebook Video Preview */}
                        {formData.facebook_video_url && isValidFacebookUrl(formData.facebook_video_url) && (
                          <div className="mt-4">
                            <p className="text-xs text-green-600 dark:text-green-400 mb-2">✓ Valid Facebook URL - Preview:</p>
                            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                              <iframe
                                src={getFacebookEmbedUrl(formData.facebook_video_url) || ''}
                                title="Facebook video preview"
                                className="absolute top-0 left-0 w-full h-full rounded-lg border"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                              />
                            </div>
                          </div>
                        )}
                        
                        {formData.facebook_video_url && !isValidFacebookUrl(formData.facebook_video_url) && (
                          <div className="mt-2">
                            <p className="text-xs text-red-600 dark:text-red-400">⚠ Invalid Facebook URL format</p>
                          </div>
                        )}
                      </div>
                  </CardContent>
               </Card>
            </div>
          </main>
        </form>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="px-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
          <CardTitle>Articles</CardTitle>
          <form
            onSubmit={e => e.preventDefault()}
            className="flex items-center gap-2 w-full md:w-72 mt-2 md:mt-0"
            role="search"
          >
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <Button type="button" size="icon" variant="ghost" tabIndex={-1} disabled>
              <Search className="h-4 w-4 text-gray-400" />
            </Button>
          </form>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-1" onClick={() => setShowForm(true)}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">New Article</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredArticles.map((article) => (
              <TableRow key={article.id}>
                <TableCell className="font-medium">{article.title}</TableCell>
                <TableCell>{article.profiles?.full_name || 'N/A'}</TableCell>
                <TableCell>{article.categories?.name || 'N/A'}</TableCell>
                <TableCell><Badge variant={article.status === 'published' ? 'default' : 'secondary'}>{article.status}</Badge></TableCell>
                <TableCell>{new Date(article.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditClick(article)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(article.id)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

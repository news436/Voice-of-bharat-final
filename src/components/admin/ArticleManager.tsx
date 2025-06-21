import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PlusCircle, MoreHorizontal, File, ListFilter, ArrowLeft, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const ReactQuill = lazy(() => import('react-quill'));

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
  status: 'draft' | 'published' | 'archived';
  is_breaking: boolean;
  is_featured: boolean;
  category_id: string;
  state_id: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
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
    featured_image_url: '', status: 'draft', is_breaking: false, is_featured: false,
    category_id: '', state_id: '', meta_title: '', meta_description: '', meta_keywords: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { language } = useLanguage();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [articlesRes, categoriesRes, statesRes] = await Promise.all([
        supabase.from('articles').select('*, categories(name), profiles(full_name)').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
        supabase.from('states').select('*').order('name')
      ]);

      if (articlesRes.error) throw articlesRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      if (statesRes.error) throw statesRes.error;
      
      setArticles(articlesRes.data);
      setCategories(categoriesRes.data);
      setStates(statesRes.data);
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
        published_at: formData.status === 'published' ? new Date().toISOString() : null,
        category_id: formData.category_id || null,
        state_id: formData.state_id || null,
      };

      if (editingArticle) {
        const { error } = await supabase.from('articles').update(articleData).eq('id', editingArticle.id);
        if (error) throw error;
        toast({ title: "Success", description: "Article updated." });
      } else {
        const { error } = await supabase.from('articles').insert([articleData]);
        if (error) throw error;
        toast({ title: "Success", description: "Article created." });
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
      meta_keywords: article.meta_keywords || ''
    });
    setShowForm(true);
    setImageFile(null);
    setImagePreview(article.featured_image_url || null);
  };
  
  const handleDelete = async (articleId: string) => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) return;
    try {
      const { error } = await supabase.from('articles').delete().eq('id', articleId);
      if (error) throw error;
      toast({ title: "Success", description: "Article deleted." });
      fetchInitialData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setEditingArticle(null);
    setFormData({
      title: '', title_hi: '', slug: '', summary: '', summary_hi: '', content: '', content_hi: '',
      featured_image_url: '', status: 'draft', is_breaking: false, is_featured: false,
      category_id: '', state_id: '', meta_title: '', meta_description: '', meta_keywords: ''
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
      category_id: '', state_id: '', meta_title: '', meta_description: '', meta_keywords: ''
    });
  };

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  }), []);

  useEffect(() => {
    // Dynamically import Quill CSS
    import('quill/dist/quill.snow.css');
  }, []);

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
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" placeholder="Enter article title..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required/>
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
                 <CardHeader><CardTitle>Hindi Content</CardTitle></CardHeader>
                 <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="title_hi">Title (Hindi)</Label>
                      <Input id="title_hi" placeholder="Enter Hindi title" value={formData.title_hi} onChange={e => setFormData({...formData, title_hi: e.target.value})} />
                    </div>
                    <div>
                      <Label htmlFor="summary_hi">Summary (Hindi)</Label>
                      <Textarea id="summary_hi" placeholder="Enter Hindi summary" value={formData.summary_hi} onChange={e => setFormData({...formData, summary_hi: e.target.value})} />
                    </div>
                    <div>
                      <Label>Main Content (Hindi)</Label>
                      <Suspense fallback={<div className="h-64 w-full rounded-md border flex items-center justify-center">Loading Editor...</div>}>
                        <div className="bg-white">
                           <ReactQuill theme="snow" value={formData.content_hi} onChange={content => setFormData({...formData, content_hi: content})} modules={quillModules} className="h-64 mb-12" />
                        </div>
                      </Suspense>
                    </div>
                 </CardContent>
              </Card>
            </div>

            <div className="md:col-span-1 lg:col-span-1 space-y-6">
               <Card>
                  <CardHeader><CardTitle>Publishing</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                     <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select 
                            value={formData.status} 
                            onValueChange={status => setFormData({ ...formData, status: status as 'draft' | 'published' | 'archived' })}
                        >
                          <SelectTrigger id="status"><SelectValue placeholder="Set status" /></SelectTrigger>
                          <SelectContent>
                             <SelectItem value="draft">Draft</SelectItem>
                             <SelectItem value="published">Published</SelectItem>
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
                  <CardContent className="space-y-6">
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
                  </CardContent>
               </Card>
               <Card>
                  <CardHeader><CardTitle>SEO Optimization</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                     <div>
                        <Label htmlFor="meta_title">Meta Title</Label>
                        <Input id="meta_title" placeholder="Enter meta title" value={formData.meta_title} onChange={e => setFormData({...formData, meta_title: e.target.value})} />
                     </div>
                     <div>
                        <Label htmlFor="meta_description">Meta Description</Label>
                        <Textarea id="meta_description" placeholder="Enter meta description" value={formData.meta_description} onChange={e => setFormData({...formData, meta_description: e.target.value})} />
                     </div>
                     <div>
                        <Label htmlFor="meta_keywords">Meta Keywords</Label>
                        <Input id="meta_keywords" placeholder="e.g., news, politics, tech" value={formData.meta_keywords} onChange={e => setFormData({...formData, meta_keywords: e.target.value})} />
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Articles</CardTitle>
        <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-1">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Filter</span>
            </Button>
            <Button size="sm" className="gap-1" onClick={() => setShowForm(true)}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">New Article</span>
            </Button>
        </div>
      </CardHeader>
      <CardContent>
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
            {articles.map((article) => (
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

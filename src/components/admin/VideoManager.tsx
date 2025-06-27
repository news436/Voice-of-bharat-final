import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { PlusCircle, MoreHorizontal, Upload, Image as ImageIcon, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const VideoManager = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', title_hi: '', description: '', description_hi: '',
    video_url: '', video_type: 'youtube', thumbnail_url: '',
    category_id: '', state_id: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [videosRes, categoriesRes, statesRes] = await Promise.all([
        supabase.from('videos').select('*, categories(name), states(name)').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
        supabase.from('states').select('*').order('name')
      ]);
      setVideos(videosRes.data || []);
      setCategories(categoriesRes.data || []);
      setStates(statesRes.data || []);
    } catch (error: any) {
      toast({ title: "Error fetching data", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ title: "File too large", description: "Please select an image smaller than 5MB.", variant: "destructive" });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({ title: "Invalid file type", description: "Please select an image file.", variant: "destructive" });
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData({ ...formData, thumbnail_url: '' });
  };

  const generateThumbnail = (url: string, type: string) => {
    if (type === 'youtube') {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      return match ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : '';
    }
    return '';
  };

  const handleVideoTypeChange = (type: string) => {
    setFormData({ ...formData, video_type: type });
    
    // Clear thumbnail when switching video types
    setImageFile(null);
    setImagePreview(null);
    
    // Auto-generate thumbnail for YouTube
    if (type === 'youtube' && formData.video_url) {
      const thumbnail = generateThumbnail(formData.video_url, type);
      setFormData({ ...formData, video_type: type, thumbnail_url: thumbnail });
    } else {
      setFormData({ ...formData, video_type: type, thumbnail_url: '' });
    }
  };

  const handleVideoUrlChange = (url: string) => {
    setFormData({ ...formData, video_url: url });
    
    // Auto-generate thumbnail for YouTube
    if (formData.video_type === 'youtube' && url) {
      const thumbnail = generateThumbnail(url, 'youtube');
      setFormData({ ...formData, video_url: url, thumbnail_url: thumbnail });
    }
  };
  
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      let finalThumbnailUrl = formData.thumbnail_url;
      
      // Upload image if selected
      if (imageFile) {
        toast({ title: "Uploading thumbnail...", description: "Please wait a moment." });
        finalThumbnailUrl = await uploadImage(imageFile);
      }

      const videoData = {
        ...formData,
        thumbnail_url: finalThumbnailUrl,
        category_id: formData.category_id || null,
        state_id: formData.state_id || null,
      };

      if (editingVideo) {
        const { error } = await supabase.from('videos').update(videoData).eq('id', editingVideo.id);
        if (error) throw error;
        toast({ title: "Success", description: "Video updated." });
      } else {
        const { error } = await supabase.from('videos').insert([videoData]);
        if (error) throw error;
        toast({ title: "Success", description: "Video created." });
      }
      resetForm();
      fetchInitialData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditClick = (video: any) => {
    setEditingVideo(video);
    setFormData({
      title: video.title || '', title_hi: video.title_hi || '',
      description: video.description || '', description_hi: video.description_hi || '',
      video_url: video.video_url || '', video_type: video.video_type || 'youtube',
      thumbnail_url: video.thumbnail_url || '', category_id: video.category_id || '',
      state_id: video.state_id || ''
    });
    setImageFile(null);
    setImagePreview(video.thumbnail_url || null);
    setIsSheetOpen(true);
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      const { error } = await supabase.from('videos').delete().eq('id', videoId);
      if (error) throw error;
      toast({ title: "Success", description: "Video deleted." });
      fetchInitialData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };
  
  const resetForm = () => {
    setEditingVideo(null);
    setFormData({
      title: '', title_hi: '', description: '', description_hi: '',
      video_url: '', video_type: 'youtube', thumbnail_url: '',
      category_id: '', state_id: ''
    });
    setImageFile(null);
    setImagePreview(null);
    setIsSheetOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Videos</CardTitle>
        <Button size="sm" className="gap-1" onClick={() => { setEditingVideo(null); resetForm(); setIsSheetOpen(true); }}>
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Video</span>
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.map((video) => (
              <TableRow key={video.id}>
                <TableCell className="hidden sm:table-cell">
                  <img alt={video.title} className="aspect-square rounded-md object-cover" height="64" src={video.thumbnail_url || '/placeholder.svg'} width="64" />
                </TableCell>
                <TableCell className="font-medium">{video.title}</TableCell>
                <TableCell>{video.video_type}</TableCell>
                <TableCell>{video.categories?.name || 'N/A'}</TableCell>
                <TableCell>{new Date(video.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditClick(video)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(video.id)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingVideo ? 'Edit Video' : 'Add New Video'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
             <div className="space-y-2">
               <Label htmlFor="title">Title</Label>
               <Input id="title" placeholder="Video title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
             </div>
             
             <div className="space-y-2">
               <Label htmlFor="title_hi">Title (Hindi)</Label>
               <Input id="title_hi" placeholder="Video title in Hindi" value={formData.title_hi} onChange={e => setFormData({ ...formData, title_hi: e.target.value })} />
             </div>
             
             <div className="space-y-2">
               <Label htmlFor="description">Description</Label>
               <Textarea id="description" placeholder="Video description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
             </div>
             
             <div className="space-y-2">
               <Label htmlFor="description_hi">Description (Hindi)</Label>
               <Textarea id="description_hi" placeholder="Video description in Hindi" value={formData.description_hi} onChange={e => setFormData({ ...formData, description_hi: e.target.value })} />
             </div>
             
             <div className="space-y-2">
               <Label htmlFor="video_url">Video URL</Label>
               <Input id="video_url" placeholder="YouTube or Facebook video URL" value={formData.video_url} onChange={e => handleVideoUrlChange(e.target.value)} required />
             </div>
             
             <div className="space-y-2">
               <Label htmlFor="video_type">Video Type</Label>
               <Select value={formData.video_type} onValueChange={handleVideoTypeChange}>
                  <SelectTrigger><SelectValue placeholder="Select video type" /></SelectTrigger>
                  <SelectContent>
                     <SelectItem value="youtube">YouTube</SelectItem>
                     <SelectItem value="facebook">Facebook</SelectItem>
                  </SelectContent>
               </Select>
             </div>

             {/* Thumbnail Section */}
             <div className="space-y-2">
               <Label htmlFor="thumbnail">Thumbnail</Label>
               
               {formData.video_type === 'youtube' ? (
                 <div className="space-y-2">
                   <Input 
                     id="thumbnail_url" 
                     placeholder="YouTube thumbnail (auto-generated)" 
                     value={formData.thumbnail_url} 
                     onChange={e => setFormData({ ...formData, thumbnail_url: e.target.value })} 
                   />
                   <p className="text-xs text-muted-foreground">
                     YouTube thumbnails are automatically generated from the video URL. You can override with a custom URL if needed.
                   </p>
                 </div>
               ) : (
                 <div className="space-y-3">
                   <div className="flex items-center gap-2">
                     <Label htmlFor="thumbnail_file" className="cursor-pointer">
                       <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                         <Upload className="h-4 w-4" />
                         <span>Upload Thumbnail</span>
                       </div>
                     </Label>
                     <input
                       id="thumbnail_file"
                       type="file"
                       accept="image/*"
                       onChange={handleImageChange}
                       className="hidden"
                     />
                     {imagePreview && (
                       <Button type="button" variant="outline" size="sm" onClick={removeImage}>
                         <X className="h-4 w-4" />
                       </Button>
                     )}
                   </div>
                   
                   {imagePreview && (
                     <div className="mt-2">
                       <img src={imagePreview} alt="Thumbnail preview" className="rounded-md object-cover max-w-[200px] max-h-[150px]" />
                     </div>
                   )}
                   
                   <div className="space-y-2">
                     <Label htmlFor="thumbnail_url">Or use custom URL</Label>
                     <Input 
                       id="thumbnail_url" 
                       placeholder="Custom thumbnail URL" 
                       value={formData.thumbnail_url} 
                       onChange={e => setFormData({ ...formData, thumbnail_url: e.target.value })} 
                     />
                   </div>
                   
                   <p className="text-xs text-muted-foreground">
                     Facebook videos require a custom thumbnail. Upload an image or provide a URL.
                   </p>
                 </div>
               )}
             </div>
             
             <div className="space-y-2">
               <Label htmlFor="category">Category</Label>
               <Select value={formData.category_id} onValueChange={id => setFormData({...formData, category_id: id})}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}</SelectContent>
               </Select>
             </div>
             
             <div className="space-y-2">
               <Label htmlFor="state">State</Label>
               <Select value={formData.state_id} onValueChange={id => setFormData({...formData, state_id: id})}>
                  <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                  <SelectContent>{states.map(st => <SelectItem key={st.id} value={st.id}>{st.name}</SelectItem>)}</SelectContent>
               </Select>
             </div>
             
            <SheetFooter className="mt-6">
              <SheetClose asChild><Button type="button" variant="outline" onClick={resetForm}>Cancel</Button></SheetClose>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? 'Saving...' : 'Save'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </Card>
  );
};

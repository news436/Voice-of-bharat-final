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
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const VideoManager = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
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

  const generateThumbnail = (url: string, type: string) => {
    if (type === 'youtube') {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      return match ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : '';
    }
    return '';
  };
  
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const videoData = {
        ...formData,
        thumbnail_url: formData.thumbnail_url || generateThumbnail(formData.video_url, formData.video_type),
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
      <CardContent>
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
        <SheetContent className="sm:max-w-[600px]">
          <SheetHeader>
            <SheetTitle>{editingVideo ? 'Edit Video' : 'Add New Video'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
             {/* Form content */}
             <Input id="title" placeholder="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
             <Input id="title_hi" placeholder="Title (Hindi)" value={formData.title_hi} onChange={e => setFormData({ ...formData, title_hi: e.target.value })} />
             <Textarea id="description" placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
             <Textarea id="description_hi" placeholder="Description (Hindi)" value={formData.description_hi} onChange={e => setFormData({ ...formData, description_hi: e.target.value })} />
             <Input id="video_url" placeholder="Video URL" value={formData.video_url} onChange={e => setFormData({ ...formData, video_url: e.target.value })} required />
             <Select value={formData.video_type} onValueChange={type => setFormData({...formData, video_type: type})}>
                <SelectTrigger><SelectValue placeholder="Video Type" /></SelectTrigger>
                <SelectContent>
                   <SelectItem value="youtube">YouTube</SelectItem>
                   <SelectItem value="facebook">Facebook</SelectItem>
                </SelectContent>
             </Select>
             <Input id="thumbnail_url" placeholder="Thumbnail URL (auto-generated for YouTube)" value={formData.thumbnail_url} onChange={e => setFormData({ ...formData, thumbnail_url: e.target.value })} />
             <Select value={formData.category_id} onValueChange={id => setFormData({...formData, category_id: id})}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>{categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}</SelectContent>
             </Select>
             <Select value={formData.state_id} onValueChange={id => setFormData({...formData, state_id: id})}>
                <SelectTrigger><SelectValue placeholder="State" /></SelectTrigger>
                <SelectContent>{states.map(st => <SelectItem key={st.id} value={st.id}>{st.name}</SelectItem>)}</SelectContent>
             </Select>
            <SheetFooter>
              <SheetClose asChild><Button type="button" variant="outline" onClick={resetForm}>Cancel</Button></SheetClose>
              <Button type="submit">Save</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </Card>
  );
};

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreHorizontal, Power, PowerOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

export const LiveStreamManager = () => {
  const [streams, setStreams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingStream, setEditingStream] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '', title_hi: '', description: '', description_hi: '',
    stream_url: '', thumbnail_url: '', is_active: false
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('live_streams').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setStreams(data || []);
    } catch (error: any) {
      toast({ title: "Error fetching streams", description: error.message, variant: "destructive" });
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalImageUrl = formData.thumbnail_url;
      if (imageFile) {
        toast({ title: "Uploading thumbnail...", description: "Please wait." });
        finalImageUrl = await uploadImage(imageFile);
      }

      const streamData = { ...formData, thumbnail_url: finalImageUrl };

      if (editingStream) {
        const { error } = await supabase.from('live_streams').update(streamData).eq('id', editingStream.id);
        if (error) throw error;
        toast({ title: "Success", description: "Stream updated." });
      } else {
        const { error } = await supabase.from('live_streams').insert([streamData]);
        if (error) throw error;
        toast({ title: "Success", description: "Stream created." });
      }
      resetForm();
      fetchStreams();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEditClick = (stream: any) => {
    setEditingStream(stream);
    setFormData({
      title: stream.title || '', title_hi: stream.title_hi || '',
      description: stream.description || '', description_hi: stream.description_hi || '',
      stream_url: stream.stream_url || '', thumbnail_url: stream.thumbnail_url || '',
      is_active: stream.is_active || false
    });
    setIsSheetOpen(true);
    setImageFile(null);
    setImagePreview(stream.thumbnail_url || null);
  };
  
  const handleDelete = async (streamId: string) => {
    if (!confirm('Are you sure you want to delete this stream?')) return;
    try {
      const { error } = await supabase.from('live_streams').delete().eq('id', streamId);
      if (error) throw error;
      toast({ title: "Success", description: "Stream deleted." });
      fetchStreams();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const toggleStreamStatus = async (streamId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from('live_streams').update({ is_active: !currentStatus }).eq('id', streamId);
      if (error) throw error;
      toast({ title: "Success", description: `Stream status updated.` });
      fetchStreams();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const resetForm = () => {
    setEditingStream(null);
    setFormData({
      title: '', title_hi: '', description: '', description_hi: '',
      stream_url: '', thumbnail_url: '', is_active: false
    });
    setIsSheetOpen(false);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Live Streams</CardTitle>
        <Button size="sm" className="gap-1" onClick={() => { setEditingStream(null); resetForm(); setIsSheetOpen(true); }}>
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Stream</span>
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {streams.map((stream) => (
              <TableRow key={stream.id}>
                <TableCell className="hidden sm:table-cell">
                  <img alt={stream.title} className="aspect-square rounded-md object-cover" height="64" src={stream.thumbnail_url || '/placeholder.svg'} width="64" />
                </TableCell>
                <TableCell className="font-medium">{stream.title}</TableCell>
                <TableCell>
                  <Badge variant={stream.is_active ? 'default' : 'secondary'}>
                    {stream.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(stream.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditClick(stream)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleStreamStatus(stream.id, stream.is_active)}>
                        {stream.is_active ? <PowerOff className="mr-2 h-4 w-4" /> : <Power className="mr-2 h-4 w-4" />}
                        {stream.is_active ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(stream.id)}>Delete</DropdownMenuItem>
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
            <SheetTitle>{editingStream ? 'Edit Stream' : 'Add New Stream'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
             <Input id="title" placeholder="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
             <Input id="title_hi" placeholder="Title (Hindi)" value={formData.title_hi} onChange={e => setFormData({ ...formData, title_hi: e.target.value })} />
             <Textarea id="description" placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
             <Textarea id="description_hi" placeholder="Description (Hindi)" value={formData.description_hi} onChange={e => setFormData({ ...formData, description_hi: e.target.value })} />
             <Input id="stream_url" placeholder="Stream URL (e.g., YouTube, Facebook)" value={formData.stream_url} onChange={e => setFormData({ ...formData, stream_url: e.target.value })} required />
             
             <div>
                <Label htmlFor="thumbnail">Thumbnail</Label>
                <Input id="thumbnail" type="file" accept="image/*" onChange={handleImageChange} className="mt-1"/>
                {imagePreview && (
                  <div className="mt-4">
                    <img src={imagePreview} alt="Thumbnail preview" className="rounded-md object-cover" width="150" />
                  </div>
                )}
             </div>

             <div className="flex items-center space-x-2">
                <input type="checkbox" id="is_active" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} />
                <label htmlFor="is_active">Is Active</label>
             </div>
            <SheetFooter className="mt-6">
              <SheetClose asChild><Button type="button" variant="outline" onClick={resetForm}>Cancel</Button></SheetClose>
              <Button type="submit">Save</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </Card>
  );
};

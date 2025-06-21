import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export const StateManager = () => {
  const [states, setStates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingState, setEditingState] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', name_hi: '', slug: '' });
  const { language } = useLanguage();

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('states').select('*').order('name');
      if (error) throw error;
      setStates(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const stateData = { ...formData, slug: formData.slug || generateSlug(formData.name) };
      if (editingState) {
        const { error } = await supabase.from('states').update(stateData).eq('id', editingState.id);
        if (error) throw error;
        toast({ title: "Success", description: "State updated." });
      } else {
        const { error } = await supabase.from('states').insert([stateData]);
        if (error) throw error;
        toast({ title: "Success", description: "State created." });
      }
      resetForm();
      fetchStates();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEditClick = (state: any) => {
    setEditingState(state);
    setFormData({ name: state.name || '', name_hi: state.name_hi || '', slug: state.slug || '' });
    setIsSheetOpen(true);
  };

  const handleDelete = async (stateId: string) => {
    if (!confirm('Are you sure you want to delete this state?')) return;
    try {
      const { error } = await supabase.from('states').delete().eq('id', stateId);
      if (error) throw error;
      toast({ title: "Success", description: "State deleted." });
      fetchStates();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };
  
  const resetForm = () => {
    setEditingState(null);
    setFormData({ name: '', name_hi: '', slug: '' });
    setIsSheetOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>States</CardTitle>
        <Button size="sm" className="gap-1" onClick={() => { setEditingState(null); setFormData({ name: '', name_hi: '', slug: '' }); setIsSheetOpen(true); }}>
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add State</span>
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={3} className="text-center">Loading...</TableCell></TableRow>
            ) : (
              states.map((state) => (
                <TableRow key={state.id}>
                  <TableCell className="font-medium">{state.name}</TableCell>
                  <TableCell>{state.slug}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditClick(state)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(state.id)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingState ? 'Edit State' : 'Add New State'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div>
              <label htmlFor="slug" className="text-sm font-medium">Slug</label>
              <Input id="slug" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="Auto-generated" />
            </div>
            <div className="border-t pt-4">
               <h4 className="font-medium mb-2">Hindi Translation</h4>
               <div>
                 <label htmlFor="name_hi" className="text-sm font-medium">Name (Hindi)</label>
                 <Input id="name_hi" value={formData.name_hi} onChange={e => setFormData({ ...formData, name_hi: e.target.value })} />
               </div>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </SheetClose>
              <Button type="submit">Save Changes</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </Card>
  );
}; 
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export const CategoryManager = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '', name_hi: '', slug: '', description: '', description_hi: ''
  });
  const { language } = useLanguage();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error;
      setCategories(data || []);
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
      const categoryData = { ...formData, slug: formData.slug || generateSlug(formData.name) };
      if (editingCategory) {
        const { error } = await supabase.from('categories').update(categoryData).eq('id', editingCategory.id);
        if (error) throw error;
        toast({ title: "Success", description: "Category updated." });
      } else {
        const { error } = await supabase.from('categories').insert([categoryData]);
        if (error) throw error;
        toast({ title: "Success", description: "Category created." });
      }
      resetForm();
      fetchCategories();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEditClick = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '', name_hi: category.name_hi || '', slug: category.slug || '',
      description: category.description || '', description_hi: category.description_hi || ''
    });
    setIsSheetOpen(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const { error } = await supabase.from('categories').delete().eq('id', categoryId);
      if (error) throw error;
      toast({ title: "Success", description: "Category deleted." });
      fetchCategories();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({ name: '', name_hi: '', slug: '', description: '', description_hi: '' });
    setIsSheetOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Categories</CardTitle>
        <Button size="sm" className="gap-1" onClick={() => { setEditingCategory(null); setFormData({ name: '', name_hi: '', slug: '', description: '', description_hi: '' }); setIsSheetOpen(true); }}>
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Category</span>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.slug}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditClick(category)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(category.id)}>Delete</DropdownMenuItem>
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
            <SheetTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</SheetTitle>
            <SheetDescription>
              {editingCategory ? 'Update the details for this category.' : 'Fill out the form to add a new category.'}
            </SheetDescription>
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
            <div>
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Textarea id="description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="border-t pt-4">
               <h4 className="font-medium mb-2">Hindi Translation</h4>
               <div>
                 <label htmlFor="name_hi" className="text-sm font-medium">Name (Hindi)</label>
                 <Input id="name_hi" value={formData.name_hi} onChange={e => setFormData({ ...formData, name_hi: e.target.value })} />
               </div>
                <div className="mt-4">
                 <label htmlFor="description_hi" className="text-sm font-medium">Description (Hindi)</label>
                 <Textarea id="description_hi" value={formData.description_hi} onChange={e => setFormData({ ...formData, description_hi: e.target.value })} />
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

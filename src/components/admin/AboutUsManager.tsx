import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

export const AboutUsManager = () => {
  const [shortDescription, setShortDescription] = useState('');
  const [detailedContent, setDetailedContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAboutUsContent = async () => {
      setIsLoading(true);
      const { data, error } = await (supabase as any)
        .from('about_us')
        .select('*')
        .single();

      if (data) {
        setShortDescription((data as any).short_description);
        setDetailedContent((data as any).detailed_content);
      } else if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        toast({
          title: "Error fetching content",
          description: error.message,
          variant: "destructive",
        });
      }
      setIsLoading(false);
    };

    fetchAboutUsContent();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await (supabase as any)
      .from('about_us')
      .upsert({
        id: 1, // Assuming a single row for About Us content
        short_description: shortDescription,
        detailed_content: detailedContent,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error updating content",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "About Us content has been updated.",
      });
      setShortDescription((data as any).short_description);
      setDetailedContent((data as any).detailed_content);
    }
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>About Us Management</CardTitle>
        <CardDescription>Update the content for the 'About Us' section and page.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Short Description
            </label>
            <Input
              id="shortDescription"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="A brief introduction to display on the homepage."
              className="mt-1"
              disabled={isLoading}
            />
            <p className="mt-2 text-xs text-gray-500">This will be shown on the homepage.</p>
          </div>
          <div>
            <label htmlFor="detailedContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Detailed Content
            </label>
            <Textarea
              id="detailedContent"
              value={detailedContent}
              onChange={(e) => setDetailedContent(e.target.value)}
              placeholder="The full 'About Us' content for the dedicated page."
              className="mt-1"
              rows={10}
              disabled={isLoading}
            />
            <p className="mt-2 text-xs text-gray-500">This will be shown on the /about-us page.</p>
          </div>
          <div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 
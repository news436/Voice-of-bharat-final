import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Suspense } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'color': [] }, { 'background': [] }],
    ['link', 'image'],
    ['clean']
  ],
};

export const AboutUsManager = () => {
  const [shortDescription, setShortDescription] = useState('');
  const [detailedContent, setDetailedContent] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [teamImageUrl, setTeamImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [teamImageFile, setTeamImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const [teamImagePreview, setTeamImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchAboutUsContent = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('about_us')
        .select('*')
        .single();

      if (data) {
        setShortDescription(data.short_description || '');
        setDetailedContent(data.detailed_content || '');
        setHeroImageUrl(data.hero_image_url || '');
        setTeamImageUrl(data.team_image_url || '');
        setHeroImagePreview(data.hero_image_url || null);
        setTeamImagePreview(data.team_image_url || null);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'hero' | 'team') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === 'hero') {
        setHeroImageFile(file);
        setHeroImagePreview(URL.createObjectURL(file));
      } else {
        setTeamImageFile(file);
        setTeamImagePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let finalHeroImageUrl = heroImageUrl;
      let finalTeamImageUrl = teamImageUrl;

      // Upload hero image if new file selected
      if (heroImageFile) {
        toast({ title: "Uploading hero image...", description: "Please wait." });
        finalHeroImageUrl = await uploadImage(heroImageFile);
      }

      // Upload team image if new file selected
      if (teamImageFile) {
        toast({ title: "Uploading team image...", description: "Please wait." });
        finalTeamImageUrl = await uploadImage(teamImageFile);
      }

      const { data, error } = await supabase
        .from('about_us')
        .upsert({
          short_description: shortDescription,
          detailed_content: detailedContent,
          hero_image_url: finalHeroImageUrl,
          team_image_url: finalTeamImageUrl,
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
        setShortDescription(data.short_description || '');
        setDetailedContent(data.detailed_content || '');
        setHeroImageUrl(data.hero_image_url || '');
        setTeamImageUrl(data.team_image_url || '');
        setHeroImageFile(null);
        setTeamImageFile(null);
        setHeroImagePreview(data.hero_image_url || null);
        setTeamImagePreview(data.team_image_url || null);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold md:text-2xl">About Us Management</h1>
        <p className="text-sm text-muted-foreground">
          Update the content and images for the 'About Us' section and page.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About Us Content</CardTitle>
          <CardDescription>Update the content for the 'About Us' section and page.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Input
                    id="shortDescription"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="A brief introduction to display on the homepage."
                    className="mt-1"
                    disabled={isLoading || saving}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">This will be shown on the homepage.</p>
                </div>

                <div>
                  <Label htmlFor="heroImage">Hero Image</Label>
                  <Input
                    id="heroImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'hero')}
                    className="mt-1"
                    disabled={isLoading || saving}
                  />
                  {heroImagePreview && (
                    <div className="mt-4">
                      <img src={heroImagePreview} alt="Hero image preview" className="rounded-md object-cover w-32 h-20" />
                    </div>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">This will be shown on the about us page header.</p>
                </div>

                <div>
                  <Label htmlFor="teamImage">Team Image</Label>
                  <Input
                    id="teamImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'team')}
                    className="mt-1"
                    disabled={isLoading || saving}
                  />
                  {teamImagePreview && (
                    <div className="mt-4">
                      <img src={teamImagePreview} alt="Team image preview" className="rounded-md object-cover w-32 h-20" />
                    </div>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">This will be shown in the about us content.</p>
                </div>
              </div>

              <div>
                <Label htmlFor="detailedContent">Detailed Content</Label>
                <div className="mt-1">
                  <Suspense fallback={<div className="h-64 w-full rounded-md border flex items-center justify-center">Loading Editor...</div>}>
                    <div className="bg-white">
                      <ReactQuill 
                        theme="snow" 
                        value={detailedContent} 
                        onChange={setDetailedContent} 
                        modules={quillModules} 
                        className="h-64 mb-12"
                        placeholder="The full 'About Us' content for the dedicated page."
                      />
                    </div>
                  </Suspense>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">This will be shown on the /about-us page. Supports rich text formatting.</p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading || saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}; 
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
import { Plus, Trash } from 'lucide-react';

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
  const [shortDescriptionHi, setShortDescriptionHi] = useState('');
  const [detailedContent, setDetailedContent] = useState('');
  const [detailedContentHi, setDetailedContentHi] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [teamImageUrl, setTeamImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [teamImageFile, setTeamImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const [teamImagePreview, setTeamImagePreview] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [aboutUsId, setAboutUsId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAboutUsContent = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('about_us')
        .select('*')
        .single();

      if (data) {
        setAboutUsId(data.id || null);
        setShortDescription(data.short_description || '');
        if ('short_description_hi' in data) setShortDescriptionHi((data.short_description_hi ?? '') as string);
        setDetailedContent(data.detailed_content || '');
        if ('detailed_content_hi' in data) setDetailedContentHi((data.detailed_content_hi ?? '') as string);
        setHeroImageUrl((data.hero_image_url ?? '') as string);
        setTeamImageUrl((data.team_image_url ?? '') as string);
        setHeroImagePreview((data.hero_image_url ?? null) as string | null);
        setTeamImagePreview((data.team_image_url ?? null) as string | null);
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

  useEffect(() => {
    const fetchTeamMembers = async () => {
      setTeamLoading(true);
      const { data } = await supabase
        .from('about_us_team_members')
        .select('*')
        .order('ordering', { ascending: true });
      if (data) setTeamMembers(data);
      setTeamLoading(false);
    };
    fetchTeamMembers();
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
          id: aboutUsId,
          short_description: shortDescription,
          short_description_hi: shortDescriptionHi,
          detailed_content: detailedContent,
          detailed_content_hi: detailedContentHi,
          hero_image_url: finalHeroImageUrl,
          team_image_url: finalTeamImageUrl,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })
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
        if ('short_description_hi' in data) setShortDescriptionHi((data.short_description_hi ?? '') as string);
        setDetailedContent(data.detailed_content || '');
        if ('detailed_content_hi' in data) setDetailedContentHi((data.detailed_content_hi ?? '') as string);
        setHeroImageUrl((data.hero_image_url ?? '') as string);
        setTeamImageUrl((data.team_image_url ?? '') as string);
        setHeroImageFile(null);
        setTeamImageFile(null);
        setHeroImagePreview((data.hero_image_url ?? null) as string | null);
        setTeamImagePreview((data.team_image_url ?? null) as string | null);
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

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { name: '', role: '', image_url: '', imageFile: null }]);
  };

  const removeTeamMember = (idx: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== idx));
  };

  const handleMemberChange = (idx: number, field: string, value: any) => {
    setTeamMembers(teamMembers.map((m, i) => i === idx ? { ...m, [field]: value } : m));
  };

  const handleMemberImageChange = (idx: number, file: File) => {
    setTeamMembers(teamMembers.map((m, i) => i === idx ? { ...m, imageFile: file, image_url: URL.createObjectURL(file) } : m));
  };

  const saveTeamMembers = async () => {
    setTeamLoading(true);
    try {
      const uploadedMembers = await Promise.all(teamMembers.map(async (member, idx) => {
        let imageUrl = member.image_url;
        if (member.imageFile) {
          imageUrl = await uploadImage(member.imageFile);
        }
        return {
          ...member,
          image_url: imageUrl,
          ordering: idx,
          imageFile: undefined,
        };
      }));
      await supabase.from('about_us_team_members').delete().neq('id', 0);
      if (uploadedMembers.length > 0 && typeof aboutUsId === 'string' && aboutUsId) {
        await supabase.from('about_us_team_members').insert(
          uploadedMembers.map(({ name, role, image_url, ordering }) => ({
            id: String(Date.now() + Math.floor(Math.random() * 1000000)), // id as string for Supabase
            name,
            role,
            image_url: image_url ? image_url : null,
            ordering: Number(ordering),
            about_us_id: aboutUsId,
          }))
        );
      }
      toast({ title: 'Team updated', description: 'Team members have been saved.' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
    setTeamLoading(false);
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
                  <Label htmlFor="shortDescriptionHi">Short Description (Hindi)</Label>
                  <Input
                    id="shortDescriptionHi"
                    value={shortDescriptionHi}
                    onChange={(e) => setShortDescriptionHi(e.target.value)}
                    placeholder="A brief introduction to display on the homepage in Hindi."
                    className="mt-1"
                    disabled={isLoading || saving}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">This will be shown on the homepage in Hindi.</p>
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
                      <img src={heroImagePreview} alt="Hero image preview" className="rounded-md object-cover w-32 h-20" loading="lazy" />
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
                      <img src={teamImagePreview} alt="Team image preview" className="rounded-md object-cover w-32 h-20" loading="lazy" />
                    </div>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">This will be shown in the about us content.</p>
                </div>
              </div>

              <div className="space-y-4">
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

                <div>
                  <Label htmlFor="detailedContentHi">Detailed Content (Hindi)</Label>
                  <div className="mt-1">
                    <Suspense fallback={<div className="h-64 w-full rounded-md border flex items-center justify-center">Loading Editor...</div>}>
                      <div className="bg-white">
                        <ReactQuill 
                          theme="snow" 
                          value={detailedContentHi} 
                          onChange={setDetailedContentHi} 
                          modules={quillModules} 
                          className="h-64 mb-12"
                          placeholder="The full 'About Us' content for the dedicated page in Hindi."
                        />
                      </div>
                    </Suspense>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">This will be shown on the /about-us page in Hindi. Supports rich text formatting.</p>
                </div>
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

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Meet the Team</CardTitle>
          <CardDescription>Manage the team members shown in the About Us page.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="flex flex-col md:flex-row items-center gap-4 border-b pb-4 mb-4">
                <div className="flex-shrink-0">
                  {member.image_url ? (
                    <img src={member.image_url} alt="Team member" className="w-20 h-20 rounded-full object-cover border" loading="lazy" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
                  )}
                  <Input type="file" accept="image/*" className="mt-2" onChange={e => e.target.files && handleMemberImageChange(idx, e.target.files[0])} />
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input value={member.name} onChange={e => handleMemberChange(idx, 'name', e.target.value)} placeholder="Name" />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Input value={member.role} onChange={e => handleMemberChange(idx, 'role', e.target.value)} placeholder="Role" />
                  </div>
                </div>
                <Button type="button" variant="destructive" size="icon" className="self-start mt-2" onClick={() => removeTeamMember(idx)}><Trash className="w-4 h-4" /></Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addTeamMember} className="gap-2"><Plus className="w-4 h-4" /> Add Member</Button>
            <div className="flex justify-end">
              <Button type="button" onClick={saveTeamMembers} disabled={teamLoading}>{teamLoading ? 'Saving...' : 'Save Team'}</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 
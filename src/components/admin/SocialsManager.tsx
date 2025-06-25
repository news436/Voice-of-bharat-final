import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const defaultLinks = {
  facebook_url: '',
  twitter_url: '',
  youtube_url: '',
  instagram_url: '',
};

export const SocialsManager = () => {
  const [links, setLinks] = useState({ ...defaultLinks });
  const [rowId, setRowId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchLinks = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('socials').select('*').limit(1).single();
      if (data) {
        setLinks({
          facebook_url: data.facebook_url || '',
          twitter_url: data.twitter_url || '',
          youtube_url: data.youtube_url || '',
          instagram_url: data.instagram_url || '',
        });
        setRowId(data.id);
      }
      setLoading(false);
    };
    fetchLinks();
  }, []);

  const handleChange = (field: keyof typeof defaultLinks, value: string) => {
    setLinks((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    let result;
    if (rowId) {
      result = await supabase.from('socials').update(links).eq('id', rowId);
    } else {
      result = await supabase.from('socials').insert([links]);
    }
    if (result.error) {
      toast({ title: 'Error', description: result.error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Social links updated.' });
      if (!rowId && result.data && result.data[0]?.id) setRowId(result.data[0].id);
    }
    setSaving(false);
  };

  return (
    <Card className="max-w-xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Manage Social Media Links</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block font-semibold mb-1">Facebook URL</label>
          <Input value={links.facebook_url} onChange={e => handleChange('facebook_url', e.target.value)} placeholder="https://facebook.com/yourpage" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Twitter URL</label>
          <Input value={links.twitter_url} onChange={e => handleChange('twitter_url', e.target.value)} placeholder="https://twitter.com/yourprofile" />
        </div>
        <div>
          <label className="block font-semibold mb-1">YouTube URL</label>
          <Input value={links.youtube_url} onChange={e => handleChange('youtube_url', e.target.value)} placeholder="https://youtube.com/yourchannel" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Instagram URL</label>
          <Input value={links.instagram_url} onChange={e => handleChange('instagram_url', e.target.value)} placeholder="https://instagram.com/yourprofile" />
        </div>
        <Button onClick={handleSave} loading={saving} disabled={saving} className="w-full mt-4">Save</Button>
      </CardContent>
    </Card>
  );
}; 
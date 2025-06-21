import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

const AD_SLOTS = [1, 2, 3, 4];

export const AdManager = () => {
  const [ads, setAds] = useState<{ [slot: number]: any }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState<{ [slot: number]: boolean }>({});

  useEffect(() => {
    fetchAds();
  }, []);

  async function fetchAds() {
    setIsLoading(true);
    const { data, error } = await supabase.from('ads').select('*').order('slot_number');
    if (error) {
      toast({ title: 'Error', description: 'Failed to load ad slots.', variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    const adsBySlot: { [slot: number]: any } = {};
    data.forEach((ad: any) => {
      adsBySlot[ad.slot_number] = ad;
    });

    AD_SLOTS.forEach(slot => {
      if (!adsBySlot[slot]) {
        adsBySlot[slot] = { slot_number: slot, html_code: '', enabled: false };
      }
    });
    setAds(adsBySlot);
    setIsLoading(false);
  }

  async function saveAd(slot: number) {
    setSaving(s => ({ ...s, [slot]: true }));
    const ad = ads[slot];
    const upsertData = {
      slot_number: slot,
      html_code: ad.html_code || '',
      enabled: ad.enabled,
    };
    
    const { error } = await supabase.from('ads').upsert(upsertData, { onConflict: 'slot_number' });
    
    if (error) {
      toast({ title: 'Error', description: `Failed to save Ad Slot ${slot}.`, variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: `Ad Slot ${slot} has been updated.` });
    }
    setSaving(s => ({ ...s, [slot]: false }));
  }

  function handleAdChange(slot: number, field: string, value: any) {
    setAds(currentAds => ({
      ...currentAds,
      [slot]: { ...currentAds[slot], [field]: value }
    }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold md:text-2xl">Ad Manager</h1>
        <p className="text-sm text-muted-foreground">
          Manage ad slots for the homepage.
        </p>
      </div>

      <Tabs defaultValue="slot-1" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {AD_SLOTS.map(slot => (
            <TabsTrigger key={slot} value={`slot-${slot}`}>Ad Slot {slot}</TabsTrigger>
          ))}
        </TabsList>
        {AD_SLOTS.map(slot => (
          <TabsContent key={slot} value={`slot-${slot}`}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Ad Slot {slot}</CardTitle>
                    <CardDescription>Paste ad code below. Changes are live after saving.</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                     <label htmlFor={`enable-switch-${slot}`} className="text-sm font-medium">Enable Ad</label>
                     <Switch
                        id={`enable-switch-${slot}`}
                        checked={ads[slot]?.enabled || false}
                        onCheckedChange={v => handleAdChange(slot, 'enabled', v)}
                     />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-sm font-medium">Ad Code</label>
                     <Textarea
                        className="w-full font-mono text-xs"
                        rows={12}
                        placeholder="<!-- Paste your ad script or HTML here -->"
                        value={ads[slot]?.html_code || ''}
                        onChange={e => handleAdChange(slot, 'html_code', e.target.value)}
                        spellCheck={false}
                     />
                  </div>
                  <div className="space-y-2">
                      <label className="text-sm font-medium">Live Preview</label>
                      <div className="w-full h-[250px] border rounded-md bg-muted/40 flex items-center justify-center overflow-hidden">
                        {ads[slot]?.enabled && ads[slot]?.html_code?.trim() ? (
                          <iframe
                            title={`Ad Slot ${slot} Preview`}
                            srcDoc={ads[slot].html_code}
                            sandbox="allow-scripts allow-same-origin"
                            className="w-full h-full border-0 transform scale-100"
                          />
                        ) : (
                          <div className="text-center text-muted-foreground">
                             <p>{ads[slot]?.enabled ? 'Preview will appear here' : 'Ad is disabled'}</p>
                          </div>
                        )}
                      </div>
                  </div>
                </div>
                 <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={() => saveAd(slot)}
                      disabled={saving[slot] || isLoading}
                    >
                      {saving[slot] ? 'Saving...' : `Save Slot ${slot}`}
                    </Button>
                 </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}; 
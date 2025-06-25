import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Smartphone, Monitor } from 'lucide-react';

const AD_SLOTS = [1, 2, 3, 4, 5, 6, 7];

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
        adsBySlot[slot] = {
          slot_number: slot,
          html_code: '',
          enabled: false,
          image_url: '',
          redirect_url: '',
          ad_type: 'html'
        };
      }
    });
    setAds(adsBySlot);
    setIsLoading(false);
  }

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

  const handleImageChange = (slot: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleAdChange(slot, 'imageFile', file);
      handleAdChange(slot, 'imagePreview', URL.createObjectURL(file));
    }
  };

  async function saveAd(slot: number) {
    setSaving(s => ({ ...s, [slot]: true }));
    try {
    const ad = ads[slot];
      let finalImageUrl = ad.image_url;

      // Upload image if new file selected
      if (ad.imageFile) {
        toast({ title: "Uploading image...", description: "Please wait." });
        finalImageUrl = await uploadImage(ad.imageFile);
      }

    const upsertData = {
      slot_number: slot,
      html_code: ad.html_code || '',
      enabled: ad.enabled,
        image_url: finalImageUrl || '',
        redirect_url: ad.redirect_url || '',
        ad_type: ad.ad_type || 'html',
    };
    
    const { error } = await supabase.from('ads').upsert(upsertData, { onConflict: 'slot_number' });
    
    if (error) {
      toast({ title: 'Error', description: `Failed to save Ad Slot ${slot}.`, variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: `Ad Slot ${slot} has been updated.` });
        // Clear the file and preview after successful save
        handleAdChange(slot, 'imageFile', null);
        handleAdChange(slot, 'imagePreview', null);
        handleAdChange(slot, 'image_url', finalImageUrl);
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
    setSaving(s => ({ ...s, [slot]: false }));
    }
  }

  function handleAdChange(slot: number, field: string, value: any) {
    setAds(currentAds => ({
      ...currentAds,
      [slot]: { ...currentAds[slot], [field]: value }
    }));
  }

  const getSlotDescription = (slot: number) => {
    switch (slot) {
      case 1:
        return 'Homepage sidebar (top)';
      case 2:
        return 'Homepage top banner';
      case 3:
        return 'Homepage bottom banner';
      case 4:
        return 'Homepage after featured articles';
      case 5:
        return 'Article pages - top banner';
      case 6:
        return 'Live news pages - sidebar';
      case 7:
        return 'Latest news page - bottom banner';
      default:
        return 'General ad slot';
    }
  };

  const getSlotDimensions = (slot: number) => {
    switch (slot) {
      case 1:
        return { width: 300, height: 250, description: 'Sidebar Banner (300×250)' };
      case 2:
      case 3:
      case 4:
      case 5:
      case 7:
        return { width: 2275, height: 150, description: 'Large Banner (e.g., 728x90)' };
      case 6:
        return { width: 300, height: 375, description: 'Taller Rectangle (300×375)' };
      default:
        return { width: 300, height: 250, description: 'Standard Banner (300×250)' };
    }
  };

  const getMobileHeight = (slot: number) => {
    switch (slot) {
      case 2:
      case 4:
      case 5:
        return 60; // Reduced for better banner fit
      case 3:
      case 7:
        return 60; // Reduced for better banner fit
      case 6:
        return 375; // Taller ad size
      default:
        return 150; // Reduced for better fit
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold md:text-2xl">Ad Manager</h1>
        <p className="text-sm text-muted-foreground">
          Manage ad slots across the website including homepage, article pages, live news, and latest news pages.
        </p>
      </div>

      <Tabs defaultValue="slot-1" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          {AD_SLOTS.map(slot => (
            <TabsTrigger key={slot} value={`slot-${slot}`}>Slot {slot}</TabsTrigger>
          ))}
        </TabsList>
        {AD_SLOTS.map(slot => (
          <TabsContent key={slot} value={`slot-${slot}`}>
            <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ad Slot {slot}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {getSlotDescription(slot)} - Configure your ad content below.
                      {ads[slot]?.ad_type === 'image' && (
                        <span className="block mt-1 text-xs font-medium text-blue-600">
                          📏 Recommended: {getSlotDimensions(slot).description}
                        </span>
                      )}
                    </p>
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
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`ad-type-${slot}`}>Ad Type</Label>
                      <Select
                        value={ads[slot]?.ad_type || 'html'}
                        onValueChange={v => handleAdChange(slot, 'ad_type', v)}
                      >
                        <SelectTrigger id={`ad-type-${slot}`}>
                          <SelectValue placeholder="Select ad type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="html">HTML/Code Ad</SelectItem>
                          <SelectItem value="image">Image Ad</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {ads[slot]?.ad_type === 'html' ? (
                  <div className="space-y-2">
                        <Label htmlFor={`html-code-${slot}`}>Ad Code</Label>
                     <Textarea
                          id={`html-code-${slot}`}
                        className="w-full font-mono text-xs"
                        rows={12}
                        placeholder="<!-- Paste your ad script or HTML here -->"
                        value={ads[slot]?.html_code || ''}
                        onChange={e => handleAdChange(slot, 'html_code', e.target.value)}
                        spellCheck={false}
                     />
                  </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor={`ad-image-${slot}`}>Ad Image</Label>
                          <Input
                            id={`ad-image-${slot}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(slot, e)}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`redirect-url-${slot}`}>Redirect URL</Label>
                          <Input
                            id={`redirect-url-${slot}`}
                            type="url"
                            placeholder="https://example.com"
                            value={ads[slot]?.redirect_url || ''}
                            onChange={e => handleAdChange(slot, 'redirect_url', e.target.value)}
                            className="mt-1"
                          />
                          <p className="mt-1 text-xs text-muted-foreground">
                            URL where users will be redirected when they click the ad
                          </p>
                        </div>
                          </div>
                        )}
                  </div>

                  <div className="space-y-2">
                    <Label>Live Preview</Label>
                    <div className="p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg space-y-4">
                      {/* Desktop Preview */}
                      <div>
                        <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          <Monitor className="h-4 w-4" />
                          <span>Desktop</span>
                        </div>
                        <div className="w-full border rounded-md bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden mx-auto" style={{ height: `${getSlotDimensions(slot).height}px` }}>
                          {ads[slot]?.enabled ? (
                            ads[slot]?.ad_type === 'image' && (ads[slot]?.image_url || ads[slot]?.imagePreview) ? (
                              <img src={ads[slot]?.imagePreview || ads[slot]?.image_url} alt="Ad preview" className="w-full h-full object-cover" />
                            ) : ads[slot]?.ad_type === 'html' && ads[slot]?.html_code ? (
                              <iframe title="Desktop Preview" srcDoc={ads[slot].html_code} sandbox="allow-scripts allow-same-origin" className="w-full h-full border-0" />
                            ) : <p className="text-xs text-muted-foreground p-4 text-center">No content for preview</p>
                          ) : <p className="text-xs text-muted-foreground p-4 text-center">Ad is disabled</p>}
                        </div>
                      </div>

                      {/* Mobile Preview */}
                      <div>
                        <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          <Smartphone className="h-4 w-4" />
                          <span>Mobile</span>
                        </div>
                        <div className="w-full max-w-[320px] border rounded-md bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden mx-auto" style={{ height: `${getMobileHeight(slot)}px` }}>
                          {ads[slot]?.enabled ? (
                            ads[slot]?.ad_type === 'image' && (ads[slot]?.image_url || ads[slot]?.imagePreview) ? (
                              <div className="w-full h-full flex items-center justify-center overflow-hidden">
                                <img 
                                  src={ads[slot]?.imagePreview || ads[slot]?.image_url} 
                                  alt="Ad preview" 
                                  className="w-full h-full object-contain"
                                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                                />
                              </div>
                            ) : ads[slot]?.ad_type === 'html' && ads[slot]?.html_code ? (
                              <iframe title="Mobile Preview" srcDoc={ads[slot].html_code} sandbox="allow-scripts allow-same-origin" className="w-full h-full border-0" />
                            ) : <p className="text-xs text-muted-foreground p-4 text-center">No content for preview</p>
                          ) : <p className="text-xs text-muted-foreground p-4 text-center">Ad is disabled</p>}
                        </div>
                      </div>
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
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}; 
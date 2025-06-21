import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';

interface AdSlotProps {
  slotNumber: number;
}

export const AdSlot = ({ slotNumber }: AdSlotProps) => {
  const [ad, setAd] = useState<{ html_code: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAd = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ads')
        .select('html_code')
        .eq('slot_number', slotNumber)
        .eq('enabled', true)
        .maybeSingle();

      if (error) {
        console.error(`Error fetching ad for slot ${slotNumber}:`, error.message);
        setAd(null);
      } else {
        setAd(data);
      }
      setIsLoading(false);
    };

    fetchAd();
  }, [slotNumber]);

  if (isLoading) {
    return null; // Don't show anything while loading
  }

  if (!ad) {
    return null; // Ad not found or not enabled
  }

  if (!ad.html_code) {
    return (
      <div className="w-full h-[100px] border-2 border-dashed rounded-md bg-muted/20 flex items-center justify-center p-4">
        <p className="text-center text-sm text-muted-foreground">Ad Slot {slotNumber}: Add content in Ad Manager.</p>
      </div>
    );
  }

  return (
    <Card className="w-full h-auto p-0 m-0 border-none overflow-hidden">
        <div dangerouslySetInnerHTML={{ __html: ad.html_code }} />
    </Card>
  );
}; 
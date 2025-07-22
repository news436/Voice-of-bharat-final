import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdTracker, trackAdClick } from './AdTracker';

interface AdSlotProps {
  slotNumber: number;
}

// Get recommended dimensions for each ad slot (for admin UI)
const getSlotDimensions = (slot: number) => {
  // No fixed width/height, just a label for admin UI
  switch (slot) {
    case 2:
    case 3:
    case 5:
    case 7:
      return { description: 'Homepage Top Banner (2275×200)' };
    case 1:
    case 12:
      return { description: 'Sidebar Banner (400x400) square shape' };
    case 4:
      return { description: 'Large Rectangle (336×280)' };
    case 6:
      return { description: 'Live News Sidebar (300×375)' };
    case 8:
    case 9:
      return { description: 'Large Custom (650×250)' };
    case 10:
      return { description: 'Large Custom (900×600)' };
    case 11:
      return { description: 'Large Custom (900×600)' };
    default:
      return { description: 'Standard Banner' };
  }
};

// Responsive slot container: no fixed size, just center content
const getSlotClasses = (slot: number) => {
  if (slot === 4) {
    return 'w-full max-w-[1200px] mx-auto flex justify-center items-center';
  }
  if (slot === 8 || slot === 9 || slot === 10 || slot === 11) {
    return 'w-full flex justify-center items-center bg-white border border-gray-200 shadow-sm my-4';
  }
  return 'flex justify-center items-center w-full';
};

// Responsive image: fit image, never overflow, scale down if needed
const getImageClasses = (slot: number) => {
  // For slots 8 and 9, allow full width, responsive, centered
  if (slot === 8 || slot === 9) {
    return 'block w-full max-w-none h-auto';
  }
  // Default for other slots
  return 'block max-w-full h-auto max-h-[400px]'; // max-h for very tall images
};

export const AdSlot = ({ slotNumber }: AdSlotProps) => {
  const [ad, setAd] = useState<{ 
    id?: string;
    html_code: string; 
    image_url: string; 
    redirect_url: string; 
    ad_type: string;
    image_width?: number;
    image_height?: number;
    mobile_height?: number;
    desktop_height?: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const slotClasses = getSlotClasses(slotNumber);

  useEffect(() => {
    const fetchAd = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ads')
        .select('id, html_code, image_url, redirect_url, ad_type, image_width, image_height, mobile_height, desktop_height')
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

  const handleAdClick = (redirectUrl: string) => {
    if (redirectUrl) {
      trackAdClick(slotNumber, ad?.id, () => console.log(`Ad clicked: ${redirectUrl}`));
      window.open(redirectUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (isLoading) {
    return null;
  }

  if (!ad) {
    return null;
  }

  // Handle HTML ads
  if (ad.ad_type === 'html' && ad.html_code) {
    return (
      <div className={slotClasses}>
        <AdTracker 
          slotNumber={slotNumber} 
          adId={ad.id}
          onImpression={() => console.log(`Ad impression tracked for slot ${slotNumber}`)}
        />
        <div dangerouslySetInnerHTML={{ __html: ad.html_code }} />
      </div>
    );
  }

  // Handle image ads
  if (ad.ad_type === 'image' && ad.image_url) {
    return (
      <div className={slotClasses}>
        <AdTracker 
          slotNumber={slotNumber} 
          adId={ad.id}
          onImpression={() => console.log(`Ad impression tracked for slot ${slotNumber}`)}
        />
        <div 
          className="relative cursor-pointer transition-transform hover:scale-105"
          onClick={() => handleAdClick(ad.redirect_url)}
          title={ad.redirect_url ? "Click to visit" : ""}
        >
          {/* ADVERTISEMENT label overlay */}
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-black bg-opacity-10 text-white px-1 py-0.5 rounded pointer-events-none select-none tracking-widest uppercase text-[0.7vw] md:text-[10px] max-w-[60%] text-center whitespace-nowrap"
            style={{ minWidth: '32px', maxWidth: '100px' }}
          >
            ADVERTISEMENT
          </div>
          <img 
            src={ad.image_url} 
            alt="Advertisement" 
            className={getImageClasses(slotNumber)}
            loading="lazy"
            style={{ display: 'block', margin: '0 auto' }}
          />
        </div>
      </div>
    );
  }

  // Fallback for empty ads
  return (
    <div className="flex justify-center items-center w-full h-[100px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">Ad Slot {slotNumber}: Add content in Ad Manager.</p>
    </div>
  );
}; 
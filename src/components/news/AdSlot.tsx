import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdSlotProps {
  slotNumber: number;
}

// Get recommended dimensions for each ad slot (for admin UI)
const getSlotDimensions = (slot: number) => {
  switch (slot) {
    case 1:
      return { width: 300, height: 250, className: 'w-full max-w-[300px] h-[250px]' };
    case 2:
      return { width: 2275, height: 150, className: 'w-full max-w-[2275px] h-[150px]' };
    case 3:
      return { width: 728, height: 150, className: 'w-full max-w-[728px] h-[150px]' };
    case 4:
      return { width: 300, height: 250, className: 'w-full max-w-[300px] h-[250px]' };
    case 5:
      return { width: 2275, height: 150, className: 'w-full max-w-[2275px] h-[150px]' };
    case 6:
      return { width: 300, height: 375, className: 'w-full max-w-[300px] h-[375px]' };
    case 7:
      return { width: 728, height: 150, className: 'w-full max-w-[728px] h-[150px]' };
    default:
      return { width: 300, height: 250, className: 'w-full max-w-[300px] h-[250px]' };
  }
};

// NEW: Get responsive classes for the ad slot container
const getSlotClasses = (slot: number) => {
  switch (slot) {
    // Large Desktop Banners -> Mobile Banners (reduced height for better fit)
    case 2:
    case 3:
    case 4:
    case 5:
    case 7:
      return 'w-full h-[60px] md:h-[150px]'; // Reduced to 60px for mobile

    // Medium Rectangle Ad
    case 1:
      return 'w-full h-[150px] md:h-[250px] max-w-[300px] mx-auto'; // Standard MPU

    // NEW: Taller Ad for Slot 6
    case 6:
      return 'w-full h-[375px] max-w-[300px] mx-auto'; // Taller 4:5 ratio ad

    default:
      return 'w-full h-[150px] md:h-[250px]';
  }
};

// NEW: Get responsive image classes
const getImageClasses = (slot: number) => {
  // Use object-cover for all slots to eliminate white space
  return 'w-full h-full object-cover';
};

export const AdSlot = ({ slotNumber }: AdSlotProps) => {
  const [ad, setAd] = useState<{ 
    html_code: string; 
    image_url: string; 
    redirect_url: string; 
    ad_type: string; 
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const slotClasses = getSlotClasses(slotNumber);

  const dimensions = getSlotDimensions(slotNumber);

  useEffect(() => {
    const fetchAd = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ads')
        .select('html_code, image_url, redirect_url, ad_type')
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
      // Open in new tab
      window.open(redirectUrl, '_blank', 'noopener,noreferrer');
      
      // Track click (optional - you can add analytics here)
      console.log(`Ad clicked: ${redirectUrl}`);
    }
  };

  if (isLoading) {
    return null; // Don't show anything while loading
  }

  if (!ad) {
    return null; // Ad not found or not enabled
  }

  // Handle HTML ads
  if (ad.ad_type === 'html' && ad.html_code) {
    return (
      <div className={`w-full overflow-hidden bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${slotClasses}`}>
        <div dangerouslySetInnerHTML={{ __html: ad.html_code }} className="w-full h-full" />
      </div>
    );
  }

  // Handle image ads
  if (ad.ad_type === 'image' && ad.image_url) {
    return (
      <div className="w-full overflow-hidden bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div 
          className={`cursor-pointer transition-transform hover:scale-105 ${slotClasses}`}
          onClick={() => handleAdClick(ad.redirect_url)}
          title={ad.redirect_url ? "Click to visit" : ""}
        >
          <img 
            src={ad.image_url} 
            alt="Advertisement" 
            className={`${getImageClasses(slotNumber)}`}
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  // Fallback for empty ads
  return (
    <div className="w-full h-[100px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center p-4">
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">Ad Slot {slotNumber}: Add content in Ad Manager.</p>
    </div>
  );
}; 
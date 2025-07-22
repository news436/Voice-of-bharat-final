import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdTrackerProps {
  slotNumber: number;
  adId?: string;
  onImpression?: () => void;
  onClick?: () => void;
}

export const AdTracker = ({ slotNumber, adId, onImpression }: AdTrackerProps) => {
  useEffect(() => {
    // Track impression when ad is loaded
    const trackImpression = async () => {
      try {
        await supabase.from('analytics').insert({
          event_type: 'ad_impression',
          article_id: null, // Not tied to specific article
          user_ip: null, // Will be captured by Supabase RLS
          user_agent: navigator.userAgent,
          referrer: document.referrer,
          // Add custom data for ad tracking
          custom_data: {
            slot_number: slotNumber,
            ad_id: adId,
            timestamp: new Date().toISOString()
          }
        });
        
        onImpression?.();
      } catch (error) {
        console.error('Failed to track ad impression:', error);
      }
    };

    // Track impression after a short delay to ensure ad is visible
    const timer = setTimeout(trackImpression, 1000);
    
    return () => clearTimeout(timer);
  }, [slotNumber, adId, onImpression]);

  // Return null since this is just for tracking
  return null;
};

// Separate function for tracking ad clicks
export const trackAdClick = async (slotNumber: number, adId?: string, onClick?: () => void) => {
  try {
    await supabase.from('analytics').insert({
      event_type: 'ad_click',
      article_id: null,
      user_ip: null,
      user_agent: navigator.userAgent,
      referrer: document.referrer,
      custom_data: {
        slot_number: slotNumber,
        ad_id: adId,
        timestamp: new Date().toISOString()
      }
    });
    
    onClick?.();
  } catch (error) {
    console.error('Failed to track ad click:', error);
  }
}; 
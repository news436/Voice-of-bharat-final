import { getYoutubeEmbedUrl } from '@/lib/youtube-utils';
import { isValidFacebookUrl } from '@/lib/facebook-utils';
import { useEffect } from 'react';

declare global {
  interface Window {
    FB: any;
  }
}

interface ArticleVideoPlayerProps {
  youtubeUrl?: string;
  facebookUrl?: string;
  title?: string;
}

export const ArticleVideoPlayer = ({ youtubeUrl, facebookUrl, title }: ArticleVideoPlayerProps) => {
  useEffect(() => {
    if (window.FB && facebookUrl) {
      window.FB.XFBML.parse();
    }
  }, [facebookUrl]);

  // Determine which video to show (prioritize YouTube if both are provided)
  const videoUrl = youtubeUrl || facebookUrl;
  const videoType = youtubeUrl ? 'youtube' : 'facebook';
  
  if (!videoUrl) {
    return null;
  }

  let embedUrl: string | null = null;
  let isValidUrl = false;

  if (videoType === 'youtube') {
    embedUrl = getYoutubeEmbedUrl(videoUrl);
    isValidUrl = !!embedUrl;
  } else if (videoType === 'facebook') {
    isValidUrl = isValidFacebookUrl(videoUrl);
  }
  
  if (!isValidUrl) {
    return (
      <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-600 dark:text-red-400 text-sm">
          Invalid {videoType === 'youtube' ? 'YouTube' : 'Facebook'} URL provided
        </p>
      </div>
    );
  }

  if (videoType === 'youtube' && embedUrl) {
    return (
      <div className="mb-8">
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={embedUrl}
            title={title || "YouTube video player"}
            className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  if (videoType === 'facebook') {
    return (
      <div className="mb-8">
        <div className="flex justify-center">
          <div
            className="fb-video"
            data-href={videoUrl}
            data-width="100%"
            data-allowfullscreen="true"
            data-show-text="false"
            data-lazy="true"
          ></div>
        </div>
      </div>
    );
  }

  return null;
}; 
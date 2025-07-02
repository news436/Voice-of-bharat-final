import { getYoutubeEmbedUrl } from '@/lib/youtube-utils';
import { getFacebookEmbedUrl } from '@/lib/facebook-utils';

interface ArticleVideoPlayerProps {
  youtubeUrl?: string;
  facebookUrl?: string;
  title?: string;
}

function getEmbedUrl(url?: string): string | null {
  if (!url) return null;
  if (url.includes('facebook.com')) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=1280&autoplay=0`;
  }
  // YouTube logic (for completeness, but not used here)
    return null;
  }

export const ArticleVideoPlayer = ({ youtubeUrl, facebookUrl, title }: ArticleVideoPlayerProps) => {
  // Prefer YouTube if both are provided
  if (youtubeUrl) {
  const embedUrl = getYoutubeEmbedUrl(youtubeUrl);
  if (!embedUrl) {
    return (
      <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-600 dark:text-red-400 text-sm">
          Invalid YouTube URL provided
        </p>
      </div>
    );
  }
  return (
    <div className="mb-8">
      <div className="max-w-2xl mx-auto">
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
    </div>
  );
  }

  if (facebookUrl) {
    const embedUrl = getEmbedUrl(facebookUrl);
    if (!embedUrl) {
      return (
        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">
            Invalid Facebook video URL provided
          </p>
        </div>
      );
    }
    return (
      <div className="mb-8">
        <div className="max-w-2xl mx-auto">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={embedUrl}
              title={title || "Facebook video player"}
              className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    );
  }

  // If neither provided
  return null;
}; 
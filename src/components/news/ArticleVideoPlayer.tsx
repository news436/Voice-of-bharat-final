import { getYoutubeEmbedUrl } from '@/lib/youtube-utils';

interface ArticleVideoPlayerProps {
  youtubeUrl: string;
  title?: string;
}

export const ArticleVideoPlayer = ({ youtubeUrl, title }: ArticleVideoPlayerProps) => {
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
}; 
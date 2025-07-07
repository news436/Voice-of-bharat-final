import { Play, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import { getYoutubeEmbedUrl, isValidYoutubeUrl } from '@/lib/youtube-utils';
import { getFacebookEmbedUrl, isValidFacebookUrl } from '@/lib/facebook-utils';

declare global {
  interface Window {
    FB: any;
  }
}

interface VideoPlayerProps {
  video: any;
}

const VideoPlayer = ({ video }: VideoPlayerProps) => {
  useEffect(() => {
    if (window.FB) {
      window.FB.XFBML.parse();
    }
  }, [video]);

  if (!video) return null;

  const renderVideo = () => {
    if (video.video_type === "youtube") {
      const finalEmbedUrl = getYoutubeEmbedUrl(video.video_url);
      if (!finalEmbedUrl || !isValidYoutubeUrl(video.video_url)) {
        return (
          <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-black text-white">
            <p>Invalid YouTube video URL.</p>
          </div>
        );
      }
      return (
        <div className="relative w-full h-full">
          <iframe
            src={finalEmbedUrl}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full rounded-t-3xl"
          ></iframe>
        </div>
      );
    }

    if (video.video_type === "facebook") {
      const finalEmbedUrl = getFacebookEmbedUrl(video.video_url);
      if (!finalEmbedUrl || !isValidFacebookUrl(video.video_url)) {
        return (
          <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-black text-white">
            <p>Invalid Facebook video URL.</p>
          </div>
        );
      }
      return (
        <div className="relative w-full h-full">
          <iframe
            src={finalEmbedUrl}
            title={video.title}
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full rounded-t-3xl"
          ></iframe>
        </div>
      );
    }
    
    return <p>Unsupported video type.</p>;
  };

  return renderVideo();
};

export default VideoPlayer; 
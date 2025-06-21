import { Play, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";

declare global {
  interface Window {
    FB: any;
  }
}

const VideoPlayer = ({ video }) => {
  useEffect(() => {
    if (window.FB) {
      window.FB.XFBML.parse();
    }
  }, [video]);

  if (!video) return null;

  const getYoutubeEmbedUrl = (url) => {
    const regExp =
      /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regExp);
    const videoId = match ? match[1] : null;

    if (!videoId) return null;

    const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
    embedUrl.searchParams.set("autoplay", "1");
    embedUrl.searchParams.set("rel", "0");
    if (typeof window !== "undefined") {
      embedUrl.searchParams.set("origin", window.location.origin);
    }
    return embedUrl.toString();
  };

  const renderVideo = () => {
    if (video.video_type === "youtube") {
      const finalEmbedUrl = getYoutubeEmbedUrl(video.video_url);
      if (!finalEmbedUrl) {
        return (
          <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-black text-white">
            <p>Invalid YouTube video URL.</p>
          </div>
        );
      }
      return (
        <div className="relative" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={finalEmbedUrl}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 h-full w-full"
          ></iframe>
        </div>
      );
    }

    if (video.video_type === "facebook") {
      return (
        <div className="flex justify-center">
          <div
            className="fb-video"
            data-href={video.video_url}
            data-width="100%"
            data-allowfullscreen="true"
            data-show-text="false"
            data-lazy="true"
          ></div>
        </div>
      );
    }
    
    return <p>Unsupported video type.</p>;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      {renderVideo()}
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {video.categories && (
            <Badge variant="secondary">{video.categories.name}</Badge>
          )}
          {video.states && (
            <Badge variant="secondary">{video.states.name}</Badge>
          )}
          <Badge variant="default" className="capitalize">
            {video.video_type}
          </Badge>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
          {video.title}
        </h1>
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center">
            <Calendar className="mr-1.5 h-4 w-4" />
            <span>{new Date(video.created_at).toLocaleDateString()}</span>
          </div>
          {video.profiles && (
            <div className="flex items-center">
              <User className="mr-1.5 h-4 w-4" />
              <span>{video.profiles.full_name}</span>
            </div>
          )}
        </div>
        {video.description && (
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {video.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer; 
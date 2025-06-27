import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, ExternalLink, Youtube, Facebook } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface VideoSectionProps {
  videos: any[];
}

export const VideoSection = ({ videos }: VideoSectionProps) => {
  const { t } = useLanguage();

  if (videos.length === 0) return null;

  const getVideoTypeIcon = (videoType: string) => {
    switch (videoType) {
      case 'youtube':
        return <Youtube className="h-4 w-4" />;
      case 'facebook':
        return <Facebook className="h-4 w-4" />;
      default:
        return <Play className="h-4 w-4" />;
    }
  };

  const getVideoTypeColor = (videoType: string) => {
    switch (videoType) {
      case 'youtube':
        return 'bg-red-600 hover:bg-red-700';
      case 'facebook':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-black dark:text-white mb-2 inline-block relative">
          {t('latest_videos')}
          <span className="block h-1 bg-red-600 rounded-full mt-1 w-full" style={{ maxWidth: '100%' }} />
        </h2>
        <Link
          to="/videos"
          className="text-red-600 hover:text-red-700 font-medium"
        >
          {t('view_all')}
        </Link>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {videos.slice(0, 6).map((video) => (
          <Link key={video.id} to={`/video/${video.id}`} className="block focus:outline-none focus:ring-2 focus:ring-red-600 rounded-lg">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden">
              <CardContent className="flex-1 flex flex-col p-0">
                <div className="relative">
                  {video.thumbnail_url && (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <div className={`rounded-full p-3 ${getVideoTypeColor(video.video_type)}`}>
                      {getVideoTypeIcon(video.video_type)}
                    </div>
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge className={`${video.video_type === 'youtube' ? 'bg-red-600' : 'bg-blue-600'} text-white`}>
                      {video.video_type === 'youtube' ? 'YouTube' : 'Facebook'}
                    </Badge>
                  </div>
                  <div className="absolute top-2 right-2">
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); window.open(video.video_url, '_blank', 'noopener,noreferrer'); }}
                      className="bg-white bg-opacity-80 rounded-full p-1 hover:bg-opacity-100 transition-all"
                      aria-label="Open external video"
                    >
                      <ExternalLink className="h-4 w-4 text-gray-700" />
                    </button>
                  </div>
                </div>
                <div className="p-4 space-y-2 flex-1 flex flex-col">
                  <h3 className="font-semibold line-clamp-2">{video.title}</h3>
                  <span className="block text-xs text-gray-500 mt-1 sm:hidden">{new Date(video.created_at).toLocaleDateString()}</span>
                  {video.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 hidden sm:block">{video.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500 mt-1 sm:mt-0">
                    <span>{video.categories?.name || 'Video'}</span>
                    <span className="hidden sm:inline">{new Date(video.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

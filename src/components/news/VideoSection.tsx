import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const VideoSection = () => {
  const { t } = useLanguage();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      const { data } = await supabase.from('videos').select('*').order('created_at', { ascending: false }).limit(6);
      setVideos(data || []);
      setLoading(false);
    };
    fetchVideos();
  }, []);

  if (loading) {
    return <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse mb-6" />;
  }
  if (videos.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center mb-6">
        <h2 className="text-2xl font-semibold text-black dark:text-white mb-2 inline-block relative">
          {t('latest_videos')}
          <span className="block h-1 bg-red-600 rounded-full mt-1 w-full" style={{ maxWidth: '100%' }} />
        </h2>
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

export default VideoSection;

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Radio, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

function getEmbedUrl(url: string): string {
  if (!url) return '';
  // Facebook
  if (url.includes('facebook.com')) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=1280&autoplay=0`;
  }
  // YouTube
  try {
    const urlObj = new URL(url);
    let videoId: string | null = null;
    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.substring(1);
    } else if (urlObj.hostname.includes('youtube.com')) {
      if (urlObj.pathname.startsWith('/embed/')) {
        const embedUrl = new URL(url);
        embedUrl.searchParams.set('autoplay', '0');
        embedUrl.searchParams.delete('mute');
        return embedUrl.toString();
      }
      if (urlObj.pathname.startsWith('/live/')) {
        videoId = urlObj.pathname.split('/live/')[1];
      } else if (urlObj.pathname.startsWith('/shorts/')) {
        videoId = urlObj.pathname.split('/shorts/')[1];
      } else {
        videoId = urlObj.searchParams.get('v');
      }
    }
    if (videoId) {
      const videoIdClean = videoId.split('?')[0];
      const embedUrl = new URL(`https://www.youtube.com/embed/${videoIdClean}`);
      embedUrl.searchParams.set('autoplay', '0');
      embedUrl.searchParams.delete('mute');
      embedUrl.searchParams.set('rel', '0');
      urlObj.searchParams.forEach((value, key) => {
        if (key !== 'v') {
          embedUrl.searchParams.set(key, value);
        }
      });
      return embedUrl.toString();
    }
  } catch (e) {}
  return url;
}

function isYoutubeOrFacebookUrl(url: string): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return (
      u.hostname.includes('youtube.com') ||
      u.hostname === 'youtu.be' ||
      u.hostname.includes('facebook.com')
    );
  } catch {
    return false;
  }
}

export const LiveStreamSection = ({ streams: propStreams, loading: propLoading }: { streams?: any[], loading?: boolean }) => {
  const { t } = useLanguage();
  const [streams, setStreams] = useState<any[]>(propStreams || []);
  const [loading, setLoading] = useState(propLoading ?? (propStreams ? false : true));

  useEffect(() => {
    if (propStreams) {
      setStreams(propStreams);
      setLoading(!!propLoading);
      return;
    }
    const fetchStreams = async () => {
      setLoading(true);
      const { data } = await import('@/integrations/supabase/client').then(m => m.supabase.from('live_streams').select('*').eq('is_active', true));
      setStreams(data || []);
      setLoading(false);
    };
    fetchStreams();
  }, [propStreams, propLoading]);

  if (loading) {
    return <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse mb-6" />;
  }
  if (!streams || streams.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-black dark:text-white mb-2 inline-block relative">
          <Radio className="h-6 w-6 text-black dark:text-white mr-2 inline-block" />
          {t('live.now')}
          <span className="block h-1 bg-red-600 rounded-full mt-1 w-full" style={{ maxWidth: '100%' }} />
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
        {streams.map((stream) => (
          <Link to={`/live/${stream.id}`} key={stream.id} className="block">
            <Card className="rounded-xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow h-full bg-white dark:bg-gray-900">
              <CardContent className="p-2 md:p-4">
                <div className="relative rounded-lg overflow-hidden mb-2">
                  {stream.stream_url && isYoutubeOrFacebookUrl(stream.stream_url) ? (
                    <div className="w-full aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden">
                      <iframe
                        src={getEmbedUrl(stream.stream_url)}
                        title={stream.title}
                        className="w-full h-full min-h-[120px] md:min-h-[180px] rounded-lg"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        frameBorder="0"
                      ></iframe>
                    </div>
                  ) : stream.thumbnail_url ? (
                    <img
                      src={stream.thumbnail_url}
                      alt={stream.title}
                      className="w-full h-28 md:h-48 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-28 md:h-48 bg-gray-100 dark:bg-gray-900 flex items-center justify-center rounded-lg">
                      <Radio className="h-8 w-8 md:h-12 md:w-12 text-black dark:text-white" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-black text-white animate-pulse text-xs px-2 py-1 rounded-full">
                      <Radio className="h-3 w-3 mr-1" />
                      {t('live.badge')}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-base md:text-lg line-clamp-2 text-black dark:text-white">{stream.title}</h3>
                  {stream.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm line-clamp-2">{stream.description}</p>
                  )}
                  <div className="flex items-center justify-between pt-1 md:pt-2">
                    <span className="text-xs md:text-sm text-gray-500">
                      Started: {new Date(stream.created_at).toLocaleTimeString()}
                    </span>
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

export default LiveStreamSection;

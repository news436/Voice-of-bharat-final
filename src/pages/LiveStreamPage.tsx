import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Radio, Calendar, Tag, List } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { RelatedContent } from '@/components/news/RelatedContent';
import { AdSlot } from '@/components/news/AdSlot';

const LiveStreamPage = () => {
  const { id } = useParams();
  const [stream, setStream] = useState<any>(null);
  const [relatedStreams, setRelatedStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { language, t } = useLanguage();

  useEffect(() => {
    const fetchStream = async () => {
      if (!id) return;
      setLoading(true);
      
      const { data, error } = await supabase
        .from('live_streams')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching stream:', error);
        setError(t('live.stream_not_found'));
        setStream(null);
      } else {
        setStream(data);
        fetchRelated(data.id);
      }
      setLoading(false);
    };

    const fetchRelated = async (currentId: string) => {
        const { data, error } = await supabase
          .from('live_streams')
          .select('*')
          .eq('is_active', true)
          .neq('id', currentId)
          .limit(3);
  
        if (error) {
          console.error('Error fetching related streams:', error);
        } else {
          setRelatedStreams(data || []);
        }
      };

    fetchStream();
  }, [id, t]);

  if (loading) {
    return (
        <div className="flex-1 flex items-center justify-center p-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
        <p className="text-gray-500 mb-6">{t('live.stream_discontinued')}</p>
        <Link to="/live">
          <Button>{t('live.back_to_live')}</Button>
        </Link>
      </div>
    );
  }

  if (!stream) return null;

  const title = language === 'hi' && stream.title_hi ? stream.title_hi : stream.title;
  const description = language === 'hi' && stream.description_hi ? stream.description_hi : stream.description;

  const getEmbedUrl = (url: string): string => {
    if (!url) return '';
    
    // Facebook
    if (url.includes('facebook.com')) {
      const embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=1280&autoplay=1`;
      return embedUrl;
    }

    // YouTube
    try {
      const urlObj = new URL(url);
      let videoId: string | null = null;

      if (urlObj.hostname === 'youtu.be') {
        videoId = urlObj.pathname.substring(1);
      } else if (urlObj.hostname.includes('youtube.com')) {
        if (urlObj.pathname.startsWith('/embed/')) {
          // Already an embed link, add autoplay parameter
          const embedUrl = new URL(url);
          embedUrl.searchParams.set('autoplay', '1');
          embedUrl.searchParams.set('mute', '0'); // Enable sound
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
        
        // Add autoplay parameters
        embedUrl.searchParams.set('autoplay', '1');
        embedUrl.searchParams.set('mute', '0'); // Enable sound
        embedUrl.searchParams.set('rel', '0');
        
        // Copy other parameters from original URL
        urlObj.searchParams.forEach((value, key) => {
            if (key !== 'v') {
                embedUrl.searchParams.set(key, value);
            }
        });
        
        return embedUrl.toString();
      }
    } catch (e) {
      console.error("Could not parse stream URL:", e);
    }
    
    return url;
  };

  const embedUrl = getEmbedUrl(stream.stream_url);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-200 dark:from-black dark:to-gray-900 min-h-screen">
      <main className="container mx-auto px-2 sm:px-6 py-8">
        {/* Ad Slot 5 - Live stream pages top banner */}
        <div className="mb-6">
          <AdSlot slotNumber={5} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="overflow-hidden rounded-3xl shadow-2xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
              <CardContent className="p-0">
                <div className="relative">
                  <AspectRatio ratio={16 / 9}>
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        title={title}
                        className="w-full h-full rounded-t-3xl"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        frameBorder="0"
                      ></iframe>
                    ) : (
                      <div className="w-full h-full bg-black flex items-center justify-center rounded-t-3xl">
                        <p className="text-white text-lg">{t('live.invalid_url')}</p>
                      </div>
                    )}
                    {/* Animated LIVE badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <Badge className="bg-red-600 text-white animate-pulse px-4 py-2 text-lg font-bold shadow-lg rounded-full">
                        <Radio className="h-4 w-4 mr-2 animate-pulse" /> LIVE
                      </Badge>
                    </div>
                  </AspectRatio>
                </div>
                {/* Info section with glassmorphic/gradient background */}
                <div className="p-8 bg-gradient-to-r from-white/80 via-red-50/80 to-white/80 dark:from-gray-900/80 dark:via-red-900/40 dark:to-gray-900/80 backdrop-blur-md rounded-b-3xl">
                  <h1 className="text-3xl md:text-4xl font-extrabold mb-3 text-black dark:text-white flex items-center gap-3">
                    <span className="inline-block w-2 h-8 bg-red-600 rounded-full" />
                    {title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-base text-gray-700 dark:text-gray-300 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      <span>{t('live.started_at')} {new Date(stream.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-5 w-5" />
                      <span>{stream.stream_url?.includes('youtube') ? 'YouTube' : stream.stream_url?.includes('facebook') ? 'Facebook' : 'Live'}</span>
                    </div>
                  </div>
                  <p className="text-lg text-gray-700 dark:text-gray-200 whitespace-pre-wrap mb-2">{description}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1 space-y-6">
            {/* Ad Slot 6 - Live stream pages sidebar */}
            <div>
              <AdSlot slotNumber={6} />
            </div>
            <RelatedContent 
              title={t('live.related_streams')} 
              items={relatedStreams} 
              linkPrefix="/live"
              icon={<List className="h-5 w-5 mr-2" />}
            />
          </div>
        </div>
        {/* Ad Slot 7 - Live stream pages bottom banner */}
        <div className="mt-8">
          <AdSlot slotNumber={7} />
        </div>
      </main>
    </div>
  );
};

export default LiveStreamPage; 
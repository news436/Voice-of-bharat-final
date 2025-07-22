import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Radio, Calendar, Tag, List, Share2, Copy, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { RelatedContent } from '@/components/news/RelatedContent';
import { AdSlot } from '@/components/news/AdSlot';
import { toast } from '@/hooks/use-toast';
import { updateMetaTags, resetMetaTags } from '@/utils/metaTags';
import { generateLiveShortPreviewUrl, generateLiveSocialShareTextWithShortPreview, getShortDescription, generateCustomLiveWhatsAppShareText } from '@/utils/urlShortener';

const LiveStreamPage = () => {
  const { id } = useParams();
  const [stream, setStream] = useState<any>(null);
  const [relatedStreams, setRelatedStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { language, t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [facebookUrl, setFacebookUrl] = useState('');

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
        // Set meta tags for this live stream
        if (data) {
          const title = language === 'hi' && data.title_hi ? data.title_hi : data.title;
          const description = language === 'hi' && data.description_hi ? data.description_hi : data.description;
          const image = data.thumbnail_url || data.featured_image_url || `${window.location.origin}/logo.png`;
          const url = window.location.href;
          updateMetaTags({
            title: `${title} - Voice of Bharat`,
            description: description || 'Live stream from Voice of Bharat',
            image: image,
            url: url,
            type: 'video.live',
            siteName: 'Voice of Bharat',
            twitterHandle: '@voiceofbharat',
            author: 'Voice of Bharat',
            publishedTime: data.created_at,
            section: 'Live Streams',
            tags: ['Live', 'Stream']
          });
        }
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
    return () => {
      resetMetaTags();
    };
  }, [id, t, language]);

  // Share functions
  const getLiveShareTitle = () => language === 'hi' && stream.title_hi ? stream.title_hi : stream.title;
  const getLiveShareUrl = () => generateLiveShortPreviewUrl(stream.id);
  const getLiveShareText = (platform: 'whatsapp' | 'twitter' | 'instagram' | 'facebook' = 'whatsapp') => generateLiveSocialShareTextWithShortPreview(getLiveShareTitle(), stream.id, platform);

  const copyStreamLink = async () => {
    if (!stream?.id) return;
    try {
      const shareMessage = generateCustomLiveWhatsAppShareText(
        stream?.title || '',
        stream?.id || '',
        getShortDescription(language === 'hi' && stream?.description_hi ? stream.description_hi : stream?.description || ''),
        facebookUrl
      );
      await navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      toast({
        title: "Message copied!",
        description: "Share message has been copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
      setShowShareDropdown(false);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the message manually.",
        variant: "destructive",
      });
    }
  };

  const shareOnWhatsApp = async () => {
    if (!stream?.id) return;
    try {
      const shareMessage = generateCustomLiveWhatsAppShareText(
        stream?.title || '',
        stream?.id || '',
        getShortDescription(language === 'hi' && stream?.description_hi ? stream.description_hi : stream?.description || ''),
        facebookUrl
      );
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
      window.open(whatsappUrl, '_blank');
      setShowShareDropdown(false);
    } catch (err) {
      toast({
        title: "Failed to share",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const shareOnFacebook = async () => {
    if (!stream?.id) return;
    try {
      const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getLiveShareUrl())}`;
      await navigator.clipboard.writeText(getLiveShareText('facebook'));
      window.open(facebookShareUrl, '_blank', 'width=600,height=400');
      setShowShareDropdown(false);
    } catch (err) {
      toast({
        title: "Failed to share",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const shareOnTwitter = async () => {
    if (!stream?.id) return;
    try {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(getLiveShareText('twitter'))}`;
      window.open(twitterUrl, '_blank', 'width=600,height=400');
      setShowShareDropdown(false);
    } catch (err) {
      toast({
        title: "Failed to share",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const shareOnInstagram = async () => {
    if (!stream?.id) return;
    try {
      await navigator.clipboard.writeText(getLiveShareText('instagram'));
      toast({
        title: "Ready for Instagram!",
        description: "Share message copied to clipboard. You can now paste this in your Instagram story or post.",
      });
      setShowShareDropdown(false);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the message manually for Instagram sharing.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!stream?.id) return;
    if (navigator.share) {
      try {
        await navigator.share({
          text: getLiveShareText(),
        });
      } catch (err) {
        setShowShareDropdown(!showShareDropdown);
      }
    } else {
      setShowShareDropdown(!showShareDropdown);
    }
  };

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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex flex-wrap items-center gap-4 text-base text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        <span>{t('live.started_at')} {new Date(stream.created_at).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-5 w-5" />
                        <span>{stream.stream_url?.includes('youtube') ? 'YouTube' : stream.stream_url?.includes('facebook') ? 'Facebook' : 'Live'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2" 
                        onClick={copyStreamLink}
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        {copied ? 'Copied!' : 'Copy Link'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="p-2 text-green-600 hover:text-green-700 border-green-200 hover:border-green-300" 
                        onClick={shareOnWhatsApp}
                        title="Share on WhatsApp"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.151-.174.2-.298.3-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.1 3.2 5.077 4.363.71.306 1.263.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                        </svg>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="p-2 text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300" 
                        onClick={shareOnFacebook}
                        title="Share on Facebook"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="p-2 text-blue-400 hover:text-blue-500 border-blue-200 hover:border-blue-300" 
                        onClick={shareOnTwitter}
                        title="Share on Twitter"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 1200 1227" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1199.61 0H950.684L599.805 439.228L249.316 0H0L492.228 617.228L0 1227H249.316L599.805 787.772L950.684 1227H1200L707.772 609.772L1199.61 0ZM299.684 111.684H400.684L599.805 367.772L799.316 111.684H900.316L599.805 509.772L299.684 111.684ZM299.684 1115.32L599.805 717.228L900.316 1115.32H799.316L599.805 859.228L400.684 1115.32H299.684Z" />
                        </svg>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="p-2 text-pink-500 hover:text-pink-600 border-pink-200 hover:border-pink-300" 
                        onClick={shareOnInstagram}
                        title="Share on Instagram"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.241-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.775.131 4.602.425 3.635 1.392 2.668 2.359 2.374 3.532 2.315 4.808.013 8.332 0 8.741 0 12c0 3.259.013 3.668.072 4.948.059 1.277.353 2.45 1.32 3.417.967.967 2.14 1.261 3.417 1.32C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.277-.059 2.45-.353 3.417-1.32.967-.967 1.261-2.14 1.32-3.417.059-1.28.072-1.689.072-4.948 0-3.259-.013-3.668-.072-4.948-.059-1.277-.353-2.45-1.32-3.417-.967-.967-2.14-1.261-3.417-1.32C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                        </svg>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="p-2 text-gray-600 hover:text-gray-800 border-gray-200 hover:border-gray-300" 
                        onClick={handleShare}
                        title="More share options"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
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
        <div className="my-8 flex flex-col items-center gap-6">
          <AdSlot slotNumber={8} />
          <AdSlot slotNumber={9} />
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
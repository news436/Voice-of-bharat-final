import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import VideoPlayer from "@/components/news/VideoPlayer";
import { Button } from "@/components/ui/button";
import { AdSlot } from "@/components/news/AdSlot";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { List, Video } from "lucide-react";
import { Calendar, Tag } from "lucide-react";
import { toast } from '@/hooks/use-toast';
import {
  copyToClipboard,
  generateVideoPreviewUrl,
  generateVideoShortPreviewUrl,
  generateVideoSocialShareTextWithShortPreview,
  shareToWhatsAppWithVideoShortPreview,
  fetchFacebookUrl,
  getShortDescription,
  generateVideoShareMessage,
} from '@/utils/urlShortener';
import { Check, Copy } from 'lucide-react';

const VideoPage = () => {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<any | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();
  const [facebookUrl, setFacebookUrl] = useState('');

  const VIDEO_FILTERS = [
    { label: t("all"), value: "all" },
    { label: t("featured"), value: "featured" },
  ];
  const VIDEO_SORTS = [
    { label: t("latest"), value: "latest" },
    { label: t("oldest"), value: "oldest" },
  ];

  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("latest");
  const [copied, setCopied] = useState(false);
  const [showShareDropdown, setShowShareDropdown] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setVideo(null); // Reset video state on new fetch

      if (id) {
        // Fetch single video
        const { data: videoData, error } = await supabase
          .from("videos")
          .select("*, categories(*), states(*)")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching video:", error);
        }
        setVideo(videoData);

        // Fetch related videos (latest 5, excluding current)
        const { data: relatedData } = await supabase
          .from("videos")
          .select("*, categories(*)")
          .neq("id", id)
          .order("created_at", { ascending: false })
          .limit(5);
        setRelatedVideos(relatedData || []);
      } else {
        // Fetch all videos with filter and sort
        let query = supabase.from("videos").select("*, categories(*)");
        if (filter === "featured") query = query.eq("is_featured", true);
        query = query.order("created_at", { ascending: sort === "oldest" });
        const { data: vids } = await query;
        setVideos(vids || []);
      }
      setLoading(false);
    };
    fetchData();
    fetchFacebookUrl().then(setFacebookUrl);
  }, [id, filter, sort]);

  const shortDescription = getShortDescription(language === 'hi' && video?.description_hi ? video.description_hi : video?.description || '');
  const previewUrl = video?.id ? generateVideoShortPreviewUrl(video.id) : '';
  const shareMessage = generateVideoShareMessage(shortDescription, previewUrl, facebookUrl);

  // --- Share Functions (video-specific, robust) ---
  const copyVideoLink = async () => {
    if (!video?.id) return;
    try {
      await copyToClipboard(shareMessage);
      setCopied(true);
      toast({
        title: 'Message copied!',
        description: 'Share message has been copied to clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
      setShowShareDropdown(false);
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the message manually.',
        variant: 'destructive',
      });
    }
  };

  const shareOnWhatsApp = async () => {
    if (!video?.id) return;
    try {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
      window.open(whatsappUrl, '_blank');
      setShowShareDropdown(false);
    } catch (err) {
      toast({
        title: 'Failed to share',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const shareOnFacebook = async () => {
    if (!video?.id) return;
    try {
      const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(previewUrl)}`;
      await copyToClipboard(shareMessage);
      window.open(facebookShareUrl, '_blank', 'width=600,height=400');
      setShowShareDropdown(false);
    } catch (err) {
      toast({
        title: 'Failed to share',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const shareOnTwitter = async () => {
    if (!video?.id) return;
    try {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`;
      window.open(twitterUrl, '_blank', 'width=600,height=400');
      setShowShareDropdown(false);
    } catch (err) {
      toast({
        title: 'Failed to share',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const shareOnInstagram = async () => {
    if (!video?.id) return;
    try {
      await copyToClipboard(shareMessage);
      toast({
        title: 'Ready for Instagram!',
        description: 'Share message copied to clipboard. You can now paste this in your Instagram story or post.',
      });
      setShowShareDropdown(false);
    } catch (err) {
      toast({
        title: 'Copy failed',
        description: 'Please copy the message manually for Instagram sharing.',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async () => {
    if (!video?.id) return;
    if (navigator.share) {
      try {
        await navigator.share({
          text: shareMessage,
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
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-red-600"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading videos...</p>
        </div>
      </div>
    );
  }

  // Single Video View
  if (id) {
    if (!video) {
      return (
        <main className="container mx-auto flex-grow px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">Video not found</h1>
          <p className="text-muted-foreground">
            The video you are looking for might have been moved or deleted.
          </p>
          <Button asChild className="mt-4">
            <Link to="/videos">Browse all videos</Link>
          </Button>
        </main>
      );
    }

    // Modern, LiveStreamPage-like layout
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-200 dark:from-black dark:to-gray-900 min-h-screen">
        <main className="container mx-auto px-2 sm:px-6 py-8">
          {/* Ad Slot 5 - Video pages top banner */}
          <div className="mb-6">
            <AdSlot slotNumber={5} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="overflow-hidden rounded-3xl shadow-2xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
                <CardContent className="p-0">
                  <div className="relative min-h-[240px] md:min-h-[420px] lg:min-h-[520px]">
                    <AspectRatio ratio={16 / 9} className="w-full h-full">
                      <VideoPlayer video={video} />
                    </AspectRatio>
                  </div>
                  {/* Info section with glassmorphic/gradient background */}
                  <div className="p-4 md:p-8 bg-gradient-to-r from-white/80 via-red-50/80 to-white/80 dark:from-gray-900/80 dark:via-red-900/40 dark:to-gray-900/80 backdrop-blur-md rounded-b-3xl">
                    <h1 className="text-2xl md:text-4xl font-extrabold mb-3 text-black dark:text-white flex items-center gap-3">
                      <span className="inline-block w-2 h-8 bg-red-600 rounded-full" />
                      {language === 'hi' && video.title_hi ? video.title_hi : video.title}
                    </h1>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        <span>{new Date(video.created_at).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-5 w-5"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A2 2 0 0020 6.382V5.618a2 2 0 00-1.447-1.894L15 2.382M9 10L4.447 7.724A2 2 0 014 5.618V4.382a2 2 0 011.447-1.894L9 2.382m6 7.618V21m-6-11.618V21" /></svg></span>
                        <span className="capitalize">{video.video_type}</span>
                      </div>
                      {video.categories?.name && (
                        <div className="flex items-center gap-2">
                          <span className="h-5 w-5"><Tag className="h-5 w-5" /></span>
                          <span>{video.categories.name}</span>
                        </div>
                      )}
                      {video.states?.name && (
                        <div className="flex items-center gap-2">
                          <span className="h-5 w-5"><Tag className="h-5 w-5" /></span>
                          <span>{video.states.name}</span>
                        </div>
                      )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2" 
                          onClick={copyVideoLink}
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
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 5 15.82V15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 5 8.6a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 4.6V5a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 16 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9V9.18A1.65 1.65 0 0 0 21 11c0 .28-.06.55-.17.8A1.65 1.65 0 0 0 21 13c0 .28-.06.55-.17.8z"/></svg>
                        </Button>
                      </div>
                    </div>
                    {(language === 'hi' && video.description_hi ? video.description_hi : video.description) && (
                      <p className="text-base md:text-lg text-gray-700 dark:text-gray-200 whitespace-pre-wrap mb-2">
                        {language === 'hi' && video.description_hi ? video.description_hi : video.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1 space-y-6">
              {/* Ad Slot 6 - Video pages sidebar */}
              <div>
                <AdSlot slotNumber={6} />
              </div>
              {/* Up Next Videos styled like RelatedContent */}
              <Card className="bg-white/90 dark:bg-gray-900/90 shadow-lg border border-gray-200 dark:border-gray-800">
                <CardHeader className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-800">
                  <CardTitle className="flex items-center text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                    <List className="h-5 w-5 mr-2 text-red-600" />
                    {t("up_next")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 md:p-4">
                  <div className="flex flex-col gap-3 md:gap-4">
                    {relatedVideos.length === 0 ? (
                      <div className="flex flex-col items-center justify-center min-h-[100px] text-center rounded-xl bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700">
                        <Video className="w-8 h-8 mb-2 text-gray-400" />
                        <span className="text-base md:text-lg text-gray-500 dark:text-gray-400 font-medium">No videos</span>
                      </div>
                    ) : (
                      relatedVideos.map((video) => {
                        const itemTitle = language === 'hi' && video.title_hi ? video.title_hi : video.title;
                        const itemDesc = language === 'hi' && video.description_hi ? video.description_hi : video.description;
                        const itemLink = `/video/${video.id}`;
                        return (
                          <Link to={itemLink} key={video.id} className="block group focus:outline-none focus:ring-2 focus:ring-red-600 rounded-xl">
                            <div className="rounded-xl shadow bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex flex-row overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1 min-h-[72px] md:min-h-[96px] max-h-[120px]">
                              {/* Image */}
                              {video.thumbnail_url ? (
                                <img
                                  src={video.thumbnail_url}
                                  alt={itemTitle}
                                  className="w-20 md:w-28 h-20 md:h-28 object-cover rounded-l-xl group-hover:scale-105 transition-transform duration-300 flex-shrink-0"
                                />
                              ) : (
                                <div className="w-20 md:w-28 h-20 md:h-28 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center flex-shrink-0 rounded-l-xl">
                                  <span className="text-2xl md:text-4xl text-gray-500 dark:text-gray-400">🎬</span>
                                </div>
                              )}
                              {/* Content */}
                              <div className="p-2 md:p-4 flex-1 flex flex-col justify-center">
                                <h4 className="font-semibold text-sm md:text-base line-clamp-2 text-black dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                  {itemTitle}
                                </h4>
                                {itemDesc && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{itemDesc}</p>
                                )}
                                {video.categories?.name && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{video.categories.name}</p>
                                )}
                              </div>
                            </div>
                          </Link>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          {/* Ad Slot 7 - Video pages bottom banner */}
          <div className="mt-8">
            <AdSlot slotNumber={7} />
          </div>
        </main>
      </div>
    );
  }

  // All Videos View
  return (
    <main className="container mx-auto flex-1 px-4 py-6">
      {/* Ad Slot 5 - Video pages top banner */}
      <div className="mb-6">
        <AdSlot slotNumber={5} />
      </div>
      
      <h1 className="mb-8 text-3xl font-bold text-red-600">
        {t("all_videos")}
      </h1>
      <div className="mb-8 flex flex-wrap justify-end gap-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder={t("filter")} />
          </SelectTrigger>
          <SelectContent>
            {VIDEO_FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder={t("sort")} />
          </SelectTrigger>
          <SelectContent>
            {VIDEO_SORTS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <Card
            key={video.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
          >
            <CardContent className="p-4">
              <Link to={`/video/${video.id}`}>
                {video.thumbnail_url && (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="font-semibold line-clamp-2 mb-2">
                  {video.title}
                </h3>
                <div className="text-xs text-gray-500 mb-2">
                  {new Date(video.created_at).toLocaleDateString()}
                </div>
                {video.description && (
                  <p className="text-gray-700 text-sm line-clamp-2">
                    {video.description}
                  </p>
                )}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Ad Slot 7 - Video pages bottom banner */}
      <div className="mt-8">
        <AdSlot slotNumber={7} />
      </div>
    </main>
  );
};

export default VideoPage; 
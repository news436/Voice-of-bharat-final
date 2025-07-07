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

const VideoPage = () => {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<any | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

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
  }, [id, filter, sort]);

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
                    <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
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
                                  className="w-20 md:w-32 h-full object-cover group-hover:scale-105 transition-transform duration-300 flex-shrink-0"
                                />
                              ) : (
                                <div className="w-20 md:w-32 h-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center flex-shrink-0">
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
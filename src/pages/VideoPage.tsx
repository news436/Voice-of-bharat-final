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

const VideoPage = () => {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<any | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

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

    return (
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <VideoPlayer video={video} />
          </div>
          <aside>
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
              {t("up_next")}
            </h2>
            <div className="space-y-4">
              {relatedVideos.map((relatedVideo) => (
                <Link
                  key={relatedVideo.id}
                  to={`/video/${relatedVideo.id}`}
                  className="block"
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="flex items-center gap-4 p-3">
                      <img
                        src={relatedVideo.thumbnail_url}
                        alt={relatedVideo.title}
                        className="h-20 w-32 rounded-md object-cover"
                      />
                      <div>
                        <h3 className="line-clamp-2 font-semibold">
                          {relatedVideo.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {relatedVideo.categories?.name}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </main>
    );
  }

  // All Videos View
  return (
    <main className="container mx-auto flex-1 px-4 py-6">
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
                {" "}
                {/* Link to individual video page if needed */}
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
    </main>
  );
};

export default VideoPage; 
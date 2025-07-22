import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import {
  ArrowUpRight,
  Newspaper,
  Video,
  Radio,
  TrendingUp,
  Activity,
  Tags,
  BookOpen,
  Star,
  Tv,
  Rss,
} from "lucide-react";
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { AboutUsManager } from './AboutUsManager';

type AdminSection = "articles" | "categories" | "analytics";

export const AdminDashboard = ({
  onQuickAction,
  userProfile,
}: {
  onQuickAction?: (section: AdminSection) => void;
  userProfile?: any;
}) => {
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    breakingNews: 0,
    totalVideos: 0,
    activeStreams: 0,
  });
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewsStats, setViewsStats] = useState<{ totalViews: number, articles: any[] }>({ totalViews: 0, articles: [] });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch total article count
        const { count: totalArticles } = await supabase
          .from('articles')
          .select('*', { count: 'exact', head: true });
        // Fetch all article statuses for accurate published/draft counts
        const { data: allArticles } = await supabase.from('articles').select('status');
        const publishedArticles = allArticles ? allArticles.filter((a: any) => a.status === 'published').length : 0;
        const draftArticles = allArticles ? allArticles.filter((a: any) => a.status === 'draft').length : 0;
        // Fetch articles for stats (latest 100 for breakdowns)
        const articlesResponse = await supabase.from('articles').select('*').limit(100);
        const articles = articlesResponse.data || [];
        
        // Fetch videos for stats
        const videosResponse = await supabase.from('videos').select('*');
        const videos = videosResponse.data || [];
        
        // Fetch live streams for stats
        const streamsResponse = await supabase.from('live_streams').select('*').eq('is_active', true);
        const streams = streamsResponse.data || [];
        
        // Fetch views stats
        const viewsResponse = await supabase.from('analytics').select('*');
        if (viewsResponse.data) {
          setViewsStats({ totalViews: viewsResponse.data.length, articles: viewsResponse.data });
        }
        
        const breakingNews = articles.filter((a: any) => a.is_breaking).length;
        const totalVideos = videos.length;
        const activeStreams = streams.length;

        setStats(prev => ({ 
          ...prev, 
          totalArticles: totalArticles || 0, 
          publishedArticles, 
          draftArticles, 
          breakingNews, 
          totalVideos, 
          activeStreams 
        }));

        // Fetch recent articles
        const recentResponse = await supabase
          .from('articles')
          .select('*, profiles:author_id(full_name), categories:category_id(name)')
          .order('created_at', { ascending: false })
          .limit(5);
        if (recentResponse.data) {
          setRecentArticles(recentResponse.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const publishedPercentage = stats.totalArticles > 0 ? (stats.publishedArticles / stats.totalArticles) * 100 : 0;

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <style>
        {`
          @media (min-width: 640px) {
            .sm\\:p-0 {
              padding: 5px;
            }
          }
        `}
      </style>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <h1 className="text-lg font-semibold md:text-2xl">Admin Dashboard</h1>
        </header>
    <main className="flex flex-1 flex-col gap-8 p-4 md:p-10 bg-gray-50/50">
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {userProfile?.full_name?.split(' ')[0] || 'Admin'}!
        </h1>
        <p className="text-muted-foreground mt-1">Here's a quick overview of your platform's activity.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 px-6">
        {/* Card 1: Total Articles */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-lg rounded-xl flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              Total Articles <BookOpen className="h-5 w-5 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold">{stats.totalArticles}</div>
            <p className="text-xs text-gray-300">{`${stats.publishedArticles} Published / ${stats.draftArticles} Drafts`}</p>
          </CardContent>
        </Card>

        {/* Card 2: Breaking News */}
        <Card className="bg-white shadow-sm rounded-xl border border-red-500/50">
           <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm font-medium text-gray-600">
              Breaking News <Star className="h-5 w-5 text-red-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-red-600">{stats.breakingNews}</div>
            <p className="text-xs text-gray-500">Currently active</p>
          </CardContent>
        </Card>

        {/* Card 3: Total Videos */}
        <Card className="bg-white shadow-sm rounded-xl border">
           <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm font-medium text-gray-600">
              Total Videos <Tv className="h-5 w-5 text-indigo-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold">{stats.totalVideos}</div>
            <p className="text-xs text-gray-500">All time video count</p>
          </CardContent>
        </Card>

        {/* Card 4: Live Streams */}
        <Card className="bg-white shadow-sm rounded-xl border">
           <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm font-medium text-gray-600">
              Live Streams <Rss className="h-5 w-5 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold">{stats.activeStreams}</div>
            <p className="text-xs text-gray-500">Currently active streams</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 px-6 pb-6">
        <Card className="lg:col-span-2 rounded-xl bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center">
            <CardTitle className="text-2xl font-bold">Recent Articles</CardTitle>
            {onQuickAction && (
              <Button size="sm" className="ml-auto gap-1 rounded-full bg-black text-white px-4 py-2 hover:bg-gray-800" onClick={() => onQuickAction("articles")}>
                View All <ArrowUpRight className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {/* Mobile View */}
            <div className="md:hidden">
              {recentArticles.map((article) => (
                <div
                  key={article.id}
                  className="border-b p-4 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{article.title}</h3>
                    <Badge
                      variant={
                        article.status === "published" ? "default" : "secondary"
                      }
                      className="capitalize rounded-full px-3 py-1"
                    >
                      {article.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {article.profiles?.full_name || "N/A"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {article.categories?.name || "Uncategorized"}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden lg:table-cell">Author</TableHead>
                    <TableHead className="hidden lg:table-cell">Category</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentArticles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="py-4">
                        <div className="font-medium">{article.title}</div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell py-4">{article.profiles?.full_name || "N/A"}</TableCell>
                      <TableCell className="hidden lg:table-cell py-4">{article.categories?.name || "Uncategorized"}</TableCell>
                      <TableCell className="text-right py-4">
                        <Badge
                          variant={article.status === "published" ? "default" : "secondary"}
                          className="capitalize rounded-full px-3 py-1"
                        >
                          {article.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-xl bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button variant="outline" className="w-full justify-start text-base p-6 rounded-lg border-2" onClick={() => onQuickAction && onQuickAction("articles")}>
              <Newspaper className="mr-3 h-5 w-5" /> New Article
            </Button>
            <Button variant="outline" className="w-full justify-start text-base p-6 rounded-lg border-2" onClick={() => onQuickAction && onQuickAction("categories")}>
              <Tags className="mr-3 h-5 w-5" /> Manage Categories
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
      </div>
    </div>
  );
};

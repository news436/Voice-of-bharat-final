import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, TrendingUp, Clock, Search, ArrowUpRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import apiClient from '@/utils/api';
import { formatDistanceToNow } from 'date-fns';

// Helper function to format numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const ViewsManager = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalViews, setTotalViews] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'views' | 'date'>('views');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    fetchViewsData();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchViewsData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchViewsData = async (pageNum = 1) => {
    if (pageNum === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await apiClient.get('/articles/views/all');
      if (response.success) {
        const sortedArticles = response.articles.sort((a: any, b: any) => 
          sortBy === 'views' ? b.views - a.views : new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
        );

        setTotalViews(response.totalViews);
        if (pageNum === 1) {
          setArticles(sortedArticles);
        } else {
          setArticles(prev => [...prev, ...sortedArticles]);
        }
        setHasMore(sortedArticles.length === ITEMS_PER_PAGE);
      }
    } catch (error) {
      console.error('Error fetching views data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch views data',
        variant: 'destructive',
      });
    } finally {
      if (pageNum === 1) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchViewsData(page + 1);
      setPage(prev => prev + 1);
    }
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-6">
        <h2 className="text-3xl font-bold">Article Views Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Views Card */}
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Total Views</p>
                <h3 className="text-4xl font-bold mt-2">{formatNumber(totalViews)}</h3>
              </div>
              <Eye className="h-12 w-12 text-purple-200" />
            </div>
          </div>

          {/* Most Viewed Article Card */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100">Most Viewed</p>
                <h3 className="text-4xl font-bold mt-2">
                  {formatNumber(articles[0]?.views || 0)}
                </h3>
              </div>
              <TrendingUp className="h-12 w-12 text-emerald-200" />
            </div>
          </div>

          {/* Recent Views Card */}
          <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-rose-100">Last 24 Hours</p>
                <h3 className="text-4xl font-bold mt-2">
                  {formatNumber(articles.reduce((sum, article) => {
                    const viewsLast24h = article.views_last_24h || 0;
                    return sum + viewsLast24h;
                  }, 0))}
                </h3>
              </div>
              <Clock className="h-12 w-12 text-rose-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={sortBy === 'views' ? 'default' : 'outline'}
            onClick={() => setSortBy('views')}
          >
            Most Viewed
          </Button>
          <Button
            variant={sortBy === 'date' ? 'default' : 'outline'}
            onClick={() => setSortBy('date')}
          >
            Latest
          </Button>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <div
            key={article.id}
            className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200"
          >
            {article.featured_image_url && (
              <div className="relative h-48 overflow-hidden">
                <img
                  src={article.featured_image_url}
                  alt={article.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white text-sm">
                    Published {formatDistanceToNow(new Date(article.published_at))} ago
                  </p>
                </div>
              </div>
            )}
            <div className="p-6">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{article.title}</h3>
              <div className="flex items-center justify-between mt-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Views</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatNumber(article.views || 0)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => window.open(`/article/${article.slug}`, '_blank')}
                >
                  <ArrowUpRight className="h-5 w-5" />
                </Button>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>Last 24h</span>
                  <span className="font-medium text-emerald-600">
                    +{formatNumber(article.views_last_24h || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && !isLoading && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            disabled={isLoadingMore}
            className="min-w-[200px]"
          >
            {isLoadingMore ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
                Loading...
              </div>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}; 
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Copy, ExternalLink, BarChart3, Calendar, MousePointer } from 'lucide-react';
import { getShortUrlAnalytics } from '@/utils/urlShortener';
import apiClient from '@/utils/api';

interface ShortUrlData {
  id: string;
  short_id: string;
  article_id: string;
  clicks: number;
  created_at: string;
  updated_at: string;
  articles: {
    id: string;
    title: string;
  };
}

export const UrlShortenerManager = () => {
  const [shortUrls, setShortUrls] = useState<ShortUrlData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalClicks, setTotalClicks] = useState(0);
  const [generating, setGenerating] = useState(false);

  const fetchShortUrls = async (pageNum: number = 1) => {
    try {
      const response = await apiClient.get(`/redirect?page=${pageNum}&limit=20`);
      if (response.success) {
        if (pageNum === 1) {
          setShortUrls(response.data);
        } else {
          setShortUrls(prev => [...prev, ...response.data]);
        }
        
        if (response.data.length < 20) {
          setHasMore(false);
        }
        
        // Calculate total clicks
        const total = response.data.reduce((sum: number, url: ShortUrlData) => sum + url.clicks, 0);
        setTotalClicks(prev => pageNum === 1 ? total : prev + total);
      }
    } catch (error) {
      console.error('Error fetching short URLs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch short URLs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateShortUrlsForAllArticles = async () => {
    setGenerating(true);
    try {
      const response = await apiClient.post('/redirect/generate-all');
      if (response.success) {
        toast({
          title: "Success!",
          description: response.message,
        });
        // Refresh the list
        fetchShortUrls(1);
      } else {
        throw new Error(response.error || 'Failed to generate short URLs');
      }
    } catch (error: any) {
      console.error('Error generating short URLs:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate short URLs",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchShortUrls();
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchShortUrls(nextPage);
  };

  const copyToClipboard = async (shortId: string) => {
    const shortUrl = `https://voiceofbharat.live/${shortId}`;
    try {
      await navigator.clipboard.writeText(shortUrl);
      toast({
        title: "Copied!",
        description: "Short URL copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy manually",
        variant: "destructive",
      });
    }
  };

  const openArticle = (articleId: string) => {
    window.open(`/article/${articleId}`, '_blank');
  };

  const openShortUrl = (shortId: string) => {
    window.open(`https://voiceofbharat.live/${shortId}`, '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredUrls = shortUrls.filter(url =>
    url.short_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    url.articles.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && shortUrls.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Short URLs</p>
                <p className="text-2xl font-bold">{shortUrls.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MousePointer className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold">{totalClicks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Clicks/URL</p>
                <p className="text-2xl font-bold">
                  {shortUrls.length > 0 ? Math.round(totalClicks / shortUrls.length) : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>URL Shortener Management</CardTitle>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="search">Search URLs</Label>
              <Input
                id="search"
                placeholder="Search by short ID or article title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={generateShortUrlsForAllArticles}
                disabled={generating}
                className="bg-green-600 hover:bg-green-700"
              >
                {generating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Generate All
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* URL List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Short URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Article Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUrls.map((url) => (
                  <tr key={url.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="font-mono">
                          {url.short_id}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(url.short_id)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900 dark:text-white truncate max-w-xs">
                          {url.articles.title}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openArticle(url.articles.id)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={url.clicks > 10 ? "default" : "secondary"}>
                        {url.clicks} clicks
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(url.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openShortUrl(url.short_id)}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Test
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUrls.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No short URLs found</p>
            </div>
          )}
          
          {hasMore && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={handleLoadMore}
                variant="outline"
                className="w-full"
              >
                Load More
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 
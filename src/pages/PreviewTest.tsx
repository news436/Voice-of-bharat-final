import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import apiClient from '@/utils/api';
import { generatePreviewUrl } from '@/utils/urlShortener';

const PreviewTest = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await apiClient.getArticles({ limit: 10 });
      if (response.success) {
        setArticles(response.data);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const generatePreview = (article: any) => {
    setSelectedArticle(article);
    const url = generatePreviewUrl(article.id);
    setPreviewUrl(url);
  };

  const testPreview = async () => {
    if (!previewUrl) return;
    
    setLoading(true);
    try {
      const response = await fetch(previewUrl);
      const html = await response.text();
      
      // Check if the HTML contains Open Graph meta tags
      const hasOgTitle = html.includes('og:title');
      const hasOgDescription = html.includes('og:description');
      const hasOgImage = html.includes('og:image');
      const hasOgUrl = html.includes('og:url');
      
      toast({
        title: "Preview Test Results",
        description: `OG Tags: Title=${hasOgTitle}, Description=${hasOgDescription}, Image=${hasOgImage}, URL=${hasOgUrl}`,
      });
      
      // Open preview in new tab
      window.open(previewUrl, '_blank');
    } catch (error) {
      toast({
        title: "Preview Test Failed",
        description: "Could not fetch preview URL",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyPreviewUrl = async () => {
    try {
      await navigator.clipboard.writeText(previewUrl);
      toast({
        title: "URL Copied!",
        description: "Preview URL has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please copy the URL manually",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Social Media Preview Test</h1>
        <p className="text-gray-600">
          Test the dynamic social media preview functionality for articles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Articles List */}
        <Card>
          <CardHeader>
            <CardTitle>Select an Article</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => generatePreview(article)}
                >
                  <h3 className="font-semibold text-lg mb-2">{article.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {article.summary?.substring(0, 100)}...
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>ID: {article.id}</span>
                    <span>•</span>
                    <span>Slug: {article.slug}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Preview URL */}
        <Card>
          <CardHeader>
            <CardTitle>Preview URL</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedArticle ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="preview-url">Generated Preview URL:</Label>
                  <Input
                    id="preview-url"
                    value={previewUrl}
                    readOnly
                    className="mt-1"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={testPreview} disabled={loading}>
                    {loading ? 'Testing...' : 'Test Preview'}
                  </Button>
                  <Button variant="outline" onClick={copyPreviewUrl}>
                    Copy URL
                  </Button>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Selected Article:</h4>
                  <p className="text-sm"><strong>Title:</strong> {selectedArticle.title}</p>
                  <p className="text-sm"><strong>Summary:</strong> {selectedArticle.summary}</p>
                  <p className="text-sm"><strong>Image:</strong> {selectedArticle.featured_image_url ? 'Yes' : 'No'}</p>
                  <p className="text-sm"><strong>Category:</strong> {selectedArticle.categories?.name || 'N/A'}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Select an article to generate a preview URL</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How to Test</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Select an article from the list above</li>
            <li>Click "Test Preview" to open the preview URL in a new tab</li>
            <li>Copy the preview URL and test it on social media platforms:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>WhatsApp: Paste the URL in a chat</li>
                <li>Facebook: Use the Facebook Debugger tool</li>
                <li>Twitter: Paste the URL in a tweet</li>
              </ul>
            </li>
            <li>Check if the preview shows the correct title, description, and image</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default PreviewTest; 
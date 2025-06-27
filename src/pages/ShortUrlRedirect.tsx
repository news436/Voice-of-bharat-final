import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://voice-of-bharat-api.onrender.com/api';

const ShortUrlRedirect = () => {
  const { shortId } = useParams<{ shortId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const redirectToArticle = async () => {
      if (!shortId || shortId.length !== 6) {
        setError('Invalid short URL');
        setLoading(false);
        return;
      }

      try {
        // Call the backend redirect API
        const response = await fetch(`${API_BASE_URL}/redirect/${shortId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.redirectUrl) {
            // Extract the article ID from the redirect URL
            const urlParts = data.redirectUrl.split('/');
            const articleId = urlParts[urlParts.length - 1];
            
            // Navigate to the article page
            navigate(`/article/id/${articleId}`, { replace: true });
            return;
          }
        }

        // If redirect failed, show error
        setError('Short URL not found or invalid');
        setLoading(false);
      } catch (err) {
        console.error('Error redirecting short URL:', err);
        setError('Failed to redirect. Please try again.');
        setLoading(false);
      }
    };

    redirectToArticle();
  }, [shortId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
            <p className="text-muted-foreground">Please wait while we redirect you to the article.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <ExternalLink className="h-12 w-12 mx-auto text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Redirect Failed</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go to Homepage
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default ShortUrlRedirect; 
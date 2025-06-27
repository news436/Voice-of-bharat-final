import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://voice-of-bharat-api.onrender.com/api';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCheckingShortUrl, setIsCheckingShortUrl] = useState(false);
  const [shortUrlError, setShortUrlError] = useState<string | null>(null);

  useEffect(() => {
    const checkShortUrl = async () => {
      // Check if the pathname looks like a short URL (6 characters, alphanumeric)
      const pathname = location.pathname.slice(1); // Remove leading slash
      
      if (pathname.length === 6 && /^[a-zA-Z0-9]{6}$/.test(pathname)) {
        console.log('🔗 Checking if pathname is a short URL:', pathname);
        setIsCheckingShortUrl(true);
        
        try {
          // Try to get article info from the short URL
          const response = await fetch(`${API_BASE_URL}/redirect/${pathname}/analytics`);
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data && data.data.article_id) {
              console.log('📰 Found article for short URL:', data.data.article_id);
              navigate(`/article/id/${data.data.article_id}`, { replace: true });
              return;
            }
          }
          
          setShortUrlError('Short URL not found');
        } catch (error) {
          console.error('Error checking short URL:', error);
          setShortUrlError('Failed to check short URL');
        } finally {
          setIsCheckingShortUrl(false);
        }
      } else {
        console.error(
          "404 Error: User attempted to access non-existent route:",
          location.pathname
        );
      }
    };

    checkShortUrl();
  }, [location.pathname, navigate]);

  if (isCheckingShortUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-md mx-auto">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Redirecting...</h1>
            <p className="text-gray-600 dark:text-gray-400">Taking you to the article</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-md mx-auto">
          <div className="text-6xl mb-4">🔗</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {shortUrlError ? 'Short URL Not Found' : '404 - Page Not Found'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {shortUrlError 
              ? 'The short URL you\'re looking for doesn\'t exist or may have expired.'
              : 'The page you\'re looking for doesn\'t exist.'
            }
          </p>
          <Button asChild className="bg-red-600 hover:bg-red-700">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

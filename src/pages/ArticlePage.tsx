import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, ArrowLeft, Share2, Bookmark, Copy, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdSlot } from '@/components/news/AdSlot';
import { Button } from '@/components/ui/button';
import { MoreArticlesSection } from '@/components/news/MoreArticlesSection';
import { toast } from '@/hooks/use-toast';
import { ArticleVideoPlayer } from '@/components/news/ArticleVideoPlayer';
import { getShortUrl, generateSocialShareText, generateWhatsAppShareUrl, generateWhatsAppMobileShareUrl, shareToWhatsApp, copyToClipboard } from '@/utils/urlShortener';
import { updateMetaTags, resetMetaTags } from '@/utils/metaTags';
import apiClient from '@/utils/api';

const ArticlePage = () => {
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const [article, setArticle] = useState<any>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const { language } = useLanguage();
  const shareDropdownRef = useRef<HTMLDivElement>(null);

  // Share functions
  const copyArticleLink = async () => {
    try {
      const shortUrl = await getShortUrl(article.id);
      
      // Use the mobile-friendly clipboard utility
      await copyToClipboard(shortUrl);
      
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Article link has been copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
      setShowShareDropdown(false);
    } catch (err) {
      console.error('Copy failed:', err);
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const shareOnWhatsApp = async () => {
    try {
      const shortUrl = await getShortUrl(article.id);
      const title = language === 'hi' && article?.title_hi ? article.title_hi : article?.title;
      const imageUrl = article.featured_image_url;
      
      // Use the improved WhatsApp sharing function
      await shareToWhatsApp(title, shortUrl, imageUrl);
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
    try {
      const shortUrl = await getShortUrl(article.id);
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shortUrl)}`;
      window.open(facebookUrl, '_blank', 'width=600,height=400');
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
    try {
      const shortUrl = await getShortUrl(article.id);
      const title = language === 'hi' && article?.title_hi ? article.title_hi : article?.title;
      const text = generateSocialShareText(title, shortUrl, 'twitter');
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
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
    try {
      const shortUrl = await getShortUrl(article.id);
      const title = language === 'hi' && article?.title_hi ? article.title_hi : article?.title;
      const text = generateSocialShareText(title, shortUrl, 'instagram');
      
      // Instagram doesn't support direct URL sharing, so we copy to clipboard
      // Use the mobile-friendly clipboard utility
      await copyToClipboard(text);
      
      toast({
        title: "Ready for Instagram!",
        description: "Article details copied to clipboard. You can now paste this in your Instagram story or post.",
      });
      setShowShareDropdown(false);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the article details manually for Instagram sharing.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      // Use native share if available
      try {
        const shortUrl = await getShortUrl(article.id);
        const title = language === 'hi' && article?.title_hi ? article.title_hi : article?.title;
        const text = generateSocialShareText(title, shortUrl);
        
        // For Web Share API, only include text (which already contains the URL)
        // Don't include url parameter to avoid duplication
        await navigator.share({
          title: title,
          text: text,
          // url: shortUrl, // Removed to avoid duplicate URLs
        });
      } catch (err) {
        // Fallback to dropdown if native share fails
        setShowShareDropdown(!showShareDropdown);
      }
    } else {
      // Fallback to dropdown
      setShowShareDropdown(!showShareDropdown);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (shareDropdownRef.current && !shareDropdownRef.current.contains(event.target as Node)) {
        setShowShareDropdown(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowShareDropdown(false);
      }
    }

    if (showShareDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showShareDropdown]);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        let response;
        
        console.log('🔍 Fetching article with params:', { slug, id });
        
        // Use appropriate API call based on parameter
        if (id) {
          // Fetch by ID
          console.log('📰 Fetching article by ID:', id);
          response = await apiClient.getArticleById(id);
        } else if (slug) {
          // Fetch by slug
          console.log('📰 Fetching article by slug:', slug);
          response = await apiClient.getArticle(slug);
        } else {
          console.log('❌ No slug or id provided');
          setNotFound(true);
          setLoading(false);
          return;
        }

        console.log('📡 API Response:', response);

        if (!response.success || !response.data) {
          console.log('❌ Article not found or API error:', response);
          setNotFound(true);
          setLoading(false);
          return;
        }
        
        console.log('✅ Article found:', response.data.title);
        setArticle(response.data);
        
        // Update meta tags for social media sharing
        const title = language === 'hi' && response.data.title_hi ? response.data.title_hi : response.data.title;
        const description = language === 'hi' && response.data.summary_hi ? response.data.summary_hi : response.data.summary;
        const image = response.data.featured_image_url ? 
          (response.data.featured_image_url.startsWith('http') ? 
            response.data.featured_image_url : 
            `${window.location.origin}${response.data.featured_image_url}`) : 
          `${window.location.origin}/logo.png`;
        const shortUrl = await getShortUrl(response.data.id);
        
        // Prepare tags for meta tags
        const tags = [];
        if (response.data.categories?.name) {
          tags.push(response.data.categories.name);
        }
        if (response.data.states?.name) {
          tags.push(response.data.states.name);
        }
        if (response.data.is_breaking) {
          tags.push('Breaking News');
        }
        if (response.data.is_featured) {
          tags.push('Featured');
        }
        
        updateMetaTags({
          title: `${title} - Voice of Bharat`,
          description: description || 'Latest news and updates from Voice of Bharat',
          image: image,
          url: shortUrl,
          type: 'article',
          siteName: 'Voice of Bharat',
          twitterHandle: '@voiceofbharat',
          author: response.data.profiles?.full_name || response.data.publisher_name || 'Voice of Bharat',
          publishedTime: response.data.published_at,
          section: response.data.categories?.name || 'News',
          tags: tags
        });
        
        // Fetch related articles using API client
        try {
          const relatedResponse = await apiClient.get(`/articles/${response.data.slug}/related?limit=5`);
          if (relatedResponse.success && relatedResponse.data && relatedResponse.data.length > 0) {
            setRelatedArticles(relatedResponse.data);
          } else {
            // Fallback: fetch recent articles if no related articles found
            const recentResponse = await apiClient.getArticles({ 
              limit: 5, 
              exclude: response.data.id 
            });
            if (recentResponse.success && recentResponse.data) {
              setRelatedArticles(recentResponse.data);
            }
          }
        } catch (err) {
          console.error('Error fetching related articles:', err);
          setRelatedArticles([]);
        }
      } catch (error) {
        console.error('Error fetching article:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
    
    // Reset meta tags when component unmounts
    return () => {
      resetMetaTags();
    };
  }, [slug, id, language]);

  // Update meta tags when article loads
  useEffect(() => {
    if (article) {
      updateMetaTags(article);
    }
    
    return () => {
      resetMetaTags();
    };
  }, [article]);

  useEffect(() => {
    if (article?.id) {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/articles/${article.id}/view`, { method: 'POST' });
    }
  }, [article?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-md mx-auto">
            <div className="text-6xl mb-4">📰</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Article Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Sorry, the article you are looking for does not exist or may have been moved.</p>
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
  }

  // Use Hindi fields if language is 'hi' and field is not empty, else fallback to English
  const title = language === 'hi' && article.title_hi ? article.title_hi : article.title;
  const summary = language === 'hi' && article.summary_hi ? article.summary_hi : article.summary;
  const content = language === 'hi' && article.content_hi ? article.content_hi : article.content;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return formatDate(dateString);
  };

  const formatShortTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Ad Slot 5 - Article pages top banner */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <AdSlot slotNumber={5} />
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Article Content */}
          <div className="lg:col-span-3">
            <Card className="shadow-2xl border-0 overflow-hidden bg-white dark:bg-gray-900">
              {/* Hero Image Section */}
              {article.featured_image_url && (
                <div className="relative w-full overflow-hidden">
                  {/* Logo Mark in Top Right */}
                  <img
                    src="/logo.png"
                    alt="Voice of Bharat Logo Mark"
                    className="absolute top-4 right-4 w-16 h-16 z-20 drop-shadow-lg"
                    style={{objectFit: 'contain', background: 'transparent'}}
                  />
                  <img
                    src={article.featured_image_url}
                    alt={title}
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              )}
              {article.featured_image_url && (
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-4 mt-4 text-black dark:text-white drop-shadow-lg px-4 sm:px-8 mt-6">
                  {title}
                </h1>
              )}

              {/* Article Content */}
              <CardContent className="p-6 sm:p-8 lg:p-12">
                {/* Article Meta Information */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{article.publisher_name || article.profiles?.full_name || 'Unknown Author'}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                      <div className="flex items-center gap-2 whitespace-nowrap overflow-hidden text-ellipsis">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>{article.published_at ? formatDate(article.published_at) : ''}</span>
                        <span className="mx-1">·</span>
                        <span>{article.published_at ? formatShortTimeAgo(article.published_at) : ''}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{getReadingTime(content)} min read</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2" 
                      onClick={copyArticleLink}
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
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
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
                      {/* X (Twitter) Logo SVG */}
                      <svg className="h-4 w-4" viewBox="0 0 1200 1227" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1199.61 0H950.684L599.805 439.228L249.316 0H0L492.228 617.228L0 1227H249.316L599.805 787.772L950.684 1227H1200L707.772 609.772L1199.61 0ZM299.684 111.684H400.684L599.805 367.772L799.316 111.684H900.316L599.805 509.772L299.684 111.684ZM299.684 1115.32L599.805 717.228L900.316 1115.32H799.316L599.805 859.228L400.684 1115.32H299.684Z" />
                      </svg>
                    </Button>
                  </div>
                </div>

                {/* Article Body */}
                <article 
                  className="prose prose-lg sm:prose-xl max-w-none select-none pointer-events-none
                    prose-headings:text-gray-900 dark:prose-headings:text-white
                    prose-p:text-gray-700 dark:prose-p:text-gray-300
                    prose-strong:text-gray-900 dark:prose-strong:text-white
                    prose-a:text-red-600 dark:prose-a:text-red-400
                    prose-blockquote:border-l-red-600
                    prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-gray-800
                    prose-img:rounded-lg prose-img:shadow-lg
                    prose-hr:border-gray-300 dark:prose-hr:border-gray-600"
                  dangerouslySetInnerHTML={{ __html: content }} 
                />

                {/* Video Section - Display at the bottom with reduced size */}
                {article.youtube_video_url && (
                  <div className="mt-8">
                    <ArticleVideoPlayer 
                      youtubeUrl={article.youtube_video_url} 
                      title={title} 
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Ad Slot 6 - Article pages sidebar */}
            <Card className="shadow-lg border-0 bg-white dark:bg-gray-900">
              <CardContent className="p-4">
                <AdSlot slotNumber={6} />
              </CardContent>
            </Card>

            {/* Related Articles Placeholder */}
            <Card className="shadow-lg border-0 bg-white dark:bg-gray-900">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Related Articles ({relatedArticles.length})
                </h3>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {relatedArticles.length > 0 ? (
                    relatedArticles.map((relatedArticle) => {
                      const relatedTitle = language === 'hi' && relatedArticle.title_hi 
                        ? relatedArticle.title_hi 
                        : relatedArticle.title;
                      
                      return (
                        <Link 
                          key={relatedArticle.id} 
                          to={`/article/${relatedArticle.slug}`}
                          className="flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-3 rounded-lg transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                        >
                          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
                            {relatedArticle.featured_image_url ? (
                              <img
                                src={relatedArticle.featured_image_url}
                                alt={relatedTitle}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center">
                                <span className="text-xs text-gray-500 dark:text-gray-400">📰</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                              {relatedTitle}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-gray-500">
                                {formatRelativeTime(relatedArticle.published_at)}
                              </p>
                              {relatedArticle.categories && (
                                <Badge variant="outline" className="text-xs px-2 py-0">
                                  {relatedArticle.categories.name}
                                </Badge>
              )}
            </div>
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">📰</div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No related articles found
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Bottom Ad */}
        <div className="mt-12">
          <AdSlot slotNumber={7} />
        </div>

        {/* More Articles Section */}
        <MoreArticlesSection 
          currentArticleId={article.id} 
          currentArticleSlug={article.slug} 
        />
      </main>
    </div>
  );
};

export default ArticlePage; 
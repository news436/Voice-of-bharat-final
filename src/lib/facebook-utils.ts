/**
 * Converts a Facebook video URL to an embed URL
 * Supports various Facebook video URL formats:
 * - https://www.facebook.com/watch?v=VIDEO_ID
 * - https://www.facebook.com/username/videos/VIDEO_ID
 * - https://fb.watch/VIDEO_ID
 * - https://www.facebook.com/share/v/VIDEO_ID
 */
export function getFacebookEmbedUrl(url: string): string | null {
  if (!url) return null;
  
  // Extract video ID from various Facebook URL formats
  let videoId: string | null = null;
  
  // Handle facebook.com/watch?v= format
  const watchMatch = url.match(/facebook\.com\/watch\?v=([^&\n?#]+)/);
  if (watchMatch) {
    videoId = watchMatch[1];
  }
  
  // Handle facebook.com/username/videos/ format
  const videosMatch = url.match(/facebook\.com\/[^\/]+\/videos\/([^&\n?#\/]+)/);
  if (videosMatch) {
    videoId = videosMatch[1];
  }
  
  // Handle fb.watch/ format
  const fbWatchMatch = url.match(/fb\.watch\/([^&\n?#\/]+)/);
  if (fbWatchMatch) {
    videoId = fbWatchMatch[1];
  }
  
  // Handle facebook.com/share/v/ format
  const shareMatch = url.match(/facebook\.com\/share\/v\/([^&\n?#\/]+)/);
  if (shareMatch) {
    videoId = shareMatch[1];
  }
  
  if (!videoId) return null;
  
  // Return embed URL
  return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=1280&height=720`;
}

/**
 * Validates if a URL is a valid Facebook video URL
 */
export function isValidFacebookUrl(url: string): boolean {
  if (!url) return false;
  // Accept any facebook.com or fb.watch URL that contains a video identifier
  try {
    const u = new URL(url);
    if (
      u.hostname.includes('facebook.com') ||
      u.hostname === 'fb.watch'
    ) {
      // Accept if path or search contains any of these video patterns
      const patterns = [
        '/videos/',
        '/watch',
        '/share/v/',
        '/reel/',
        '/story.php',
        '/video.php'
      ];
      return patterns.some(p => u.pathname.includes(p) || (u.search && u.search.includes(p)));
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Extracts video ID from Facebook URL
 */
export function getFacebookVideoId(url: string): string | null {
  if (!url) return null;
  
  // Try different patterns
  const patterns = [
    /facebook\.com\/watch\?v=([^&\n?#]+)/,
    /facebook\.com\/[^\/]+\/videos\/([^&\n?#\/]+)/,
    /fb\.watch\/([^&\n?#\/]+)/,
    /facebook\.com\/share\/v\/([^&\n?#\/]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
} 
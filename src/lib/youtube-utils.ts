/**
 * Converts a YouTube URL to an embed URL
 * Supports various YouTube URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 * - https://youtube.com/watch?v=VIDEO_ID
 * - https://www.youtube.com/watch?v=VIDEO_ID&list=PLAYLIST_ID
 */
export function getYoutubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  
  // Extract video ID from various YouTube URL formats
  let videoId: string | null = null;
  
  // Handle youtube.com/watch?v= format (including mobile and with playlist)
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|m\.youtube\.com\/watch\?v=|youtube\.com\/v\/)([^&\n?#]+)/);
  if (watchMatch) {
    videoId = watchMatch[1];
  }
  
  if (!videoId) return null;
  
  // Return embed URL
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Extracts video ID from YouTube URL
 */
export function getYoutubeVideoId(url: string): string | null {
  if (!url) return null;
  
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|m\.youtube\.com\/watch\?v=|youtube\.com\/v\/)([^&\n?#]+)/);
  return watchMatch ? watchMatch[1] : null;
}

/**
 * Validates if a URL is a valid YouTube URL
 */
export function isValidYoutubeUrl(url: string): boolean {
  if (!url) return false;
  
  const youtubeRegex = /^(https?:\/\/)?(www\.|m\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)/;
  return youtubeRegex.test(url);
} 
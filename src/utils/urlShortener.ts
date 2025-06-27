// URL Shortening Utility
// This generates short URLs similar to Aaj Tak's format (e.g., https://intdy.in/hk9q6f)

const SHORT_URL_BASE = import.meta.env.VITE_SHORT_URL_BASE || 'https://vob.in';

// Generate a short ID (6 characters like Aaj Tak)
function generateShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create a short URL for an article
export function createShortUrl(articleSlug: string): string {
  const shortId = generateShortId();
  return `${SHORT_URL_BASE}/${shortId}`;
}

// For now, we'll use a simple approach
// In production, you'd want to store these mappings in a database
export function getShortUrl(articleSlug: string): string {
  // For development, use the full URL
  // In production, this would be replaced with actual short URLs
  if (import.meta.env.DEV) {
    return `${window.location.origin}/article/${articleSlug}`;
  }
  
  // In production, you'd return the actual short URL
  return createShortUrl(articleSlug);
} 
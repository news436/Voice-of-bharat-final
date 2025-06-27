// URL Shortening Utility
// This generates short URLs similar to popular news sites (e.g., https://voiceofbharat.live/abc123)

import apiClient from './api';

const SHORT_URL_BASE = import.meta.env.VITE_SHORT_URL_BASE || 'https://voiceofbharat.live';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://voiceofbharat-backend.onrender.com';

interface ShortUrlResponse {
  success: boolean;
  data?: {
    short_id: string;
    short_url: string;
    article_id: string;
  };
  error?: string;
  message?: string;
}

// Create a short URL for an article using the backend API
export async function createShortUrl(articleId: string): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/redirect/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ article_id: articleId }),
    });

    const data: ShortUrlResponse = await response.json();

    if (data.success && data.data) {
      return data.data.short_url;
    } else {
      console.error('Failed to create short URL:', data.error);
      // Fallback to full URL if short URL creation fails
      return `${window.location.origin}/article/${articleId}`;
    }
  } catch (error) {
    console.error('Error creating short URL:', error);
    // Fallback to full URL if API call fails
    return `${window.location.origin}/article/${articleId}`;
  }
}

// Get short URL for an article (creates if doesn't exist)
export async function getShortUrl(articleId: string): Promise<string> {
  try {
    // Try to create/get short URL
    return await createShortUrl(articleId);
  } catch (error) {
    console.error('Error getting short URL:', error);
    // Fallback to full URL
    return `${window.location.origin}/article/${articleId}`;
  }
}

// Generate formatted social sharing text
export function generateSocialShareText(articleTitle: string, shortUrl: string, platform: 'whatsapp' | 'twitter' | 'instagram' | 'facebook' = 'twitter'): string {
  const maxLength = platform === 'twitter' ? 280 : 1000; // Twitter has character limit
  
  // Format: "Article Title\n\nvia @voiceofbharat\nShortURL"
  let text = `${articleTitle}\n\nvia @voiceofbharat\n${shortUrl}`;
  
  // Truncate if too long for Twitter
  if (platform === 'twitter' && text.length > maxLength) {
    const titleMaxLength = maxLength - shortUrl.length - 20; // Reserve space for URL and "via @voiceofbharat"
    const truncatedTitle = articleTitle.length > titleMaxLength 
      ? articleTitle.substring(0, titleMaxLength - 3) + '...'
      : articleTitle;
    text = `${truncatedTitle}\n\nvia @voiceofbharat\n${shortUrl}`;
  }
  
  return text;
}

// Generate WhatsApp sharing URL with image support
export function generateWhatsAppShareUrl(articleTitle: string, shortUrl: string, imageUrl?: string): string {
  const text = generateSocialShareText(articleTitle, shortUrl, 'whatsapp');
  
  // WhatsApp Web API with image support
  if (imageUrl) {
    // For WhatsApp Web, we can include image in the message
    const messageWithImage = `${text}\n\n📸 ${imageUrl}`;
    return `https://wa.me/?text=${encodeURIComponent(messageWithImage)}`;
  }
  
  // Standard WhatsApp sharing
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

// Generate WhatsApp sharing URL for mobile (with image)
export function generateWhatsAppMobileShareUrl(articleTitle: string, shortUrl: string, imageUrl?: string): string {
  const text = generateSocialShareText(articleTitle, shortUrl, 'whatsapp');
  
  // For mobile WhatsApp, we can use the intent URL with image
  if (imageUrl) {
    return `whatsapp://send?text=${encodeURIComponent(text)}&image=${encodeURIComponent(imageUrl)}`;
  }
  
  return `whatsapp://send?text=${encodeURIComponent(text)}`;
}

// Advanced WhatsApp sharing with fallbacks
export async function shareToWhatsApp(articleTitle: string, shortUrl: string, imageUrl?: string): Promise<void> {
  const text = generateSocialShareText(articleTitle, shortUrl, 'whatsapp');
  
  // Try Web Share API first (best for mobile)
  if (navigator.share) {
    try {
      await navigator.share({
        title: articleTitle,
        text: text,
        url: shortUrl,
      });
      return;
    } catch (error) {
      console.log('Web Share API failed, falling back to WhatsApp URL');
    }
  }
  
  // Fallback to WhatsApp URL
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  let whatsappUrl;
  if (isMobile) {
    whatsappUrl = generateWhatsAppMobileShareUrl(articleTitle, shortUrl, imageUrl);
  } else {
    whatsappUrl = generateWhatsAppShareUrl(articleTitle, shortUrl, imageUrl);
  }
  
  window.open(whatsappUrl, '_blank');
}

// Get analytics for a short URL
export async function getShortUrlAnalytics(shortId: string): Promise<any> {
  try {
    const response = await apiClient.get(`/url-shortener/${shortId}/analytics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching short URL analytics:', error);
    throw error;
  }
}

// Test WhatsApp link preview
export function testWhatsAppPreview(articleTitle: string, shortUrl: string, imageUrl?: string): void {
  console.log('🔍 Testing WhatsApp Link Preview:');
  console.log('Title:', articleTitle);
  console.log('URL:', shortUrl);
  console.log('Image:', imageUrl);
  
  // Check if meta tags are properly set
  const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
  const ogDescription = document.querySelector('meta[property="og:description"]')?.getAttribute('content');
  const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
  const ogUrl = document.querySelector('meta[property="og:url"]')?.getAttribute('content');
  
  console.log('📱 Meta Tags Status:');
  console.log('og:title:', ogTitle);
  console.log('og:description:', ogDescription);
  console.log('og:image:', ogImage);
  console.log('og:url:', ogUrl);
  
  // Validate image URL
  if (imageUrl) {
    const img = new Image();
    img.onload = () => console.log('✅ Image loads successfully');
    img.onerror = () => console.log('❌ Image failed to load');
    img.src = imageUrl;
  }
  
  // Test WhatsApp sharing URL
  const whatsappUrl = generateWhatsAppShareUrl(articleTitle, shortUrl, imageUrl);
  console.log('📲 WhatsApp Share URL:', whatsappUrl);
} 
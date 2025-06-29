// URL Shortening Utility
// This generates short URLs similar to popular news sites (e.g., https://voiceofbharat.live/abc123)

import apiClient from './api';

const SHORT_URL_BASE = import.meta.env.VITE_SHORT_URL_BASE || 'https://voiceofbharat.live';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://voice-of-bharat-api.onrender.com';

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
    const response = await fetch(`${API_BASE_URL}/redirect/create`, {
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
      return `${window.location.origin}/article/id/${articleId}`;
    }
  } catch (error) {
    console.error('Error creating short URL:', error);
    // Fallback to full URL if API call fails
    return `${window.location.origin}/article/id/${articleId}`;
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
    return `${window.location.origin}/article/id/${articleId}`;
  }
}

// Mobile-friendly clipboard copy utility
export async function copyToClipboard(text: string): Promise<void> {
  // Try modern clipboard API first
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for mobile devices
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (!successful) {
        throw new Error('Copy command failed');
      }
    } catch (err) {
      console.error('Fallback copy failed:', err);
      throw err;
    } finally {
      document.body.removeChild(textArea);
    }
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

// Generate WhatsApp sharing URL (no image URL in message)
export function generateWhatsAppShareUrl(articleTitle: string, shortUrl: string): string {
  const text = generateSocialShareText(articleTitle, shortUrl, 'whatsapp');
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

// Generate WhatsApp sharing URL for mobile (no image URL in message)
export function generateWhatsAppMobileShareUrl(articleTitle: string, shortUrl: string): string {
  const text = generateSocialShareText(articleTitle, shortUrl, 'whatsapp');
  return `whatsapp://send?text=${encodeURIComponent(text)}`;
}

// Advanced WhatsApp sharing with fallbacks
export async function shareToWhatsApp(articleTitle: string, shortUrl: string): Promise<void> {
  const text = generateSocialShareText(articleTitle, shortUrl, 'whatsapp');
  if (navigator.share) {
    try {
      await navigator.share({
        title: articleTitle,
        text: text,
      });
      return;
    } catch (error) {
      console.log('Web Share API failed, falling back to WhatsApp URL');
    }
  }
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  let whatsappUrl;
  if (isMobile) {
    whatsappUrl = generateWhatsAppMobileShareUrl(articleTitle, shortUrl);
  } else {
    whatsappUrl = generateWhatsAppShareUrl(articleTitle, shortUrl);
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
  const whatsappUrl = generateWhatsAppShareUrl(articleTitle, shortUrl);
  console.log('📲 WhatsApp Share URL:', whatsappUrl);
}

// Generate preview URL for social media sharing
export function generatePreviewUrl(articleId: string): string {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://voice-of-bharat-api.onrender.com';
  return `${API_BASE_URL}/articles/preview/${articleId}`;
}

// Generate social sharing text with preview URL
export function generateSocialShareTextWithPreview(articleTitle: string, articleId: string, platform: 'whatsapp' | 'twitter' | 'instagram' | 'facebook' = 'twitter'): string {
  const previewUrl = generatePreviewUrl(articleId);
  const maxLength = platform === 'twitter' ? 280 : 1000;
  
  // Format: "Article Title\n\nvia @voiceofbharat\nPreviewURL"
  let text = `${articleTitle}\n\nvia @voiceofbharat\n${previewUrl}`;
  
  // Truncate if too long for Twitter
  if (platform === 'twitter' && text.length > maxLength) {
    const titleMaxLength = maxLength - previewUrl.length - 20;
    const truncatedTitle = articleTitle.length > titleMaxLength 
      ? articleTitle.substring(0, titleMaxLength - 3) + '...'
      : articleTitle;
    text = `${truncatedTitle}\n\nvia @voiceofbharat\n${previewUrl}`;
  }
  
  return text;
}

// Generate WhatsApp sharing URL with preview
export function generateWhatsAppShareUrlWithPreview(articleTitle: string, articleId: string): string {
  const text = generateSocialShareTextWithPreview(articleTitle, articleId, 'whatsapp');
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

// Generate WhatsApp mobile sharing URL with preview
export function generateWhatsAppMobileShareUrlWithPreview(articleTitle: string, articleId: string): string {
  const text = generateSocialShareTextWithPreview(articleTitle, articleId, 'whatsapp');
  return `whatsapp://send?text=${encodeURIComponent(text)}`;
}

// Advanced WhatsApp sharing with preview URLs
export async function shareToWhatsAppWithPreview(articleTitle: string, articleId: string): Promise<void> {
  const text = generateSocialShareTextWithPreview(articleTitle, articleId, 'whatsapp');
  if (navigator.share) {
    try {
      await navigator.share({
        title: articleTitle,
        text: text,
      });
      return;
    } catch (error) {
      console.log('Web Share API failed, falling back to WhatsApp URL');
    }
  }
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  let whatsappUrl;
  if (isMobile) {
    whatsappUrl = generateWhatsAppMobileShareUrlWithPreview(articleTitle, articleId);
  } else {
    whatsappUrl = generateWhatsAppShareUrlWithPreview(articleTitle, articleId);
  }
  window.open(whatsappUrl, '_blank');
}

// Generate short preview URL for social media sharing
export function generateShortPreviewUrl(articleId: string): string {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://voice-of-bharat-api.onrender.com';
  
  // Create a shorter ID using base64 encoding (browser-compatible)
  // Handle Unicode characters properly
  const shortId = btoa(unescape(encodeURIComponent(articleId)))
    .replace(/\+/g, '-')  // Replace + with -
    .replace(/\//g, '_')  // Replace / with _
    .replace(/=/g, '');   // Remove padding
  
  const url = `${API_BASE_URL}/articles/p/${shortId}`;
  console.log('🔗 Generated short preview URL:', url);
  return url;
}

// Generate even shorter preview URL (if you want to use just the first part of the ID)
export function generateMinimalPreviewUrl(articleId: string): string {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://voice-of-bharat-api.onrender.com';
  
  // Use just the first 8 characters of the article ID
  const shortId = articleId.substring(0, 8);
  
  return `${API_BASE_URL}/articles/p/${shortId}`;
}

// Generate social sharing text with short preview URL
export function generateSocialShareTextWithShortPreview(articleTitle: string, articleId: string, platform: 'whatsapp' | 'twitter' | 'instagram' | 'facebook' = 'twitter'): string {
  const previewUrl = generateShortPreviewUrl(articleId);
  const maxLength = platform === 'twitter' ? 280 : 1000;
  
  // Format: "Article Title\n\nvia @voiceofbharat\nShortPreviewURL"
  let text = `${articleTitle}\n\nvia @voiceofbharat\n${previewUrl}`;
  
  // Truncate if too long for Twitter
  if (platform === 'twitter' && text.length > maxLength) {
    const titleMaxLength = maxLength - previewUrl.length - 20;
    const truncatedTitle = articleTitle.length > titleMaxLength 
      ? articleTitle.substring(0, titleMaxLength - 3) + '...'
      : articleTitle;
    text = `${truncatedTitle}\n\nvia @voiceofbharat\n${previewUrl}`;
  }
  
  return text;
}

// Generate WhatsApp sharing URL with short preview
export function generateWhatsAppShareUrlWithShortPreview(articleTitle: string, articleId: string): string {
  const text = generateSocialShareTextWithShortPreview(articleTitle, articleId, 'whatsapp');
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

// Generate WhatsApp mobile sharing URL with short preview
export function generateWhatsAppMobileShareUrlWithShortPreview(articleTitle: string, articleId: string): string {
  const text = generateSocialShareTextWithShortPreview(articleTitle, articleId, 'whatsapp');
  return `whatsapp://send?text=${encodeURIComponent(text)}`;
}

// Advanced WhatsApp sharing with short preview URLs
export async function shareToWhatsAppWithShortPreview(articleTitle: string, articleId: string): Promise<void> {
  const text = generateSocialShareTextWithShortPreview(articleTitle, articleId, 'whatsapp');
  if (navigator.share) {
    try {
      await navigator.share({
        title: articleTitle,
        text: text,
      });
      return;
    } catch (error) {
      console.log('Web Share API failed, falling back to WhatsApp URL');
    }
  }
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  let whatsappUrl;
  if (isMobile) {
    whatsappUrl = generateWhatsAppMobileShareUrlWithShortPreview(articleTitle, articleId);
  } else {
    whatsappUrl = generateWhatsAppShareUrlWithShortPreview(articleTitle, articleId);
  }
  window.open(whatsappUrl, '_blank');
}

// Test function to verify short URL generation
export function testShortUrlGeneration(articleId: string): void {
  console.log('🧪 Testing short URL generation:');
  console.log('Original Article ID:', articleId);
  
  const shortUrl = generateShortPreviewUrl(articleId);
  console.log('Generated Short URL:', shortUrl);
  
  // Test if it's different from the old format
  const oldUrl = generatePreviewUrl(articleId);
  console.log('Old URL format:', oldUrl);
  
  console.log('✅ Short URL is', shortUrl.length, 'characters vs', oldUrl.length, 'characters');
} 
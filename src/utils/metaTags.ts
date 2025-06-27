// Dynamic Meta Tags Manager for Social Media Sharing

interface MetaTagsData {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: string;
  siteName?: string;
  twitterHandle?: string;
}

export function updateMetaTags(data: MetaTagsData) {
  const {
    title,
    description,
    image,
    url,
    type = 'article',
    siteName = 'Voice of Bharat',
    twitterHandle = '@voiceofbharat'
  } = data;

  // Update or create meta tags
  updateMetaTag('title', title);
  updateMetaTag('description', description);
  
  // Open Graph tags
  updateMetaTag('og:title', title);
  updateMetaTag('og:description', description);
  updateMetaTag('og:image', image);
  updateMetaTag('og:url', url);
  updateMetaTag('og:type', type);
  updateMetaTag('og:site_name', siteName);
  
  // Twitter Card tags
  updateMetaTag('twitter:card', 'summary_large_image');
  updateMetaTag('twitter:site', twitterHandle);
  updateMetaTag('twitter:title', title);
  updateMetaTag('twitter:description', description);
  updateMetaTag('twitter:image', image);
  updateMetaTag('twitter:url', url);
  
  // Additional tags
  updateMetaTag('article:published_time', new Date().toISOString());
  updateMetaTag('article:author', siteName);
}

function updateMetaTag(name: string, content: string) {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
  if (!meta) {
    meta = document.querySelector(`meta[property="${name}"]`) as HTMLMetaElement;
  }
  
  if (!meta) {
    meta = document.createElement('meta');
    if (name.startsWith('og:') || name.startsWith('article:')) {
      meta.setAttribute('property', name);
    } else {
      meta.setAttribute('name', name);
    }
    document.head.appendChild(meta);
  }
  
  meta.setAttribute('content', content);
}

export function resetMetaTags() {
  // Reset to default meta tags
  const defaultData: MetaTagsData = {
    title: 'Voice Of Bharat - Latest News & Updates',
    description: 'Voice Of Bharat brings you the latest news, videos, and updates from across India. Stay informed with breaking news, in-depth articles, and more.',
    image: '/logo.png',
    url: 'https://voiceofbharat.live',
    type: 'website',
    siteName: 'Voice of Bharat',
    twitterHandle: '@voiceofbharat'
  };
  
  updateMetaTags(defaultData);
} 
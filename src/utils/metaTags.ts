// Dynamic Meta Tags Manager for Social Media Sharing

interface MetaTagsData {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: string;
  siteName?: string;
  twitterHandle?: string;
  author?: string;
  publishedTime?: string;
  section?: string;
  tags?: string[];
}

export function updateMetaTags(article: any, baseUrl: string = 'https://voiceofbharat.live') {
  const title = article?.title_hi || article?.title || 'Voice of Bharat - Latest News';
  const description = article?.excerpt_hi || article?.excerpt || 'Latest news and updates from Voice of Bharat';
  const imageUrl = article?.featured_image_url ? `${baseUrl}${article.featured_image_url}` : `${baseUrl}/logo.png`;
  const articleUrl = `${baseUrl}/article/${article?.slug || article?.id}`;
  const author = article?.author || 'Voice of Bharat';
  const publishedTime = article?.published_at ? new Date(article.published_at).toISOString() : new Date().toISOString();
  const category = article?.category?.name || 'News';
  const tags = article?.tags?.map((tag: any) => tag.name).join(', ') || '';

  // Basic meta tags
  updateMetaTag('title', title);
  updateMetaTag('description', description);
  updateMetaTag('author', author);

  // Open Graph tags (Facebook, WhatsApp, etc.)
  updateMetaTag('og:title', title);
  updateMetaTag('og:description', description);
  updateMetaTag('og:image', imageUrl);
  updateMetaTag('og:url', articleUrl);
  updateMetaTag('og:type', 'article');
  updateMetaTag('og:site_name', 'Voice of Bharat');
  updateMetaTag('og:locale', 'hi_IN');
  updateMetaTag('og:image:width', '1200');
  updateMetaTag('og:image:height', '630');
  updateMetaTag('og:image:type', 'image/jpeg');
  updateMetaTag('og:image:alt', title);

  // Twitter Card tags
  updateMetaTag('twitter:card', 'summary_large_image');
  updateMetaTag('twitter:site', '@voiceofbharat');
  updateMetaTag('twitter:creator', '@voiceofbharat');
  updateMetaTag('twitter:title', title);
  updateMetaTag('twitter:description', description);
  updateMetaTag('twitter:image', imageUrl);
  updateMetaTag('twitter:image:alt', title);

  // WhatsApp specific tags
  updateMetaTag('whatsapp:title', title);
  updateMetaTag('whatsapp:description', description);
  updateMetaTag('whatsapp:image', imageUrl);

  // Article specific meta tags
  updateMetaTag('article:published_time', publishedTime);
  updateMetaTag('article:author', author);
  updateMetaTag('article:section', category);
  if (tags) {
    updateMetaTag('article:tag', tags);
  }

  // Canonical URL
  updateMetaTag('canonical', articleUrl);

  // Structured data (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": title,
    "description": description,
    "image": imageUrl,
    "author": {
      "@type": "Person",
      "name": author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Voice of Bharat",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    },
    "datePublished": publishedTime,
    "dateModified": publishedTime,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": articleUrl
    },
    "articleSection": category,
    "keywords": tags
  };

  // Remove existing structured data
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }

  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
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
    image: `${window.location.origin}/logo.png`,
    url: 'https://voiceofbharat.live',
    type: 'website',
    siteName: 'Voice of Bharat',
    twitterHandle: '@voiceofbharat'
  };
  
  updateMetaTags(defaultData);
} 
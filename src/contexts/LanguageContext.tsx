import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    'nav.home': 'Home',
    'nav.politics': 'Politics',
    'nav.sports': 'Sports',
    'nav.business': 'Business',
    'nav.entertainment': 'Entertainment',
    'nav.technology': 'Technology',
    'nav.videos': 'Videos',
    'nav.live': 'Live',
    'site.title': 'Voice Of Bharat',
    'breaking.label': 'BREAKING',
    'search.placeholder': 'Search news...',
    'newsletter.title': 'Newsletter',
    'newsletter.description': 'Subscribe to get latest news updates',
    'newsletter.button': 'Subscribe',
    'admin.dashboard': 'Admin Dashboard',
    'latest.news': 'Latest News',
    'featured.articles': 'Featured Articles',
    'live.streams': 'Live Streams',
    'live.no_streams': 'No live streams are active right now.',
    'live.check_back': 'Check back later for live news and events.',
    'live.stream_not_found': 'Live stream not found.',
    'live.stream_discontinued': 'This live stream may have ended or been removed.',
    'live.back_to_live': 'Back to Live Streams',
    'live.started_at': 'Started at',
    'live.watch_on_platform': 'Watch on Platform',
    'live.related_streams': 'Related Streams',
    'live.invalid_url': 'Invalid stream URL',
    'categories': 'Categories',
    'date.format': 'en-US',
    'quick_links': 'Quick Links',
    'about_us': 'About Us',
    'contact': 'Contact',
    'privacy_policy': 'Privacy Policy',
    'connect': 'Connect',
    'facebook': 'Facebook',
    'twitter': 'Twitter',
    'youtube': 'YouTube',
    'instagram': 'Instagram',
    'featured_stories': 'Featured Stories',
    'latest_news': 'Latest News',
    'latest_videos': 'Latest Videos',
    'view_all': 'View All →',
    'no_articles_in_category': 'No articles found in this category.',
    'no_articles_in_state': 'No articles found for this state.',
    'news_articles': 'News Articles',
    'videos': 'Videos',
    'states': 'States',
    'footer_tagline': 'Your trusted source for latest news and updates from across India.',
    'newsletter.stay_updated': 'Stay Updated',
    'newsletter.get_latest': 'Get the latest news delivered straight to your inbox.',
    'newsletter.name_optional': 'Your name (optional)',
    'newsletter.email': 'Your email address',
    'newsletter.subscribe': 'Subscribe',
    'newsletter.already_subscribed': 'Already Subscribed',
    'newsletter.already_subscribed_desc': 'This email is already subscribed to our newsletter.',
    'newsletter.success': 'Successfully Subscribed!',
    'newsletter.success_desc': 'Thank you for subscribing to our newsletter.',
    'newsletter.failed': 'Subscription Failed',
    'newsletter.failed_desc': 'An error occurred. Please try again.',
    'newsletter.join_our_newsletter': 'Join Our Newsletter',
    'newsletter.get_the_latest_news': 'Get the latest news, updates, and special offers delivered directly to your inbox.',
    'newsletter.enter_your_email': 'Enter your email',
    'newsletter.subscribe_now': 'Subscribe Now',
    'newsletter.subscribing': 'Subscribing',
    'newsletter.unsubscribe_anytime': 'Unsubscribe at any time. We respect your privacy.',
    'view_more': 'View More',
    'all_videos': 'All Videos',
    'all': 'All',
    'featured': 'Featured',
    'latest': 'Latest',
    'oldest': 'Oldest',
    'filter': 'Filter',
    'sort': 'Sort',
    'up_next': 'Up Next'
  },
  hi: {
    'nav.home': 'होम',
    'nav.politics': 'राजनीति',
    'nav.sports': 'खेल',
    'nav.business': 'व्यापार',
    'nav.entertainment': 'मनोरंजन',
    'nav.technology': 'तकनीक',
    'nav.videos': 'वीडियो',
    'nav.live': 'लाइव',
    'site.title': 'भारत की आवाज़',
    'breaking.label': 'ब्रेकिंग',
    'search.placeholder': 'समाचार खोजें...',
    'newsletter.title': 'न्यूज़लेटर',
    'newsletter.description': 'नवीनतम समाचार अपडेट के लिए सब्सक्राइब करें',
    'newsletter.button': 'सब्सक्राइब करें',
    'admin.dashboard': 'एडमिन डैशबोर्ड',
    'latest.news': 'ताज़ा खबरें',
    'featured.articles': 'फीचर्ड आर्टिकल्स',
    'live.streams': 'लाइव स्ट्रीम',
    'live.no_streams': 'इस समय कोई लाइव स्ट्रीम सक्रिय नहीं है।',
    'live.check_back': 'लाइव समाचार और कार्यक्रमों के लिए बाद में देखें।',
    'live.stream_not_found': 'लाइव स्ट्रीम नहीं मिला।',
    'live.stream_discontinued': 'यह लाइव स्ट्रीम समाप्त हो गया है या हटा दिया गया है।',
    'live.back_to_live': 'लाइव स्ट्रीम पर वापस जाएं',
    'live.started_at': 'प्रारंभ हुआ',
    'live.watch_on_platform': 'प्लेटफ़ॉर्म पर देखें',
    'live.related_streams': 'संबंधित स्ट्रीम',
    'live.invalid_url': 'अमान्य स्ट्रीम यूआरएल',
    'categories': 'श्रेणियां',
    'date.format': 'hi-IN',
    'quick_links': 'त्वरित लिंक',
    'about_us': 'हमारे बारे में',
    'contact': 'संपर्क करें',
    'privacy_policy': 'गोपनीयता नीति',
    'connect': 'कनेक्ट करें',
    'facebook': 'फेसबुक',
    'twitter': 'ट्विटर',
    'youtube': 'यूट्यूब',
    'instagram': 'इंस्टाग्राम',
    'featured_stories': 'फीचर्ड स्टोरीज़',
    'latest_news': 'ताज़ा खबरें',
    'latest_videos': 'नवीनतम वीडियो',
    'view_all': 'सभी देखें →',
    'no_articles_in_category': 'इस श्रेणी में कोई लेख नहीं मिले।',
    'no_articles_in_state': 'इस राज्य में कोई लेख नहीं मिले।',
    'news_articles': 'समाचार लेख',
    'videos': 'वीडियो',
    'states': 'राज्य',
    'footer_tagline': 'भारत भर की ताज़ा खबरों और अपडेट्स का आपका विश्वसनीय स्रोत।',
    'newsletter.stay_updated': 'अपडेट रहें',
    'newsletter.get_latest': 'नवीनतम समाचार सीधे अपने इनबॉक्स में प्राप्त करें।',
    'newsletter.name_optional': 'आपका नाम (वैकल्पिक)',
    'newsletter.email': 'आपका ईमेल पता',
    'newsletter.subscribe': 'सब्सक्राइब करें',
    'newsletter.already_subscribed': 'पहले से सब्सक्राइब किया गया',
    'newsletter.already_subscribed_desc': 'यह ईमेल पहले से हमारे न्यूज़लेटर के लिए सब्सक्राइब है।',
    'newsletter.success': 'सफलतापूर्वक सब्सक्राइब किया गया!',
    'newsletter.success_desc': 'हमारे न्यूज़लेटर के लिए सब्सक्राइब करने के लिए धन्यवाद।',
    'newsletter.failed': 'सब्सक्रिप्शन विफल',
    'newsletter.failed_desc': 'कोई त्रुटि हुई। कृपया पुनः प्रयास करें।',
    'newsletter.join_our_newsletter': 'हमारे न्यूज़लेटर से जुड़ें',
    'newsletter.get_the_latest_news': 'नवीनतम समाचार, अपडेट और विशेष ऑफ़र सीधे अपने इनबॉक्स में प्राप्त करें।',
    'newsletter.enter_your_email': 'अपना ईमेल दर्ज करें',
    'newsletter.subscribe_now': 'अभी सब्सक्राइब करें',
    'newsletter.subscribing': 'सदस्यता ले रहा है',
    'newsletter.unsubscribe_anytime': 'किसी भी समय सदस्यता समाप्त करें। हम आपकी गोपनीयता का सम्मान करते हैं।',
    'view_more': 'और देखें',
    'all_videos': 'सभी वीडियो',
    'all': 'सभी',
    'featured': 'विशेष रुप से प्रदर्शित',
    'latest': 'नवीनतम',
    'oldest': 'पुराने',
    'filter': 'फ़िल्टर',
    'sort': 'क्रमबद्ध करें',
    'up_next': 'अगला'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<Language>('hi');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

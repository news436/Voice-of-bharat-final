import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NewsHeader } from '@/components/news/NewsHeader';
import { Footer } from '@/components/news/Footer';
import { NewsletterSignup } from '@/components/news/NewsletterSignup';
import { BreakingNewsTicker } from '@/components/news/BreakingNewsTicker';
import { useLanguage } from '@/contexts/LanguageContext';

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [breakingNews, setBreakingNews] = useState<any[]>([]);
  const [showNewsletterPopup, setShowNewsletterPopup] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchSharedData = async () => {
      const { data: catData } = await supabase.from('categories').select('*').order('name');
      setCategories(catData || []);
      const { data: stateData } = await supabase.from('states').select('*').order('name');
      setStates(stateData || []);
      
      const { data: articles, error } = await supabase
        .from('articles')
        .select('*')
        .eq('is_breaking', true)
        .order('published_at', { ascending: false })
        .limit(10);
      if (error) {
        console.error("Error fetching breaking news:", error);
      } else {
        setBreakingNews(articles);
      }
    };
    fetchSharedData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!localStorage.getItem('newsletter_subscribed')) {
        setShowNewsletterPopup(true);
      }
    }, 7000); // 7-second delay

    return () => clearTimeout(timer);
  }, []);

  const handleClosePopup = () => {
    setShowNewsletterPopup(false);
    localStorage.setItem('newsletter_subscribed', 'true');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <NewsHeader 
        categories={categories} 
        states={states}
        breakingNews={breakingNews}
        language={language}
      />
      <main className="flex-1">
        {children}
      </main>
      <Footer categories={categories} />
      {showNewsletterPopup && <NewsletterSignup onClose={handleClosePopup} />}
    </div>
  );
}; 
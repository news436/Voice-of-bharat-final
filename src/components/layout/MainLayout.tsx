import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { NewsHeader } from '@/components/news/NewsHeader';
import { Footer } from '@/components/news/Footer';
import { NewsletterSignup } from '@/components/news/NewsletterSignup';
import { BreakingNewsTicker } from '@/components/news/BreakingNewsTicker';
import { useLanguage } from '@/contexts/LanguageContext';
import { SupportUsCta } from '../news/SupportUsCta';
import { ArticleCacheProvider } from '@/contexts/ArticleCacheContext';
import { AdSlot } from '@/components/news/AdSlot';

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [breakingNews, setBreakingNews] = useState<any[]>([]);
  const [showNewsletterPopup, setShowNewsletterPopup] = useState(false);
  const { language } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    const fetchSharedData = async () => {
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*, articles:articles(count)')
        .order('name');
      if (catError) {
        console.error('Error fetching categories:', catError);
        setCategories([]);
      } else if (catData) {
        const categoriesWithCount = catData.map((cat: any) => ({
          ...cat,
          article_count: cat.articles?.length > 0 ? cat.articles[0].count : 0,
        }));
        categoriesWithCount.sort((a: any, b: any) => b.article_count - a.article_count);
        setCategories(categoriesWithCount);
      }
      const { data: stateData, error: stateError } = await supabase
        .from('states')
        .select('*, articles:articles(count)')
        .order('name');
      if (stateError) {
        console.error('Error fetching states:', stateError);
        setStates([]);
      } else if (stateData) {
        const statesWithCount = stateData.map((state: any) => ({
          ...state,
          article_count: state.articles?.length > 0 ? state.articles[0].count : 0,
        }));
        statesWithCount.sort((a: any, b: any) => b.article_count - a.article_count);
        setStates(statesWithCount);
      }
      
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
    <ArticleCacheProvider>
      <div className="flex flex-col min-h-screen">
        <NewsHeader 
          categories={categories} 
          states={states}
          breakingNews={breakingNews}
          language={language}
          pathname={location.pathname}
        />
        <main className="flex-1">
          {children}
        </main>
        {location.pathname !== '/support-us' && <SupportUsCta />}
        <div className="my-6">
          <AdSlot slotNumber={15} />
        </div>
        <Footer categories={categories} />
        {showNewsletterPopup && <NewsletterSignup onClose={handleClosePopup} />}
      </div>
    </ArticleCacheProvider>
  );
}; 
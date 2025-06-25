import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function Footer({ categories }: { categories: any[] }) {
  const { language, t } = useLanguage();
  const [socials, setSocials] = useState({
    facebook_url: '',
    twitter_url: '',
    youtube_url: '',
    instagram_url: '',
  });

  useEffect(() => {
    const fetchSocials = async () => {
      const { data } = await supabase.from('socials').select('*').limit(1).single();
      if (data) {
        setSocials({
          facebook_url: data.facebook_url || '',
          twitter_url: data.twitter_url || '',
          youtube_url: data.youtube_url || '',
          instagram_url: data.instagram_url || '',
        });
      }
    };
    fetchSocials();
  }, []);

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xl font-bold mb-4 text-red-400">Voice Of Bharat</h3>
            <p className="text-gray-300">{t('footer_tagline')}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t('quick_links')}</h4>
            <div className="space-y-2">
              <Link to="/about-us" className="block text-gray-300 hover:text-white">{t('about_us')}</Link>
              <Link to="/about-us" className="block text-gray-300 hover:text-white">{t('contact')}</Link>
              <Link to="/privacy-policy" className="block text-gray-300 hover:text-white">{t('privacy_policy')}</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t('categories')}</h4>
            <div className="space-y-2">
              {categories.slice(0, 5).map((category) => {
                const name = language === 'hi' && category.name_hi ? category.name_hi : category.name;
                return (
                  <Link
                    key={category.id}
                    to={`/category/${category.slug}`}
                    className="block text-gray-300 hover:text-white"
                  >
                    {name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t('connect')}</h4>
            <div className="space-y-2">
              {socials.facebook_url && (
                <a href={socials.facebook_url} className="block text-gray-300 hover:text-white" target="_blank" rel="noopener noreferrer">{t('facebook')}</a>
              )}
              {socials.twitter_url && (
                <a href={socials.twitter_url} className="block text-gray-300 hover:text-white" target="_blank" rel="noopener noreferrer">{t('twitter')}</a>
              )}
              {socials.youtube_url && (
                <a href={socials.youtube_url} className="block text-gray-300 hover:text-white" target="_blank" rel="noopener noreferrer">{t('youtube')}</a>
              )}
              {socials.instagram_url && (
                <a href={socials.instagram_url} className="block text-gray-300 hover:text-white" target="_blank" rel="noopener noreferrer">{t('instagram')}</a>
              )}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © 2025 Voice Of Bharat. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 
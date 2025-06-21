import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export function Footer({ categories }: { categories: any[] }) {
  const { language, t } = useLanguage();
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
              <Link to="/about" className="block text-gray-300 hover:text-white">{t('about_us')}</Link>
              <Link to="/contact" className="block text-gray-300 hover:text-white">{t('contact')}</Link>
              <Link to="/privacy" className="block text-gray-300 hover:text-white">{t('privacy_policy')}</Link>
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
              <a href="#" className="block text-gray-300 hover:text-white">{t('facebook')}</a>
              <a href="#" className="block text-gray-300 hover:text-white">{t('twitter')}</a>
              <a href="#" className="block text-gray-300 hover:text-white">{t('youtube')}</a>
              <a href="#" className="block text-gray-300 hover:text-white">{t('instagram')}</a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © 2024 Voice Of Bharat. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 
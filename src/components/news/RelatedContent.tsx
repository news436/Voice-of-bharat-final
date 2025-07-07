import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

interface RelatedContentProps {
  title: string;
  items: any[];
  linkPrefix: string;
  icon: React.ReactNode;
}

export const RelatedContent = ({ title, items, linkPrefix, icon }: RelatedContentProps) => {
  const { language } = useLanguage();

  if (items.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {items.map((item) => {
            const itemTitle = language === 'hi' && item.title_hi ? item.title_hi : item.title;
            const itemLink = `${linkPrefix}/${item.slug || item.id}`;
            return (
              <Link to={itemLink} key={item.id} className="block group focus:outline-none focus:ring-2 focus:ring-red-600 rounded-xl">
                <div className="rounded-xl shadow-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-row overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 min-h-[72px] md:min-h-[96px] max-h-[120px]">
                  {/* Image */}
                  {item.thumbnail_url ? (
                    <img
                      src={item.thumbnail_url}
                      alt={itemTitle}
                      className="w-20 md:w-28 h-20 md:h-28 object-cover rounded-l-xl group-hover:scale-105 transition-transform duration-300 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 md:w-28 h-20 md:h-28 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center flex-shrink-0 rounded-l-xl">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M8 12h.01M16 12h.01M12 16h.01" /></svg>
                    </div>
                  )}
                  {/* Content */}
                  <div className="p-3 md:p-4 flex-1 flex flex-col justify-center">
                    <h4 className="font-semibold text-sm md:text-base line-clamp-2 text-black dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      {itemTitle}
                    </h4>
                    {item.subtitle && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.subtitle}</p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}; 
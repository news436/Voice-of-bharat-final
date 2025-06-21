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
        <div className="space-y-4">
          {items.map((item) => {
            const itemTitle = language === 'hi' && item.title_hi ? item.title_hi : item.title;
            const itemLink = `${linkPrefix}/${item.slug || item.id}`;
            return (
              <Link to={itemLink} key={item.id} className="block group">
                <div className="flex items-start space-x-4">
                  {item.thumbnail_url && (
                    <img
                      src={item.thumbnail_url}
                      alt={itemTitle}
                      className="w-24 h-16 object-cover rounded-md"
                    />
                  )}
                  <div>
                    <h4 className="font-semibold text-md group-hover:text-primary transition-colors">
                      {itemTitle}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
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
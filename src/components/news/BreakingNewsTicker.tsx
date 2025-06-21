import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface BreakingNewsTickerProps {
  news: any[];
  language?: string;
}

export const BreakingNewsTicker = ({ news, language }: BreakingNewsTickerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (news.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [news.length]);

  if (news.length === 0) return null;

  return (
    <div className="bg-red-600 text-white py-2 overflow-hidden relative z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center">
          <div className="flex items-center space-x-2 bg-red-700 px-3 py-1 rounded mr-4 flex-shrink-0">
            <AlertTriangle className="h-4 w-4 animate-pulse" />
            <span className="font-bold text-sm">BREAKING</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="breaking-marquee-track">
              {[...news, ...news].map((item, index, arr) => (
                <span key={item.id + '-' + (index < news.length ? 'a' : 'b')} className="flex items-center">
                  <Link
                    to={`/article/${item.slug}`}
                    className="inline-block px-4 py-1 mx-1 rounded-full bg-red-700/80 hover:bg-red-800/90 transition-colors font-medium shadow text-white whitespace-nowrap"
                  >
                    {language === 'hi' && item.title_hi ? item.title_hi : item.title}
                  </Link>
                  {index !== arr.length - 1 && (
                    <span className="mx-2 text-red-200 text-lg select-none">|</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

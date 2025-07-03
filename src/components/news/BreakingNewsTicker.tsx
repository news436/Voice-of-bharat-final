import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import React from 'react';

interface BreakingNewsTickerProps {
  news: any[];
  language?: string;
}

export const BreakingNewsTicker = ({ news, language }: BreakingNewsTickerProps) => {
  const { t } = useLanguage();
  if (news.length === 0) return null;

  return (
    <div className="bg-[#d32f2f] text-white py-2 px-0 overflow-hidden w-full m-0 border-b border-white/20">
      <div className="flex items-center">
        <span className="flex items-center mr-2 md:mr-4 bg-[#c62828] px-3 py-1 font-bold text-white uppercase text-xs md:text-base tracking-widest animate-pulse" style={{borderRadius:0}}>
          <AlertTriangle className="h-4 w-4 md:h-4 md:w-4 text-white mr-1" />
          BREAKING
        </span>
        <div className="flex-1 overflow-hidden">
          <div
            className="breaking-marquee-track-modern flex items-center whitespace-nowrap select-none"
            style={{
              animation: 'breaking-marquee-modern 60s linear infinite',
              willChange: 'transform',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.animationPlayState = 'paused';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.animationPlayState = 'running';
            }}
          >
            {[...news, ...news].map((item, index, arr) => (
              <span key={item.id + '-' + (index < news.length ? 'a' : 'b')} className="flex items-center">
                <span className="bg-black/20 rounded-full px-3 py-1 md:px-5 md:py-1 transition-colors">
                  <Link
                    to={`/article/${item.slug}`}
                    className="inline-block font-normal text-white text-xs md:text-base whitespace-nowrap focus:outline-none hover:no-underline"
                    style={{ minWidth: 0, maxWidth: 'none', overflow: 'visible', textOverflow: 'unset' }}
                  >
                    {language === 'hi' && item.title_hi ? item.title_hi : item.title}
                  </Link>
                </span>
                {index !== arr.length - 1 && (
                  <span className="mx-2 text-white text-lg md:text-xl select-none font-normal align-middle">|</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes breaking-marquee-modern {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .breaking-marquee-track-modern {
          display: flex;
          width: max-content;
          animation: breaking-marquee-modern 60s linear infinite;
        }
        .breaking-marquee-track-modern:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};
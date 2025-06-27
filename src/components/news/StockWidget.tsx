import { useEffect, useRef, memo, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const FULL_WIDGET_URL = 'https://www.tradingview.com/markets/indices/quotes-all/';

const StockWidget = () => {
  const container = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const [showChart, setShowChart] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setShowChart(window.innerWidth >= 768); // md is 768px
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = '';

    // Create the widget container with the correct class name
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container__widget';
    container.current.appendChild(widgetContainer);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
    script.type = 'text/javascript';
    script.async = true;
    
    // Add error handling
    script.onerror = () => {
      console.warn('TradingView widget failed to load');
      if (container.current) {
        container.current.innerHTML = `
          <div class="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div class="text-center">
              <p class="text-gray-600 dark:text-gray-400 mb-2">Market data temporarily unavailable</p>
              <a href="${FULL_WIDGET_URL}" target="_blank" rel="noopener noreferrer" 
                 class="text-blue-600 dark:text-blue-400 hover:underline">
                View on TradingView
              </a>
            </div>
          </div>
        `;
      }
    };
    
    script.innerHTML = JSON.stringify({
        "colorTheme": theme,
        "dateRange": "12M",
        "showChart": showChart,
        "locale": "in",
        "largeChartUrl": "",
        "isTransparent": false,
        "showSymbolLogo": true,
        "showFloatingTooltip": false,
        "width": "100%",
        "height": "100%",
        "tabs": [
          {
            "title": "Indices",
            "symbols": [
              { "s": "BSE:SENSEX", "d": "SENSEX" },
              { "s": "NSE:NIFTY50", "d": "Nifty 50" }
            ],
            "originalTitle": "Indices"
          },
          {
            "title": "Stocks",
            "symbols": [
              { "s": "BSE:RELIANCE" },
              { "s": "BSE:TCS" },
              { "s": "BSE:HDFCBANK" },
              { "s": "BSE:INFY" },
              { "s": "BSE:ICICIBANK" }
            ],
            "originalTitle": "Stocks"
          },
          {
            "title": "Global",
            "symbols": [
              { "s": "NASDAQ:AAPL", "d": "Apple" },
              { "s": "NASDAQ:GOOGL", "d": "Google" },
              { "s": "NASDAQ:TSLA", "d": "Tesla" }
            ],
            "originalTitle": "Futures"
          }
        ]
      });
      container.current.appendChild(script);
  }, [theme, showChart]);

  return (
    <div className="overflow-x-auto px-1 sm:px-0">
      <div ref={container} className="h-[350px] md:h-[450px] w-[600px] max-w-full touch-action-pan-y mx-auto">
      </div>
    </div>
  );
};

export default memo(StockWidget);
import React, { useEffect, useState } from 'react';

const API_KEY = '87a6cd20bcmsh59e05c5540d3ce2p1d0111jsna03a9afd7447';
const API_HOST = 'yahoo-finance15.p.rapidapi.com';

const TICKERS = [
  { ticker: 'NSEI', name: 'NIFTY 50', type: 'INDEX' },
  { ticker: 'BSESN', name: 'SENSEX', type: 'INDEX' },
  { ticker: 'INR=X', name: 'USD/INR', type: 'CURRENCY' },
  { ticker: 'GC=F', name: 'Gold', type: 'COMMODITY' },
  { ticker: 'SI=F', name: 'Silver', type: 'COMMODITY' },
  { ticker: 'AAPL', name: 'Apple', type: 'STOCKS' },
  { ticker: 'RELIANCE.NS', name: 'Reliance', type: 'STOCKS' },
];

interface StockData {
  symbol: string;
  name: string;
  price: string;
  change: string;
  percent_change: string;
  isUp: boolean;
}

export const StockPriceWidget: React.FC = () => {
  const [data, setData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const results: StockData[] = [];
        for (const t of TICKERS) {
          const url = `https://yahoo-finance15.p.rapidapi.com/api/v1/markets/quote?ticker=${encodeURIComponent(t.ticker)}&type=${t.type}`;
          const res = await fetch(url, {
            headers: {
              'x-rapidapi-host': API_HOST,
              'x-rapidapi-key': API_KEY,
            },
          });
          const response = await res.json();
          const d = response.body;
          if (!d || !d.primaryData) continue;
          results.push({
            symbol: d.symbol,
            name: t.name,
            price: d.primaryData.lastSalePrice?.replace('$', '') ?? '-',
            change: d.primaryData.netChange ?? '0',
            percent_change: d.primaryData.percentageChange?.replace('%', '') ?? '0.00',
            isUp: d.primaryData.deltaIndicator === 'up',
          });
        }
        setData(results);
      } catch (e) {
        setError('Failed to fetch stock data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every 1 min
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-black rounded-2xl shadow-lg p-4 w-full max-w-md mx-auto">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        Markets
      </h3>
      {loading && <div className="text-center py-8 text-gray-500">Loading...</div>}
      {error && <div className="text-center py-8 text-red-500">{error}</div>}
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {data.map(stock => (
          <div key={stock.symbol} className="flex items-center justify-between py-2">
            <div className="flex flex-col">
              <span className="font-semibold text-black dark:text-white text-sm">{stock.name}</span>
              <span className={`text-xs ${stock.isUp ? 'text-green-600' : 'text-red-600'} font-medium`}>{stock.isUp ? 'Rising fast' : 'Dropping fast'}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className={`font-bold text-sm ${stock.isUp ? 'text-green-700' : 'text-red-700'}`}>{stock.percent_change}%</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{stock.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-right mt-4">
        <a href="https://www.nseindia.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-medium">See market</a>
      </div>
    </div>
  );
}; 
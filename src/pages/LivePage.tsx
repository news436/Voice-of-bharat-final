import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LiveStreamSection } from '@/components/news/LiveStreamSection';
import { useLanguage } from '@/contexts/LanguageContext';
import { Radio } from 'lucide-react';
import { AdSlot } from '@/components/news/AdSlot';

const LivePage = () => {
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: liveStreams } = await supabase
        .from('live_streams')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      setStreams(liveStreams || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black/95 flex flex-col">
      <main className="flex-1 max-w-7xl mx-auto px-2 sm:px-6 py-8">
        {/* Ad Slot 5 - Live pages top banner */}
        <div className="mb-6">
          <AdSlot slotNumber={5} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white mb-10 flex items-center gap-2">
              <span className="block w-2 h-8 bg-red-600 rounded-full mr-2" />
              {t('live.streams') || 'Live Streams'}
            </h1>
            {loading ? (
              <div className="flex justify-center items-center py-24">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
                <span className="ml-4 text-lg text-gray-600 dark:text-gray-300">{t('loading') || 'Loading live streams...'}</span>
              </div>
            ) : streams.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Radio className="h-12 w-12 text-red-600 animate-pulse mb-4" />
                <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">{t('live.no_streams') || 'No live streams are active right now.'}</h2>
                <p className="text-gray-500 dark:text-gray-400">{t('live.check_back') || 'Check back later for live news and events.'}</p>
              </div>
            ) : (
              <LiveStreamSection streams={streams} />
            )}
          </div>
          <div className="lg:col-span-1 space-y-6">
            {/* Ad Slot 6 - Live news pages sidebar */}
            <div>
              <AdSlot slotNumber={6} />
            </div>
          </div>
        </div>
        
        {/* Ad Slot 7 - Live pages bottom banner */}
        <div className="mt-8">
          <AdSlot slotNumber={7} />
        </div>
      </main>
    </div>
  );
};

export default LivePage;
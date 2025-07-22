import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AdPerformanceChartProps {
  slotNumber: number;
}

interface DailyStats {
  date: string;
  impressions: number;
  clicks: number;
}

export const AdPerformanceChart = ({ slotNumber }: AdPerformanceChartProps) => {
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDailyStats = async () => {
      setLoading(true);
      
      // Get data for the last 7 days
      const endDate = new Date();
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const { data: analyticsData } = await supabase
        .from('analytics')
        .select('event_type, created_at')
        .or(`custom_data->>'slot_number'.eq.${slotNumber}`)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Group by date
      const statsByDate: { [key: string]: DailyStats } = {};
      
      // Initialize all dates
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        statsByDate[dateStr] = {
          date: dateStr,
          impressions: 0,
          clicks: 0
        };
      }

      // Count events by date
      analyticsData?.forEach(item => {
        const dateStr = new Date(item.created_at).toISOString().split('T')[0];
        if (statsByDate[dateStr]) {
          if (item.event_type === 'ad_impression') {
            statsByDate[dateStr].impressions++;
          } else if (item.event_type === 'ad_click') {
            statsByDate[dateStr].clicks++;
          }
        }
      });

      setDailyStats(Object.values(statsByDate));
      setLoading(false);
    };

    fetchDailyStats();
  }, [slotNumber]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Performance (7 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxImpressions = Math.max(...dailyStats.map(d => d.impressions), 1);
  const maxClicks = Math.max(...dailyStats.map(d => d.clicks), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Performance (7 days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {dailyStats.map((day, index) => (
            <div key={day.date} className="flex items-center space-x-2">
              <div className="text-xs text-gray-500 w-16">
                {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className="flex-1 flex space-x-1">
                <div 
                  className="bg-blue-200 rounded-sm"
                  style={{ 
                    width: `${(day.impressions / maxImpressions) * 100}%`,
                    height: '12px'
                  }}
                  title={`${day.impressions} impressions`}
                />
                <div 
                  className="bg-green-200 rounded-sm"
                  style={{ 
                    width: `${(day.clicks / maxClicks) * 100}%`,
                    height: '12px'
                  }}
                  title={`${day.clicks} clicks`}
                />
              </div>
              <div className="text-xs text-gray-600 w-16 text-right">
                {day.impressions}/{day.clicks}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center space-x-4 mt-3 text-xs text-gray-500">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-200 rounded mr-1"></div>
            Impressions
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-200 rounded mr-1"></div>
            Clicks
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 
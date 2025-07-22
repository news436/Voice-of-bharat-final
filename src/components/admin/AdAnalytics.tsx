import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, MousePointer, TrendingUp } from 'lucide-react';

interface AdAnalyticsProps {
  slotNumber: number;
}

interface AdStats {
  impressions: number;
  clicks: number;
  ctr: number;
  enabled: boolean;
  ad_type: string;
}

export const AdAnalytics = ({ slotNumber }: AdAnalyticsProps) => {
  const [stats, setStats] = useState<AdStats>({
    impressions: 0,
    clicks: 0,
    ctr: 0,
    enabled: false,
    ad_type: 'html'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdStats = async () => {
      setLoading(true);
      
      // Fetch ad status
      const { data: adData } = await supabase
        .from('ads')
        .select('enabled, ad_type')
        .eq('slot_number', slotNumber)
        .single();

      // Fetch analytics data for this ad slot
      const { data: analyticsData } = await supabase
        .from('analytics')
        .select('event_type, created_at')
        .or(`custom_data->>'slot_number'.eq.${slotNumber}`)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

      // Calculate stats from analytics data
      const impressions = analyticsData?.filter(item => item.event_type === 'ad_impression').length || 0;
      const clicks = analyticsData?.filter(item => item.event_type === 'ad_click').length || 0;
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      
      const realStats = {
        impressions,
        clicks,
        ctr,
        enabled: adData?.enabled || false,
        ad_type: adData?.ad_type || 'html'
      };
      
      setStats(realStats);
      setLoading(false);
    };

    fetchAdStats();
  }, [slotNumber]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Ad Slot {slotNumber} Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          <span>Ad Slot {slotNumber} Analytics</span>
          <Badge variant={stats.enabled ? "default" : "secondary"}>
            {stats.enabled ? "Active" : "Inactive"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Eye className="h-3 w-3 text-blue-500" />
            </div>
            <div className="font-semibold">{stats.impressions.toLocaleString()}</div>
            <div className="text-gray-500">Impressions</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <MousePointer className="h-3 w-3 text-green-500" />
            </div>
            <div className="font-semibold">{stats.clicks.toLocaleString()}</div>
            <div className="text-gray-500">Clicks</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-3 w-3 text-purple-500" />
            </div>
            <div className="font-semibold">{stats.ctr.toFixed(2)}%</div>
            <div className="text-gray-500">CTR</div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500">
          <div>Type: {stats.ad_type === 'html' ? 'HTML/Code' : 'Image'}</div>
          <div>Last updated: {new Date().toLocaleDateString()}</div>
        </div>
      </CardContent>
    </Card>
  );
}; 
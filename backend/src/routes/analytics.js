import express from 'express';
import { supabase } from '../config/database.js';

const router = express.Router();

// Track page view/event
router.post('/track', async (req, res) => {
  try {
    const { article_id, event_type, user_ip, user_agent, referrer } = req.body;
    
    if (!event_type) {
      return res.status(400).json({
        success: false,
        error: 'Event type is required'
      });
    }
    
    const { data, error } = await supabase
      .from('analytics')
      .insert([{
        article_id,
        event_type,
        user_ip,
        user_agent,
        referrer
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Event tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track event'
    });
  }
});

// Get analytics dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000).toISOString();
    
    // Get total articles
    const { count: totalArticles } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published');
    
    // Get breaking news count
    const { count: breakingNews } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('is_breaking', true);
    
    // Get recent analytics
    const { data: recentAnalytics } = await supabase
      .from('analytics')
      .select('*')
      .gte('created_at', startDate)
      .order('created_at', { ascending: false });
    
    // Get popular articles (by view count)
    const { data: popularArticles } = await supabase
      .from('analytics')
      .select(`
        article_id,
        articles(title, slug)
      `)
      .eq('event_type', 'page_view')
      .gte('created_at', startDate)
      .order('created_at', { ascending: false });
    
    // Get category breakdown
    const { data: categoriesData } = await supabase
      .from('categories')
      .select(`
        name,
        articles(count)
      `);
    
    // Generate views data for chart
    const viewsData = [];
    for (let i = parseInt(period) - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString();
      
      const dayViews = recentAnalytics?.filter(a => 
        a.created_at >= dayStart && a.created_at < dayEnd && a.event_type === 'page_view'
      ).length || 0;
      
      viewsData.push({
        name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        total: dayViews
      });
    }
    
    // Count unique users (simplified - by IP)
    const uniqueIPs = new Set(recentAnalytics?.map(a => a.user_ip).filter(Boolean) || []);
    
    res.json({
      success: true,
      data: {
        totalArticles: totalArticles || 0,
        breakingNews: breakingNews || 0,
        totalViews: recentAnalytics?.filter(a => a.event_type === 'page_view').length || 0,
        totalUsers: uniqueIPs.size,
        categories: categoriesData?.map(c => ({ 
          name: c.name, 
          value: c.articles?.[0]?.count || 0 
        })) || [],
        viewsData,
        popularArticles: popularArticles?.slice(0, 5) || [],
        recentActivity: recentAnalytics?.slice(0, 10) || []
      }
    });
  } catch (error) {
    console.error('Error fetching analytics dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics dashboard'
    });
  }
});

// Get analytics by date range
router.get('/range', async (req, res) => {
  try {
    const { start_date, end_date, event_type } = req.query;
    
    let query = supabase
      .from('analytics')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (start_date) {
      query = query.gte('created_at', start_date);
    }
    
    if (end_date) {
      query = query.lte('created_at', end_date);
    }
    
    if (event_type) {
      query = query.eq('event_type', event_type);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      total: count || data.length
    });
  } catch (error) {
    console.error('Error fetching analytics by range:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics by range'
    });
  }
});

// Get article analytics
router.get('/article/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;
    const { period = '30' } = req.query;
    const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('analytics')
      .select('*')
      .eq('article_id', articleId)
      .gte('created_at', startDate)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const views = data?.filter(a => a.event_type === 'page_view').length || 0;
    const uniqueViews = new Set(data?.filter(a => a.event_type === 'page_view').map(a => a.user_ip)).size;
    
    res.json({
      success: true,
      data: {
        totalViews: views,
        uniqueViews,
        events: data || []
      }
    });
  } catch (error) {
    console.error('Error fetching article analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch article analytics'
    });
  }
});

export default router; 
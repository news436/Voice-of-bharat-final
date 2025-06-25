import express from 'express';
import { supabase } from '../config/database.js';

const router = express.Router();

// Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    
    const { data, error } = await supabase
      .from('newsletter_subscriptions')
      .insert([{ 
        email, 
        name: name || null,
        is_active: true 
      }])
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({
          success: false,
          error: 'Email already subscribed'
        });
      }
      throw error;
    }
    
    res.json({
      success: true,
      data,
      message: 'Successfully subscribed to newsletter'
    });
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to subscribe to newsletter'
    });
  }
});

// Unsubscribe from newsletter
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    
    const { data, error } = await supabase
      .from('newsletter_subscriptions')
      .update({ is_active: false })
      .eq('email', email)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Email not found'
        });
      }
      throw error;
    }
    
    res.json({
      success: true,
      data,
      message: 'Successfully unsubscribed from newsletter'
    });
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unsubscribe from newsletter'
    });
  }
});

// Get all newsletter subscriptions (admin only)
router.get('/subscriptions', async (req, res) => {
  try {
    const { page = 1, limit = 50, active } = req.query;
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('newsletter_subscriptions')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (active === 'true') {
      query = query.eq('is_active', true);
    } else if (active === 'false') {
      query = query.eq('is_active', false);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || data.length,
        pages: Math.ceil((count || data.length) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching newsletter subscriptions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch newsletter subscriptions'
    });
  }
});

// Get subscription statistics
router.get('/stats', async (req, res) => {
  try {
    const { data: totalSubscriptions } = await supabase
      .from('newsletter_subscriptions')
      .select('*', { count: 'exact', head: true });
    
    const { data: activeSubscriptions } = await supabase
      .from('newsletter_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    const { data: recentSubscriptions } = await supabase
      .from('newsletter_subscriptions')
      .select('created_at')
      .eq('is_active', true)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days
    
    res.json({
      success: true,
      data: {
        total: totalSubscriptions || 0,
        active: activeSubscriptions || 0,
        recent: recentSubscriptions?.length || 0
      }
    });
  } catch (error) {
    console.error('Error fetching newsletter stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch newsletter statistics'
    });
  }
});

export default router; 
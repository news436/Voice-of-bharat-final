import express from 'express';
import { supabase } from '../config/database.js';

const router = express.Router();

// Get user profile by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Profile not found'
        });
      }
      throw error;
    }
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
});

// Update user profile
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, avatar_url, role } = req.body;
    
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name,
        avatar_url,
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

// Get all profiles (admin only)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, role } = req.query;
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (role) {
      query = query.eq('role', role);
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
    console.error('Error fetching profiles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profiles'
    });
  }
});

// Get user statistics
router.get('/stats', async (req, res) => {
  try {
    const { data: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    const { data: admins } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin');
    
    const { data: editors } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'editor');
    
    const { data: authors } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'author');
    
    const { data: recentUsers } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days
    
    res.json({
      success: true,
      data: {
        total: totalUsers || 0,
        admins: admins || 0,
        editors: editors || 0,
        authors: authors || 0,
        recent: recentUsers?.length || 0
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user statistics'
    });
  }
});

export default router; 
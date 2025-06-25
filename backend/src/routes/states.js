import express from 'express';
import { supabase } from '../config/database.js';

const router = express.Router();

// Get all states
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('states')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch states'
    });
  }
});

// Get state by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const { data, error } = await supabase
      .from('states')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'State not found'
        });
      }
      throw error;
    }
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching state:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch state'
    });
  }
});

// Get articles by state
router.get('/:slug/articles', async (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // First get the state
    const { data: state } = await supabase
      .from('states')
      .select('id')
      .eq('slug', slug)
      .single();
    
    if (!state) {
      return res.status(404).json({
        success: false,
        error: 'State not found'
      });
    }
    
    // Get articles for this state
    const { data, error, count } = await supabase
      .from('articles')
      .select(`
        *,
        categories(name, slug),
        states(name),
        profiles(full_name, avatar_url)
      `)
      .eq('state_id', state.id)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
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
    console.error('Error fetching state articles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch state articles'
    });
  }
});

// Get videos by state
router.get('/:slug/videos', async (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // First get the state
    const { data: state } = await supabase
      .from('states')
      .select('id')
      .eq('slug', slug)
      .single();
    
    if (!state) {
      return res.status(404).json({
        success: false,
        error: 'State not found'
      });
    }
    
    // Get videos for this state
    const { data, error, count } = await supabase
      .from('videos')
      .select(`
        *,
        categories(name),
        states(name)
      `)
      .eq('state_id', state.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
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
    console.error('Error fetching state videos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch state videos'
    });
  }
});

export default router; 
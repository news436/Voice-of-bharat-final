import express from 'express';
import { supabase } from '../config/database.js';

const router = express.Router();

// Get all videos
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, state, filter, sort = 'newest' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('videos')
      .select(`
        *,
        categories(name, slug),
        states(name, slug)
      `)
      .order('created_at', { ascending: sort === 'oldest' })
      .range(offset, offset + limit - 1);
    
    if (category) {
      query = query.eq('categories.slug', category);
    }
    
    if (state) {
      query = query.eq('states.slug', state);
    }
    
    if (filter === 'featured') {
      query = query.eq('is_featured', true);
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
    console.error('Error fetching videos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch videos'
    });
  }
});

// Get video by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        categories(name, slug),
        states(name, slug)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Video not found'
        });
      }
      throw error;
    }
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch video'
    });
  }
});

// Get related videos
router.get('/:id/related', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 5 } = req.query;
    
    // First get the current video to find its category
    const { data: currentVideo } = await supabase
      .from('videos')
      .select('category_id, id')
      .eq('id', id)
      .single();
    
    if (!currentVideo) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }
    
    // Get related videos from the same category
    const { data, error } = await supabase
      .from('videos')
      .select(`
        id, title, title_hi, description, description_hi,
        video_url, video_type, thumbnail_url, created_at,
        categories(name, slug),
        states(name)
      `)
      .eq('category_id', currentVideo.category_id)
      .neq('id', currentVideo.id)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));
    
    if (error) throw error;
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching related videos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch related videos'
    });
  }
});

// Search videos
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }
    
    const { data, error, count } = await supabase
      .from('videos')
      .select(`
        id, title, title_hi, description, description_hi,
        video_url, video_type, thumbnail_url, created_at,
        categories(name, slug),
        states(name)
      `)
      .or(`title.ilike.%${q}%,description.ilike.%${q}%,title_hi.ilike.%${q}%,description_hi.ilike.%${q}%`)
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
    console.error('Error searching videos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search videos'
    });
  }
});

export default router; 
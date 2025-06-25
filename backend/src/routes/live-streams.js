import express from 'express';
import { supabase } from '../config/database.js';

const router = express.Router();

// Get all live streams
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, active } = req.query;
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('live_streams')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (active === 'true') {
      query = query.eq('is_active', true);
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
    console.error('Error fetching live streams:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch live streams'
    });
  }
});

// Get active live streams
router.get('/active', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('live_streams')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching active live streams:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active live streams'
    });
  }
});

// Get live stream by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('live_streams')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Live stream not found'
        });
      }
      throw error;
    }
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching live stream:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch live stream'
    });
  }
});

export default router; 
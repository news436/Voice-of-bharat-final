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

// Create new live stream
router.post('/', async (req, res) => {
  try {
    const {
      title,
      title_hi,
      description,
      description_hi,
      stream_url,
      thumbnail_url,
      is_active = false,
      scheduled_at,
      category_id,
      state_id
    } = req.body;

    // Validate required fields
    if (!title || !stream_url) {
      return res.status(400).json({
        success: false,
        error: 'Title and stream URL are required'
      });
    }

    const streamData = {
      title,
      title_hi,
      description,
      description_hi,
      stream_url,
      thumbnail_url,
      is_active,
      scheduled_at,
      category_id,
      state_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('live_streams')
      .insert(streamData)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data,
      message: 'Live stream created successfully'
    });
  } catch (error) {
    console.error('Error creating live stream:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create live stream'
    });
  }
});

// Update live stream
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('live_streams')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data,
      message: 'Live stream updated successfully'
    });
  } catch (error) {
    console.error('Error updating live stream:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update live stream'
    });
  }
});

// Delete live stream
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('live_streams')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Live stream deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting live stream:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete live stream'
    });
  }
});

// Toggle live stream status
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;

    // Get current status
    const { data: currentStream } = await supabase
      .from('live_streams')
      .select('is_active')
      .eq('id', id)
      .single();

    if (!currentStream) {
      return res.status(404).json({
        success: false,
        error: 'Live stream not found'
      });
    }

    // Toggle status
    const { data, error } = await supabase
      .from('live_streams')
      .update({ 
        is_active: !currentStream.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data,
      message: `Live stream ${data.is_active ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error toggling live stream status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle live stream status'
    });
  }
});

export default router; 
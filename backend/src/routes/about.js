import express from 'express';
import { supabase } from '../config/database.js';

const router = express.Router();

// Get about us content
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('about_us')
      .select('*')
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'About us content not found'
        });
      }
      throw error;
    }
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching about us content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch about us content'
    });
  }
});

// Update about us content (admin only)
router.put('/', async (req, res) => {
  try {
    const { short_description, detailed_content, hero_image_url, team_image_url } = req.body;
    
    const { data, error } = await supabase
      .from('about_us')
      .upsert([{
        short_description,
        detailed_content,
        hero_image_url,
        team_image_url,
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'About us content updated successfully'
    });
  } catch (error) {
    console.error('Error updating about us content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update about us content'
    });
  }
});

export default router; 
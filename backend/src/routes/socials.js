import express from 'express';
import { supabase } from '../config/database.js';

const router = express.Router();

// Get social media links
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('socials')
      .select('*')
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Social media links not found'
        });
      }
      throw error;
    }
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching social media links:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch social media links'
    });
  }
});

// Update social media links (admin only)
router.put('/', async (req, res) => {
  try {
    const { 
      facebook_url, 
      twitter_url, 
      youtube_url, 
      instagram_url,
      linkedin_url,
      telegram_url
    } = req.body;
    
    const { data, error } = await supabase
      .from('socials')
      .upsert([{
        facebook_url,
        twitter_url,
        youtube_url,
        instagram_url,
        linkedin_url,
        telegram_url,
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Social media links updated successfully'
    });
  } catch (error) {
    console.error('Error updating social media links:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update social media links'
    });
  }
});

export default router; 
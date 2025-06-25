import express from 'express';
import { supabase } from '../config/database.js';

const router = express.Router();

// Get all ads
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .order('slot_number');
    
    if (error) throw error;
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching ads:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ads'
    });
  }
});

// Get ad by slot number
router.get('/slot/:slotNumber', async (req, res) => {
  try {
    const { slotNumber } = req.params;
    
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('slot_number', parseInt(slotNumber))
      .eq('enabled', true)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Ad not found or not enabled'
        });
      }
      throw error;
    }
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching ad:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ad'
    });
  }
});

// Create or update ad
router.put('/slot/:slotNumber', async (req, res) => {
  try {
    const { slotNumber } = req.params;
    const { html_code, image_url, redirect_url, ad_type, enabled } = req.body;
    
    const { data, error } = await supabase
      .from('ads')
      .upsert([{
        slot_number: parseInt(slotNumber),
        html_code,
        image_url,
        redirect_url,
        ad_type: ad_type || 'html',
        enabled: enabled !== undefined ? enabled : true,
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Ad updated successfully'
    });
  } catch (error) {
    console.error('Error updating ad:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update ad'
    });
  }
});

// Toggle ad status
router.patch('/slot/:slotNumber/toggle', async (req, res) => {
  try {
    const { slotNumber } = req.params;
    
    // First get current status
    const { data: currentAd } = await supabase
      .from('ads')
      .select('enabled')
      .eq('slot_number', parseInt(slotNumber))
      .single();
    
    if (!currentAd) {
      return res.status(404).json({
        success: false,
        error: 'Ad not found'
      });
    }
    
    const { data, error } = await supabase
      .from('ads')
      .update({ 
        enabled: !currentAd.enabled,
        updated_at: new Date().toISOString()
      })
      .eq('slot_number', parseInt(slotNumber))
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: `Ad ${data.enabled ? 'enabled' : 'disabled'} successfully`
    });
  } catch (error) {
    console.error('Error toggling ad status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle ad status'
    });
  }
});

// Delete ad
router.delete('/slot/:slotNumber', async (req, res) => {
  try {
    const { slotNumber } = req.params;
    
    const { error } = await supabase
      .from('ads')
      .delete()
      .eq('slot_number', parseInt(slotNumber));
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Ad deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting ad:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete ad'
    });
  }
});

// Get ad statistics
router.get('/stats', async (req, res) => {
  try {
    const { data: totalAds } = await supabase
      .from('ads')
      .select('*', { count: 'exact', head: true });
    
    const { data: enabledAds } = await supabase
      .from('ads')
      .select('*', { count: 'exact', head: true })
      .eq('enabled', true);
    
    const { data: htmlAds } = await supabase
      .from('ads')
      .select('*', { count: 'exact', head: true })
      .eq('ad_type', 'html')
      .eq('enabled', true);
    
    const { data: imageAds } = await supabase
      .from('ads')
      .select('*', { count: 'exact', head: true })
      .eq('ad_type', 'image')
      .eq('enabled', true);
    
    res.json({
      success: true,
      data: {
        total: totalAds || 0,
        enabled: enabledAds || 0,
        disabled: (totalAds || 0) - (enabledAds || 0),
        htmlAds: htmlAds || 0,
        imageAds: imageAds || 0
      }
    });
  } catch (error) {
    console.error('Error fetching ad stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ad statistics'
    });
  }
});

export default router; 
import express from 'express';
import { supabase } from '../config/database.js';

const router = express.Router();

// Get support details
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('support_details')
      .select('*')
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Support details not found'
        });
      }
      throw error;
    }
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching support details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch support details'
    });
  }
});

// Update support details (admin only)
router.put('/', async (req, res) => {
  try {
    const { 
      description, 
      description_hi, 
      account_holder_name, 
      account_holder_name_hi,
      account_number, 
      ifsc_code, 
      bank_name, 
      qr_code_image_url, 
      upi_id 
    } = req.body;
    
    const { data, error } = await supabase
      .from('support_details')
      .upsert([{
        description,
        description_hi,
        account_holder_name,
        account_holder_name_hi,
        account_number,
        ifsc_code,
        bank_name,
        qr_code_image_url,
        upi_id,
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Support details updated successfully'
    });
  } catch (error) {
    console.error('Error updating support details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update support details'
    });
  }
});

export default router; 
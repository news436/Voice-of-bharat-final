const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');

// Get all team members
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('about_us_team_members')
      .select('*')
      .order('ordering', { ascending: true });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch team members'
    });
  }
});

// Get team member by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('about_us_team_members')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Team member not found'
      });
    }
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching team member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch team member'
    });
  }
});

// Create new team member (admin only)
router.post('/', async (req, res) => {
  try {
    const { name, name_hi, role, role_hi, image_url, ordering } = req.body;
    
    // Validate required fields
    if (!name || !role) {
      return res.status(400).json({
        success: false,
        error: 'Name and role are required'
      });
    }
    
    const { data, error } = await supabase
      .from('about_us_team_members')
      .insert([{
        name,
        name_hi,
        role,
        role_hi,
        image_url,
        ordering: ordering || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json({
      success: true,
      data,
      message: 'Team member created successfully'
    });
  } catch (error) {
    console.error('Error creating team member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create team member'
    });
  }
});

// Update team member (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, name_hi, role, role_hi, image_url, ordering } = req.body;
    
    const updateData = {
      updated_at: new Date().toISOString()
    };
    
    if (name !== undefined) updateData.name = name;
    if (name_hi !== undefined) updateData.name_hi = name_hi;
    if (role !== undefined) updateData.role = role;
    if (role_hi !== undefined) updateData.role_hi = role_hi;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (ordering !== undefined) updateData.ordering = ordering;
    
    const { data, error } = await supabase
      .from('about_us_team_members')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Team member not found'
      });
    }
    
    res.json({
      success: true,
      data,
      message: 'Team member updated successfully'
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update team member'
    });
  }
});

// Delete team member (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('about_us_team_members')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Team member deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete team member'
    });
  }
});

// Bulk update team members (admin only)
router.put('/bulk/update', async (req, res) => {
  try {
    const { teamMembers } = req.body;
    
    if (!Array.isArray(teamMembers)) {
      return res.status(400).json({
        success: false,
        error: 'teamMembers must be an array'
      });
    }
    
    // Delete all existing team members
    await supabase
      .from('about_us_team_members')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    // Insert new team members
    if (teamMembers.length > 0) {
      const membersToInsert = teamMembers.map((member, index) => ({
        name: member.name,
        name_hi: member.name_hi,
        role: member.role,
        role_hi: member.role_hi,
        image_url: member.image_url,
        ordering: index,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      const { data, error } = await supabase
        .from('about_us_team_members')
        .insert(membersToInsert)
        .select();
      
      if (error) throw error;
      
      res.json({
        success: true,
        data,
        message: 'Team members updated successfully'
      });
    } else {
      res.json({
        success: true,
        data: [],
        message: 'All team members removed'
      });
    }
  } catch (error) {
    console.error('Error bulk updating team members:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update team members'
    });
  }
});

// Reorder team members (admin only)
router.put('/reorder', async (req, res) => {
  try {
    const { memberIds } = req.body;
    
    if (!Array.isArray(memberIds)) {
      return res.status(400).json({
        success: false,
        error: 'memberIds must be an array'
      });
    }
    
    const updates = memberIds.map((id, index) => ({
      id,
      ordering: index,
      updated_at: new Date().toISOString()
    }));
    
    const { data, error } = await supabase
      .from('about_us_team_members')
      .upsert(updates)
      .select();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Team members reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering team members:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reorder team members'
    });
  }
});

module.exports = router; 
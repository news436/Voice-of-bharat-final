import express from 'express';
import { supabase } from '../config/database.js';

const router = express.Router();

// Get all published articles
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, state } = req.query;
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('articles')
      .select(`
        *,
        categories(name, slug),
        states(name, slug),
        profiles(full_name, avatar_url)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (category) {
      // First get the category ID by slug
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single();
      
      if (categoryData) {
        query = query.eq('category_id', categoryData.id);
      }
    }
    
    if (state) {
      // First get the state ID by slug
      const { data: stateData } = await supabase
        .from('states')
        .select('id')
        .eq('slug', state)
        .single();
      
      if (stateData) {
        query = query.eq('state_id', stateData.id);
      }
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
    console.error('Error fetching articles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch articles'
    });
  }
});

// Get breaking news articles
router.get('/breaking', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        categories(name, slug),
        states(name),
        profiles(full_name, avatar_url)
      `)
      .eq('is_breaking', true)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(parseInt(limit));
    
    if (error) throw error;
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching breaking news:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch breaking news'
    });
  }
});

// Get featured articles
router.get('/featured', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        categories(name, slug),
        states(name),
        profiles(full_name, avatar_url)
      `)
      .eq('is_featured', true)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(parseInt(limit));
    
    if (error) throw error;
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching featured articles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured articles'
    });
  }
});

// Get article by ID
router.get('/id/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        categories(name, slug),
        states(name),
        profiles(full_name, avatar_url)
      `)
      .eq('id', id)
      .eq('status', 'published')
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Article not found'
        });
      }
      throw error;
    }
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching article by ID:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch article'
    });
  }
});

// Search articles (must come before /:slug to avoid conflicts)
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
      .from('articles')
      .select(`
        id, slug, title, title_hi, summary, summary_hi,
        featured_image_url, published_at,
        categories(name, slug),
        profiles(full_name)
      `)
      .or(`title.ilike.%${q}%,summary.ilike.%${q}%,title_hi.ilike.%${q}%,summary_hi.ilike.%${q}%`)
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
    console.error('Error searching articles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search articles'
    });
  }
});

// Get article by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        categories(name, slug),
        states(name),
        profiles(full_name, avatar_url)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Article not found'
        });
      }
      throw error;
    }
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch article'
    });
  }
});

// Get related articles
router.get('/:slug/related', async (req, res) => {
  try {
    const { slug } = req.params;
    const { limit = 5 } = req.query;
    
    // First get the current article to find its category
    const { data: currentArticle } = await supabase
      .from('articles')
      .select('category_id, id')
      .eq('slug', slug)
      .single();
    
    if (!currentArticle) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }
    
    // Get related articles from the same category
    const { data, error } = await supabase
      .from('articles')
      .select(`
        id, slug, title, title_hi, summary, summary_hi,
        featured_image_url, published_at,
        categories(name, slug),
        profiles(full_name)
      `)
      .eq('category_id', currentArticle.category_id)
      .neq('id', currentArticle.id)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(parseInt(limit));
    
    if (error) throw error;
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching related articles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch related articles'
    });
  }
});

// Create new article
router.post('/', async (req, res) => {
  try {
    const {
      title,
      title_hi,
      content,
      content_hi,
      summary,
      summary_hi,
      category_id,
      state_id,
      featured_image_url,
      youtube_video_url,
      facebook_video_url,
      is_breaking = false,
      is_featured = false,
      status = 'draft',
      author_id
    } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Title and content are required'
      });
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const articleData = {
      title,
      title_hi,
      content,
      content_hi,
      summary,
      summary_hi,
      slug,
      category_id,
      state_id,
      featured_image_url,
      youtube_video_url,
      facebook_video_url,
      is_breaking,
      is_featured,
      status,
      author_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // If status is published, set published_at
    if (status === 'published') {
      articleData.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('articles')
      .insert(articleData)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data,
      message: 'Article created successfully'
    });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create article'
    });
  }
});

// Update article
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    // If status is being changed to published, set published_at
    if (updateData.status === 'published' && !updateData.published_at) {
      updateData.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data,
      message: 'Article updated successfully'
    });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update article'
    });
  }
});

// Delete article
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete article'
    });
  }
});

export default router; 
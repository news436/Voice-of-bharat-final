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
        states(name),
        profiles(full_name, avatar_url)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (category) {
      query = query.eq('categories.slug', category);
    }
    
    if (state) {
      query = query.eq('states.slug', state);
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

// Search articles
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

export default router; 
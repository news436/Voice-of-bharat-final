import express from 'express';
import { supabase } from '../config/database.js';

const router = express.Router();

// Get all published articles
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, state, breaking_news, featured } = req.query;
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
      .order('published_at', { ascending: false });

    // Apply filters based on query parameters
    if (breaking_news === 'true') {
      query = query.eq('is_breaking', true);
    }
    
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }
    
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
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
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
    console.log('📝 Updating article:', id, 'with data:', req.body);
    
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

    if (error) {
      console.error('❌ Error updating article:', error);
      throw error;
    }

    console.log('✅ Article updated successfully:', data);
    res.json({
      success: true,
      data,
      message: 'Article updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating article:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update article'
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

// Increment article view count
router.post('/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('articles')
      .update({ views: supabase.raw('views + 1') })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get total and per-article views
router.get('/views/all', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, views');
    if (error) throw error;
    const totalViews = data.reduce((sum, a) => sum + (a.views || 0), 0);
    res.json({ success: true, totalViews, articles: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Social media preview route - returns static HTML with Open Graph meta tags
router.get('/preview/:id', async (req, res) => {
  const { id } = req.params;
  // Fetch article from Supabase
  const { data: article, error } = await supabase
    .from('articles')
    .select(`id, slug, title, title_hi, summary, summary_hi, featured_image_url`)
    .eq('id', id)
    .eq('status', 'published')
    .single();

  if (error || !article) {
    return res.status(404).send('Article not found');
  }

  // --- Fallbacks and variable setup ---
  const title = article.title_hi || article.title || 'Voice of Bharat - Latest News';
  const description = article.summary_hi || article.summary || 'Latest news and updates from Voice of Bharat';
  let imageUrl = article.featured_image_url;
  if (!imageUrl || !imageUrl.startsWith('http')) {
    imageUrl = 'https://voiceofbharat.live/logo.png';
  }
  const articleUrl = `https://voiceofbharat.live/article/${article.slug || article.id}`;

  // --- User-Agent Check ---
  const userAgent = req.headers['user-agent'] || '';
  const isBot = /bot|crawler|spider|crawling|facebookexternalhit|twitterbot|whatsapp|telegram/i.test(userAgent);

  if (isBot) {
    // --- FOR BOTS: Serve a static HTML page with meta tags for the preview ---
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <meta property="og:title" content="${title}" />
        <meta property="og:description" content="${description}" />
        <meta property="og:image" content="${imageUrl}" />
        <meta property="og:url" content="${articleUrl}" />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </head>
      <body>
        <h1>${title}</h1>
        <p>${description}</p>
      </body>
      </html>
    `);
  } else {
    // --- FOR REAL USERS: Immediately redirect to the final article page ---
    res.redirect(302, articleUrl);
  }
});

// Short preview URL route - uses shorter format
router.get('/p/:shortId', async (req, res) => {
  try {
    const { shortId } = req.params;
    
    // Decode the short ID to get the article ID
    // Handle both browser-compatible (btoa) and Node.js Buffer encoding
    let articleId;
    try {
      // First try to decode as base64 (browser-compatible format)
      const decoded = Buffer.from(shortId.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
      articleId = decoded;
    } catch (error) {
      // If base64 fails, treat as direct article ID
      articleId = shortId;
    }
    
    // Fetch article data
    const { data: article, error } = await supabase
      .from('articles')
      .select(`
        id, slug, title, title_hi, summary, summary_hi,
        featured_image_url, published_at,
        categories(name, slug),
        profiles(full_name)
      `)
      .eq('id', articleId)
      .eq('status', 'published')
      .single();
    
    if (error || !article) {
      // Redirect to homepage if article not found
      return res.redirect(302, 'https://voiceofbharat.live');
    }
    
    // Check if this is a social media bot (User-Agent check)
    const userAgent = req.headers['user-agent'] || '';
    const isBot = /bot|crawler|spider|crawling|facebookexternalhit|twitterbot|whatsapp|telegram/i.test(userAgent.toLowerCase());
    
    if (isBot) {
      // For bots, return static HTML with meta tags
      const title = article.title_hi || article.title;
      const description = article.summary_hi || article.summary || 'Latest news and updates from Voice of Bharat';
      const imageUrl = article.featured_image_url || 'https://voiceofbharat.live/logo.png';
      // Add unique parameter to force Facebook to treat as new URL
      const articleUrl = `https://voiceofbharat.live/article/${article.slug}?preview=${article.id}`;
      const author = article.profiles?.full_name || 'Voice of Bharat';
      const category = article.categories?.name || 'News';
      const publishedDate = article.published_at ? new Date(article.published_at).toISOString() : '';
      
      // Generate HTML with Open Graph meta tags
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title} - Voice of Bharat</title>
          
          <!-- Cache control for Facebook -->
          <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
          <meta http-equiv="Pragma" content="no-cache">
          <meta http-equiv="Expires" content="0">
          
          <!-- Open Graph / Facebook -->
          <meta property="og:type" content="article">
          <meta property="og:url" content="${articleUrl}">
          <meta property="og:title" content="${title}">
          <meta property="og:description" content="${description}">
          <meta property="og:image" content="${imageUrl}">
          <meta property="og:image:width" content="1200">
          <meta property="og:image:height" content="630">
          <meta property="og:image:type" content="image/jpeg">
          <meta property="og:site_name" content="Voice of Bharat">
          <meta property="og:locale" content="en_US">
          
          <!-- Article specific meta tags -->
          <meta property="article:published_time" content="${publishedDate}">
          <meta property="article:author" content="${author}">
          <meta property="article:section" content="${category}">
          
          <!-- Twitter -->
          <meta name="twitter:card" content="summary_large_image">
          <meta name="twitter:url" content="${articleUrl}">
          <meta name="twitter:title" content="${title}">
          <meta name="twitter:description" content="${description}">
          <meta name="twitter:image" content="${imageUrl}">
          <meta name="twitter:site" content="@voiceofbharat">
          
          <!-- Additional meta tags -->
          <meta name="description" content="${description}">
          <meta name="keywords" content="${category}, news, voice of bharat">
          <meta name="author" content="${author}">
          
          <!-- Favicon -->
          <link rel="icon" type="image/x-icon" href="https://voiceofbharat.live/favicon.ico">
          
          <!-- Redirect to actual article page -->
          <meta http-equiv="refresh" content="0;url=${articleUrl}">
        </head>
        <body>
          <p>Redirecting to <a href="${articleUrl}">${title}</a>...</p>
        </body>
        </html>
      `;
      
      // Set content type and cache control headers
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.send(html);
    } else {
      // For regular users, redirect immediately
      const articleUrl = `https://voiceofbharat.live/article/${article.slug}`;
      res.redirect(302, articleUrl);
    }
    
  } catch (error) {
    console.error('Error generating short preview:', error);
    // Redirect to homepage on error
    res.redirect(302, 'https://voiceofbharat.live');
  }
});

export default router; 
import express from 'express';
import { supabase } from '../config/database.js';

const router = express.Router();

// Generate a short ID (6 characters)
function generateShortId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create a short URL for an article
router.post('/create', async (req, res) => {
  try {
    const { article_id } = req.body;

    if (!article_id) {
      return res.status(400).json({
        success: false,
        error: 'Article ID is required'
      });
    }

    // Check if article exists
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('id, slug')
      .eq('id', article_id)
      .single();

    if (articleError || !article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    // Check if short URL already exists for this article
    const { data: existingShortUrl } = await supabase
      .from('url_shortener')
      .select('short_id')
      .eq('article_id', article_id)
      .single();

    if (existingShortUrl) {
      const shortUrl = `${process.env.SHORT_URL_BASE || 'https://voiceofbharat.live'}/${existingShortUrl.short_id}`;
      return res.json({
        success: true,
        data: {
          short_id: existingShortUrl.short_id,
          short_url: shortUrl,
          article_id: article_id,
          article_slug: article.slug
        },
        message: 'Short URL already exists for this article'
      });
    }

    // Generate unique short ID
    let shortId;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      shortId = generateShortId();
      
      const { data: existing } = await supabase
        .from('url_shortener')
        .select('id')
        .eq('short_id', shortId)
        .single();

      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate unique short ID'
      });
    }

    // Create short URL record
    const { data, error } = await supabase
      .from('url_shortener')
      .insert({
        short_id: shortId,
        article_id: article_id
      })
      .select()
      .single();

    if (error) throw error;

    const shortUrl = `${process.env.SHORT_URL_BASE || 'https://voiceofbharat.live'}/${shortId}`;

    res.status(201).json({
      success: true,
      data: {
        short_id: shortId,
        short_url: shortUrl,
        article_id: article_id,
        article_slug: article.slug
      },
      message: 'Short URL created successfully'
    });
  } catch (error) {
    console.error('Error creating short URL:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create short URL'
    });
  }
});

// Redirect short URL to article
router.get('/:shortId', async (req, res) => {
  try {
    const { shortId } = req.params;
    console.log('🔗 Redirect request for short ID:', shortId);

    if (!shortId || shortId.length !== 6) {
      console.log('❌ Invalid short ID length:', shortId?.length);
      return res.status(400).json({
        success: false,
        error: 'Invalid short ID'
      });
    }

    // Find the short URL with article details
    const { data: shortUrl, error } = await supabase
      .from('url_shortener')
      .select(`
        *,
        articles!inner(id)
      `)
      .eq('short_id', shortId)
      .single();

    if (error || !shortUrl) {
      console.log('❌ Short URL not found:', shortId, error);
      return res.status(404).json({
        success: false,
        error: 'Short URL not found'
      });
    }

    console.log('✅ Found short URL:', shortUrl);
    console.log('📰 Article ID:', shortUrl.articles.id);

    // Increment click count
    await supabase
      .from('url_shortener')
      .update({ clicks: shortUrl.clicks + 1 })
      .eq('id', shortUrl.id);

    // Redirect to the article using article ID with correct route format
    const articleUrl = `${process.env.FRONTEND_URL || 'https://voiceofbharat.live'}/article/id/${shortUrl.articles.id}`;
    console.log('🔄 Redirecting to:', articleUrl);
    
    res.redirect(301, articleUrl);
  } catch (error) {
    console.error('❌ Error redirecting short URL:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to redirect short URL'
    });
  }
});

// Get analytics for a short URL
router.get('/:shortId/analytics', async (req, res) => {
  try {
    const { shortId } = req.params;

    const { data: shortUrl, error } = await supabase
      .from('url_shortener')
      .select(`
        *,
        articles(id, title)
      `)
      .eq('short_id', shortId)
      .single();

    if (error || !shortUrl) {
      return res.status(404).json({
        success: false,
        error: 'Short URL not found'
      });
    }

    res.json({
      success: true,
      data: {
        short_id: shortUrl.short_id,
        article_id: shortUrl.article_id,
        article_title: shortUrl.articles.title,
        clicks: shortUrl.clicks,
        created_at: shortUrl.created_at,
        updated_at: shortUrl.updated_at
      }
    });
  } catch (error) {
    console.error('Error fetching short URL analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
});

// Get all short URLs (admin only)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('url_shortener')
      .select(`
        *,
        articles(id, title)
      `)
      .order('created_at', { ascending: false })
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
    console.error('Error fetching short URLs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch short URLs'
    });
  }
});

// Generate short URLs for all existing articles (admin only)
router.post('/generate-all', async (req, res) => {
  try {
    console.log('🚀 Starting bulk short URL generation...');

    // Get all published articles that don't have short URLs
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('id, title, slug')
      .eq('status', 'published')
      .not('id', 'in', `(
        SELECT article_id FROM url_shortener
      )`);

    if (articlesError) throw articlesError;

    if (!articles || articles.length === 0) {
      return res.json({
        success: true,
        message: 'All articles already have short URLs',
        data: {
          created: 0,
          total: 0
        }
      });
    }

    console.log(`📰 Found ${articles.length} articles without short URLs`);

    let successCount = 0;
    let errorCount = 0;
    const results = [];

    // Process each article
    for (const article of articles) {
      try {
        // Generate unique short ID
        let shortId;
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = 10;

        while (!isUnique && attempts < maxAttempts) {
          shortId = generateShortId();
          
          const { data: existing } = await supabase
            .from('url_shortener')
            .select('id')
            .eq('short_id', shortId)
            .single();

          if (!existing) {
            isUnique = true;
          }
          attempts++;
        }

        if (!isUnique) {
          console.error(`Failed to generate unique short ID for article: ${article.title}`);
          errorCount++;
          continue;
        }

        // Create short URL record
        const { error: insertError } = await supabase
          .from('url_shortener')
          .insert({
            short_id: shortId,
            article_id: article.id
          });

        if (insertError) {
          console.error(`Error creating short URL for "${article.title}":`, insertError);
          errorCount++;
          continue;
        }

        const shortUrl = `${process.env.SHORT_URL_BASE || 'https://voiceofbharat.live'}/${shortId}`;
        results.push({
          article_id: article.id,
          article_title: article.title,
          short_id: shortId,
          short_url: shortUrl
        });

        successCount++;
        console.log(`✅ Created short URL for "${article.title}": ${shortUrl}`);

      } catch (error) {
        console.error(`Error processing article "${article.title}":`, error);
        errorCount++;
      }
    }

    // Get total count
    const { count: totalShortUrls } = await supabase
      .from('url_shortener')
      .select('*', { count: 'exact', head: true });

    res.json({
      success: true,
      message: `Generated short URLs for ${successCount} articles`,
      data: {
        created: successCount,
        errors: errorCount,
        total: totalShortUrls,
        results: results
      }
    });

  } catch (error) {
    console.error('Error generating short URLs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate short URLs'
    });
  }
});

export default router; 
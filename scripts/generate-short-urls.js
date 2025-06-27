// Script to generate short URLs for all existing articles
// Run this script to create short URLs for articles that don't have them yet

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Generate a short ID (6 characters)
function generateShortId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Check if short ID is unique
async function isShortIdUnique(shortId) {
  const { data } = await supabase
    .from('url_shortener')
    .select('id')
    .eq('short_id', shortId)
    .single();
  
  return !data;
}

// Generate unique short ID
async function generateUniqueShortId() {
  let shortId;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    shortId = generateShortId();
    isUnique = await isShortIdUnique(shortId);
    attempts++;
  }

  if (!isUnique) {
    throw new Error('Failed to generate unique short ID');
  }

  return shortId;
}

// Create short URL for an article
async function createShortUrlForArticle(article) {
  try {
    // Check if short URL already exists
    const { data: existingShortUrl } = await supabase
      .from('url_shortener')
      .select('short_id')
      .eq('article_id', article.id)
      .single();

    if (existingShortUrl) {
      console.log(`✅ Article "${article.title}" already has short URL: ${existingShortUrl.short_id}`);
      return existingShortUrl.short_id;
    }

    // Generate unique short ID
    const shortId = await generateUniqueShortId();

    // Create short URL record
    const { data, error } = await supabase
      .from('url_shortener')
      .insert({
        short_id: shortId,
        article_id: article.id
      })
      .select()
      .single();

    if (error) {
      console.error(`❌ Error creating short URL for "${article.title}":`, error);
      return null;
    }

    const shortUrl = `${process.env.SHORT_URL_BASE || 'https://voiceofbharat.live'}/${shortId}`;
    console.log(`✅ Created short URL for "${article.title}": ${shortUrl}`);
    return shortId;

  } catch (error) {
    console.error(`❌ Error processing article "${article.title}":`, error);
    return null;
  }
}

// Main function to process all articles
async function generateShortUrlsForAllArticles() {
  console.log('🚀 Starting short URL generation for all articles...\n');

  try {
    // Get all published articles
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, title, slug, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching articles:', error);
      return;
    }

    console.log(`📰 Found ${articles.length} published articles\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Process each article
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      console.log(`[${i + 1}/${articles.length}] Processing: ${article.title}`);

      const shortId = await createShortUrlForArticle(article);
      
      if (shortId) {
        successCount++;
      } else {
        errorCount++;
      }

      // Add small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log(`✅ Successfully processed: ${successCount} articles`);
    console.log(`⏭️  Skipped (already had short URLs): ${skipCount} articles`);
    console.log(`❌ Errors: ${errorCount} articles`);

    // Get total short URLs count
    const { count: totalShortUrls } = await supabase
      .from('url_shortener')
      .select('*', { count: 'exact', head: true });

    console.log(`📈 Total short URLs in database: ${totalShortUrls}`);

  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

// Run the script
generateShortUrlsForAllArticles()
  .then(() => {
    console.log('\n🎉 Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }); 
# Short URL Generation Scripts

This directory contains scripts to generate short URLs for existing articles.

## Option 1: Admin Interface (Recommended)

The easiest way is to use the admin interface:

1. Go to your admin panel
2. Navigate to "URL Shortener Management"
3. Click the "Generate All" button
4. This will create short URLs for all articles that don't have them yet

## Option 2: Backend Script

If you prefer to run a script directly:

```bash
# Navigate to backend directory
cd backend

# Run the script
node scripts/generate-short-urls.js
```

**Prerequisites:**
- Make sure your `.env` file in the backend directory has the correct Supabase credentials
- Ensure the `url_shortener` table exists in your database

## Option 3: API Endpoint

You can also call the API endpoint directly:

```bash
curl -X POST https://your-backend-url.com/api/redirect/generate-all
```

## What the Scripts Do

1. **Fetch all published articles** that don't have short URLs yet
2. **Generate unique 6-character IDs** (e.g., "abc123")
3. **Create database records** linking articles to short URLs
4. **Provide detailed logging** of the process
5. **Skip articles** that already have short URLs

## Output

The scripts will show:
- ✅ Successfully created short URLs
- ⏭️ Skipped articles (already had short URLs)
- ❌ Any errors encountered
- 📊 Summary statistics

## Example Output

```
🚀 Starting short URL generation for all articles...

📰 Found 25 published articles

[1/25] Processing: Breaking News Article
✅ Created short URL for "Breaking News Article": https://voiceofbharat.live/abc123

[2/25] Processing: Another Article
✅ Article "Another Article" already has short URL: def456

📊 Summary:
✅ Successfully created: 20 short URLs
⏭️ Skipped (already had short URLs): 5 articles
❌ Errors: 0 articles
📈 Total short URLs in database: 25

🎉 Script completed!
```

## Safety Features

- **No duplicates**: Won't create multiple short URLs for the same article
- **Unique IDs**: Ensures each short ID is unique
- **Error handling**: Continues processing even if some articles fail
- **Rate limiting**: Small delays between operations to avoid overwhelming the database 
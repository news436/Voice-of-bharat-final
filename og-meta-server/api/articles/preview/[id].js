import fetch from 'node-fetch';

const SUPABASE_ENDPOINT = "https://glskqjpmcolfxteyqhzm.supabase.co/rest/v1/articles";
const SOCIALS_ENDPOINT = "https://glskqjpmcolfxteyqhzm.supabase.co/rest/v1/socials";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    // Fetch article
    const response = await fetch(`${SUPABASE_ENDPOINT}?id=eq.${id}`, {
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      },
    });
    const data = await response.json();
    const article = data[0];

    if (!article) {
      res.status(404).send("Article not found");
      return;
    }

    // Fetch Facebook page link from socials
    let facebookUrl = '';
    try {
      const socialsRes = await fetch(`${SOCIALS_ENDPOINT}?select=facebook_url&limit=1`, {
        headers: {
          apikey: process.env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
      });
      const socialsData = await socialsRes.json();
      facebookUrl = socialsData[0]?.facebook_url || '';
    } catch (e) {
      facebookUrl = '';
    }

    // Use Hindi fields if available
    const title = article.title_hi || article.title;
    const description = article.summary_hi || article.summary || '';
    const shortDescription = description.split(/[.!?\n]/)[0]; // First sentence or line
    const facebookCta = facebookUrl ? `\n\nऔर खबरों के लिए हमें फेसबुक पर फॉलो करें: ${facebookUrl}` : '';
    const fullDescription = `${shortDescription}${facebookCta}`;

    res.setHeader("Content-Type", "text/html");
    res.send(`
      <!DOCTYPE html>
      <html lang=\"hi\">
      <head>
        <meta charset=\"UTF-8\" />
        <meta property=\"og:title\" content=\"${title}\" />
        <meta property=\"og:description\" content=\"${fullDescription}\" />
        <meta property=\"og:image\" content=\"${article.featured_image_url}\" />
        <meta property=\"og:image:width\" content=\"1200\" />
        <meta property=\"og:image:height\" content=\"630\" />
        <meta property=\"og:url\" content=\"https://voiceofbharat.live/article/${article.slug}\" />
        <meta property=\"og:type\" content=\"article\" />
        <meta name=\"twitter:card\" content=\"summary_large_image\" />
        <meta name=\"twitter:title\" content=\"${title}\" />
        <meta name=\"twitter:description\" content=\"${fullDescription}\" />
        <meta name=\"twitter:image\" content=\"${article.featured_image_url}\" />
      </head>
      <body>
        <script>
          window.location.href = \"https://voiceofbharat.live/article/${article.slug}\";
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Error fetching article:", error);
    res.status(500).send("Server error");
  }
} 
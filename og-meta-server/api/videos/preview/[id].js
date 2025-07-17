import fetch from 'node-fetch';

const SUPABASE_ENDPOINT = "https://glskqjpmcolfxteyqhzm.supabase.co/rest/v1/videos";
const SOCIALS_ENDPOINT = "https://glskqjpmcolfxteyqhzm.supabase.co/rest/v1/socials";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    // Fetch video
    const response = await fetch(`${SUPABASE_ENDPOINT}?id=eq.${id}`, {
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      },
    });
    const data = await response.json();
    const video = data[0];

    if (!video) {
      res.status(404).send("Video not found");
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
    const title = video.title_hi || video.title;
    const description = video.description_hi || video.description || '';
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
        <meta property=\"og:image\" content=\"${video.thumbnail_url || ''}\" />
        <meta property=\"og:image:width\" content=\"1200\" />
        <meta property=\"og:image:height\" content=\"630\" />
        <meta property=\"og:url\" content=\"https://voiceofbharat.live/video/${video.id}\" />
        <meta property=\"og:type\" content=\"video.other\" />
        <meta name=\"twitter:card\" content=\"summary_large_image\" />
        <meta name=\"twitter:title\" content=\"${title}\" />
        <meta name=\"twitter:description\" content=\"${fullDescription}\" />
        <meta name=\"twitter:image\" content=\"${video.thumbnail_url || ''}\" />
      </head>
      <body>
        <script>
          window.location.href = \"https://voiceofbharat.live/video/${video.id}\";
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Error fetching video:", error);
    res.status(500).send("Server error");
  }
} 
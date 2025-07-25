import fetch from 'node-fetch';

const SUPABASE_ENDPOINT = "https://glskqjpmcolfxteyqhzm.supabase.co/rest/v1/videos";
const SHORTENER_ENDPOINT = "https://glskqjpmcolfxteyqhzm.supabase.co/rest/v1/url_shortener";
const SOCIALS_ENDPOINT = "https://glskqjpmcolfxteyqhzm.supabase.co/rest/v1/socials";

export default async function handler(req, res) {
  const { shortId } = req.query;

  try {
    let videoId = null;
    let lookupByShortId = false;

    // If shortId is 6 chars, treat as short_id; else, try to decode as base64 video_id
    if (/^[a-zA-Z0-9]{6}$/.test(shortId)) {
      lookupByShortId = true;
    } else {
      // Try to decode base64 (URL-safe)
      let base64 = shortId.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) base64 += '=';
      try {
        videoId = Buffer.from(base64, 'base64').toString('utf-8');
      } catch (e) {
        videoId = null;
      }
    }

    let videoIdToFetch = null;
    if (lookupByShortId) {
      // Look up the video ID from the url_shortener table by short_id (video_id column)
      const urlShortenerResponse = await fetch(
        `${SHORTENER_ENDPOINT}?video_id=not.is.null&short_id=eq.${shortId}`,
        {
          headers: {
            apikey: process.env.SUPABASE_ANON_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          },
        }
      );
      const urlShortenerData = await urlShortenerResponse.json();
      videoIdToFetch = urlShortenerData[0]?.video_id;
    } else if (videoId) {
      videoIdToFetch = videoId;
    }

    if (!videoIdToFetch) {
      res.status(404).send("Short URL not found");
      return;
    }

    // Fetch the video as usual
    const response = await fetch(
      `${SUPABASE_ENDPOINT}?id=eq.${videoIdToFetch}`,
      {
        headers: {
          apikey: process.env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
      }
    );
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
    console.error("Error fetching video by shortId:", error);
    res.status(500).send("Server error");
  }
} 
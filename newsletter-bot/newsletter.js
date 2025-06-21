require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const SibApiV3Sdk = require('sib-api-v3-sdk');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BREVO_API_KEY = process.env.BREVO_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = BREVO_API_KEY;
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

async function sendNewsletterEmail(to, subject, html) {
  try {
    console.log(`Sending email to: ${to}`);
    await apiInstance.sendTransacEmail({
      sender: { email: 'newssite436@gmail.com', name: 'Voice of Bharat' },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    });
    console.log(`Email sent to: ${to}`);
  } catch (err) {
    console.error(`Failed to send email to ${to}:`, err);
  }
}

async function getSubscribers() {
  const { data, error } = await supabase.from('newsletter_subscriptions').select('email');
  if (error) throw error;
  return data.map(row => row.email);
}

function buildEmailContent(item, type) {
  let url, label;
  if (type === 'article') {
    url = `https://yourdomain.com/article/${item.slug}`;
    label = 'Read Now';
  } else if (type === 'video') {
    url = `https://yourdomain.com/video/${item.id}`;
    label = 'Watch Now';
  } else if (type === 'livestream') {
    url = `https://yourdomain.com/live/${item.id}`;
    label = 'Watch Live';
  }
  return `
    <h2>${item.title}</h2>
    <p>${item.summary || item.description}</p>
    <a href="${url}">${label}</a>
  `;
}

async function processTable(table, type) {
  const { data, error } = await supabase.from(table).select('*').eq('newsletter_sent', false);
  if (error) {
    console.error(`Error fetching ${table}:`, error);
    return;
  }
  if (!data || data.length === 0) {
    console.log(`No new ${type}s to process.`);
    return;
  }
  const subscribers = await getSubscribers();
  for (const item of data) {
    const subject = `New ${type.charAt(0).toUpperCase() + type.slice(1)}: ${item.title}`;
    const html = buildEmailContent(item, type);
    for (const email of subscribers) {
      await sendNewsletterEmail(email, subject, html);
    }
    // Update newsletter_sent
    try {
      const { error: updateError, data: updateData } = await supabase.from(table).update({ newsletter_sent: true }).eq('id', item.id);
      if (updateError) {
        console.error(`Failed to update newsletter_sent for ${type} ${item.id}:`, updateError);
      } else {
        console.log(`Marked ${type} ${item.id} as sent. Update result:`, updateData);
      }
    } catch (err) {
      console.error(`Exception updating newsletter_sent for ${type} ${item.id}:`, err);
    }
  }
}

async function main() {
  await processTable('articles', 'article');
  await processTable('videos', 'video');
  await processTable('live_streams', 'livestream');
  console.log('Newsletter process complete.');
}

main().catch(console.error);

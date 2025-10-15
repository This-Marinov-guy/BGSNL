const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'https://www.bulgariansociety.nl';
const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'https://api.bulgariansociety.nl/api/';

// All regions from your app
const REGIONS = [
  'amsterdam',
  'breda',
  'eindhoven',
  'groningen',
  'leiden_hague',
  'leeuwarden',
  'maastricht',
  'rotterdam',
];

// Static routes (excluding user routes)
const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/about', priority: '0.9', changefreq: 'monthly' },
  { path: '/board-and-committee', priority: '0.8', changefreq: 'monthly' },
  { path: '/welcome-to-alumni', priority: '0.8', changefreq: 'monthly' },
  { path: '/join-the-society', priority: '0.9', changefreq: 'monthly' },
  { path: '/hall-of-fame', priority: '0.7', changefreq: 'monthly' },
  { path: '/developers', priority: '0.5', changefreq: 'monthly' },
  { path: '/internships', priority: '0.8', changefreq: 'monthly' },
  { path: '/terms-and-legals', priority: '0.5', changefreq: 'yearly' },
  { path: '/articles', priority: '0.9', changefreq: 'weekly' },
  { path: '/articles/toni-villa', priority: '0.7', changefreq: 'yearly' },
  { path: '/articles/from-bulgaria-to-the-netherlands', priority: '0.7', changefreq: 'yearly' },
  { path: '/articles/acedemie-minerva', priority: '0.7', changefreq: 'yearly' },
];

// Regional routes
const REGIONAL_STATIC_ROUTES = [
  { path: '/contact', priority: '0.8', changefreq: 'monthly' },
  { path: '/events/future-events', priority: '0.9', changefreq: 'daily' },
  { path: '/events/past-events', priority: '0.6', changefreq: 'weekly' },
];

// Helper function to encode title for URL
function encodeForURL(title) {
  if (!title) return 'article';
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Helper function to format date to ISO string
function formatDate(date) {
  if (!date) return new Date().toISOString();
  const d = new Date(date);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

// Fetch events from backend
async function fetchEvents() {
  try {
    console.log('Fetching events from:', SERVER_URL + 'event/events-list');
    const response = await axios.get(SERVER_URL + 'event/events-list', {
      timeout: 10000,
    });
    
    if (response.data && response.data.events) {
      console.log(`✓ Fetched ${response.data.events.length} events`);
      return response.data.events;
    }
    
    console.warn('⚠ No events found in response');
    return [];
  } catch (error) {
    console.error('✗ Error fetching events:', error.message);
    return [];
  }
}

// Fetch articles from backend
async function fetchArticles() {
  try {
    console.log('Fetching articles from:', SERVER_URL + 'wordpress/posts');
    const response = await axios.get(SERVER_URL + 'wordpress/posts', {
      timeout: 10000,
    });
    
    if (response.data && response.data.posts) {
      console.log(`✓ Fetched ${response.data.posts.length} articles`);
      return response.data.posts;
    }
    
    console.warn('⚠ No articles found in response');
    return [];
  } catch (error) {
    console.error('✗ Error fetching articles:', error.message);
    return [];
  }
}

// Generate sitemap XML
function generateSitemapXML(urls) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  
  return xml;
}

// Main function
async function generateSitemap() {
  console.log('\n🚀 Starting sitemap generation...\n');
  
  const urls = [];
  const today = new Date().toISOString();
  
  // 1. Add static routes
  console.log('📄 Adding static routes...');
  STATIC_ROUTES.forEach(route => {
    urls.push({
      loc: `${BASE_URL}${route.path}`,
      lastmod: today,
      changefreq: route.changefreq,
      priority: route.priority,
    });
  });
  console.log(`✓ Added ${STATIC_ROUTES.length} static routes\n`);
  
  // 2. Add regional routes
  console.log('🌍 Adding regional routes...');
  let regionalCount = 0;
  REGIONS.forEach(region => {
    // Add region home page
    urls.push({
      loc: `${BASE_URL}/${region}`,
      lastmod: today,
      changefreq: 'daily',
      priority: '0.9',
    });
    regionalCount++;
    
    // Add regional static routes
    REGIONAL_STATIC_ROUTES.forEach(route => {
      urls.push({
        loc: `${BASE_URL}/${region}${route.path}`,
        lastmod: today,
        changefreq: route.changefreq,
        priority: route.priority,
      });
      regionalCount++;
    });
  });
  console.log(`✓ Added ${regionalCount} regional routes\n`);
  
  // 3. Fetch and add dynamic event routes
  console.log('📅 Fetching and adding event routes...');
  const events = await fetchEvents();
  events.forEach(event => {
    if (event.id && event.region) {
      urls.push({
        loc: `${BASE_URL}/${event.region}/event-details/${event.id}`,
        lastmod: formatDate(event.updated_at || event.created_at),
        changefreq: 'weekly',
        priority: '0.8',
      });
    }
  });
  console.log(`✓ Added ${events.length} event routes\n`);
  
  // 4. Fetch and add dynamic article routes
  console.log('📝 Fetching and adding article routes...');
  const articles = await fetchArticles();
  articles.forEach(article => {
    if (article.id && article.title) {
      const encodedTitle = encodeForURL(article.title);
      urls.push({
        loc: `${BASE_URL}/articles/${article.id}/${encodedTitle}`,
        lastmod: formatDate(article.updated_at || article.created_at || article.date),
        changefreq: 'monthly',
        priority: '0.7',
      });
    }
  });
  console.log(`✓ Added ${articles.length} article routes\n`);
  
  // 5. Generate and save sitemap
  console.log('💾 Generating sitemap XML...');
  const sitemapXML = generateSitemapXML(urls);
  
  const outputPath = path.join(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outputPath, sitemapXML);
  
  console.log(`✅ Sitemap generated successfully!`);
  console.log(`📍 Location: ${outputPath}`);
  console.log(`📊 Total URLs: ${urls.length}`);
  console.log(`   - Static routes: ${STATIC_ROUTES.length}`);
  console.log(`   - Regional routes: ${regionalCount}`);
  console.log(`   - Event routes: ${events.length}`);
  console.log(`   - Article routes: ${articles.length}\n`);
}

// Run the script
generateSitemap().catch(error => {
  console.error('\n❌ Error generating sitemap:', error.message);
  process.exit(1);
});


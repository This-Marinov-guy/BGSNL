# SEO Guide for Bulgarian Society Netherlands

This guide explains all the SEO enhancements implemented for the BGSNL website.

## Table of Contents
1. [Sitemap Generation](#sitemap-generation)
2. [Robots.txt Configuration](#robotstxt-configuration)
3. [Meta Tags & Helmet Component](#meta-tags--helmet-component)
4. [Structured Data](#structured-data)
5. [Best Practices](#best-practices)

---

## Sitemap Generation

### Overview
A dynamic sitemap generator has been implemented that fetches real-time data from the backend to create an up-to-date sitemap.xml file.

### What's Included in the Sitemap
- ✅ Static routes (homepage, about, contact, etc.)
- ✅ Regional routes (all 8 regions: Amsterdam, Breda, Eindhoven, Groningen, Leiden/Hague, Leeuwarden, Maastricht, Rotterdam)
- ✅ Dynamic event routes (fetched from backend API)
- ✅ Dynamic article routes (fetched from WordPress API)
- ❌ User routes (excluded: /user/*, /login, /signup, etc.)

### Script Location
`scripts/generate-sitemap.js`

### How to Generate Sitemap

#### Manually
```bash
npm run generate-sitemap
```

#### Automatically (During Build)
The sitemap is automatically generated when you run:
```bash
npm run build
```

The build script now includes:
1. Version bump
2. **Sitemap generation** (new!)
3. Webpack production build

If you want to build without version bump:
```bash
npm run build:no-version
```

### Output Location
The generated sitemap is saved to: `public/sitemap.xml`

This file is accessible at: `https://www.bulgariansociety.nl/sitemap.xml`

### Environment Variables Required
Make sure you have the following in your `.env` file:
```env
REACT_APP_SERVER_URL=https://api.bulgariansociety.nl/api/
```

### Sitemap Structure
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.bulgariansociety.nl/</loc>
    <lastmod>2025-10-15T00:00:00.000Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- ... more URLs -->
</urlset>
```

---

## Robots.txt Configuration

### Location
`public/robots.txt`

### Current Configuration
```
User-agent: *
Disallow: /user/
Disallow: /login
Disallow: /signup
Disallow: /alumni/register
Disallow: */purchase-ticket/

# Sitemap
Sitemap: https://www.bulgariansociety.nl/sitemap.xml
```

### What This Means
- ✅ All pages are indexable by default
- ❌ User-specific pages are blocked from search engines
- ❌ Authentication pages are blocked
- ❌ Purchase/payment pages are blocked
- ℹ️ Search engines are directed to the sitemap

---

## Meta Tags & Helmet Component

### Enhanced Helmet Component
Location: `src/component/common/Helmet.jsx`

The Helmet component has been significantly enhanced to support comprehensive SEO meta tags.

### Usage

#### Basic Usage (Auto-generates defaults)
```jsx
import PageHelmet from "../component/common/Helmet";

<PageHelmet pageTitle="About Us" />
```

#### Advanced Usage (Custom SEO)
```jsx
<PageHelmet 
  pageTitle="Amazing Event in Amsterdam"
  description="Join us for an amazing Bulgarian cultural event in Amsterdam featuring traditional music, food, and dance!"
  keywords="Bulgarian event, Amsterdam, culture, music, dance"
  image="https://www.bulgariansociety.nl/assets/images/events/event-image.jpg"
  type="event"
  canonicalUrl="https://www.bulgariansociety.nl/amsterdam/event-details/123"
/>
```

#### Private Pages (No Indexing)
```jsx
<PageHelmet 
  pageTitle="User Dashboard"
  noIndex={true}
/>
```

### Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pageTitle` | string | - | Page title (will be appended to "Bulgarian Society Netherlands") |
| `description` | string | Default description | Meta description for search engines |
| `keywords` | string | Default keywords | SEO keywords |
| `image` | string | Default splash screen | Social media share image |
| `url` | string | Base URL | Current page URL |
| `type` | string | "website" | Open Graph type (website, article, event) |
| `author` | string | "Bulgarian Society Netherlands" | Content author |
| `canonicalUrl` | string | - | Canonical URL to prevent duplicate content |
| `noIndex` | boolean | false | If true, page won't be indexed |

### Meta Tags Included
- ✅ Primary meta tags (title, description, keywords)
- ✅ Open Graph (Facebook, WhatsApp, LinkedIn, Discord)
- ✅ Twitter Cards
- ✅ Mobile meta tags
- ✅ Canonical URLs
- ✅ Robots directives

---

## Structured Data

### Overview
Structured data (Schema.org JSON-LD) helps search engines understand your content better and can lead to rich snippets in search results.

### Organization Schema (Global)
Location: `public/index.html`

This is loaded on every page and tells search engines about the organization itself.

Includes:
- Organization name and logo
- Contact information
- Social media profiles
- Area served
- Founding date

### Event Schema
Location: `src/component/common/EventStructuredData.jsx`

Use this component on event detail pages.

#### Usage
```jsx
import EventStructuredData from "../../component/common/EventStructuredData";

<EventStructuredData 
  event={eventData} 
  region={regionName}
/>
```

#### What It Provides
- Event name and description
- Start and end dates
- Location
- Organizer information
- Ticket pricing (if applicable)

#### Benefits
- Rich snippets in Google Search
- Events can appear in Google Events
- Better visibility in search results

### Article Schema
Location: `src/component/common/ArticleStructuredData.jsx`

Use this component on article/blog pages.

#### Usage
```jsx
import ArticleStructuredData from "../../component/common/ArticleStructuredData";

<ArticleStructuredData article={articleData} />
```

#### What It Provides
- Article headline and description
- Author information
- Publisher information
- Publication and modification dates
- Featured image

#### Benefits
- Rich snippets in Google Search
- Better indexing as articles
- Author attribution

---

## Best Practices

### 1. Always Use PageHelmet
Every page should have a `PageHelmet` component with at least a `pageTitle`:

```jsx
<PageHelmet pageTitle="Page Name" />
```

### 2. Customize Meta Tags for Important Pages
For key landing pages (events, articles, about), provide custom descriptions and images:

```jsx
<PageHelmet 
  pageTitle="Annual Bulgarian Festival 2025"
  description="Join us for the biggest Bulgarian festival in Amsterdam! Traditional food, music, dance, and more."
  image="/assets/images/events/festival-2025.jpg"
/>
```

### 3. Use Structured Data on Dynamic Pages
On event detail pages:
```jsx
<EventStructuredData event={event} region={region} />
```

On article pages:
```jsx
<ArticleStructuredData article={article} />
```

### 4. Set Canonical URLs
For pages that might have duplicate content or URL parameters:

```jsx
<PageHelmet 
  pageTitle="Events"
  canonicalUrl="https://www.bulgariansociety.nl/amsterdam/events/future-events"
/>
```

### 5. Mark Private Pages as NoIndex
For user dashboards, admin panels, or purchase pages:

```jsx
<PageHelmet 
  pageTitle="My Dashboard"
  noIndex={true}
/>
```

### 6. Generate Sitemap Before Deploy
Always run `npm run generate-sitemap` before deploying to production, or use the build script which does this automatically.

### 7. Monitor SEO Performance
Use these tools to monitor and improve SEO:

- **Google Search Console**: https://search.google.com/search-console
  - Submit sitemap
  - Monitor indexing status
  - Check for errors

- **Google Analytics**: Track organic traffic

- **Rich Results Test**: https://search.google.com/test/rich-results
  - Test structured data
  - Verify rich snippets

- **Lighthouse**: Built into Chrome DevTools
  - SEO audit
  - Performance audit

### 8. Update Sitemap Regularly
The sitemap should be regenerated:
- ✅ On every production build (automatic)
- ✅ When new events are added
- ✅ When new articles are published

You can also set up a cron job to regenerate it periodically:
```bash
# Example: Daily at 3 AM
0 3 * * * cd /path/to/project && npm run generate-sitemap
```

---

## SEO Checklist for New Content

### Before Publishing a New Event
- [ ] Ensure event has a clear title
- [ ] Write a descriptive summary (150-160 characters)
- [ ] Add a featured image (recommended: 1200x630px)
- [ ] Include location details
- [ ] Set correct dates
- [ ] Add `<EventStructuredData />` component to the event detail page

### Before Publishing a New Article
- [ ] Craft an engaging title (under 60 characters)
- [ ] Write meta description (150-160 characters)
- [ ] Add featured image (recommended: 1200x630px)
- [ ] Include relevant keywords naturally in content
- [ ] Add `<ArticleStructuredData />` component to the article page
- [ ] Use proper heading hierarchy (H1, H2, H3)

### Before Deploying to Production
- [ ] Run `npm run build` (includes sitemap generation)
- [ ] Verify sitemap.xml is generated in public folder
- [ ] Test a few URLs from the sitemap
- [ ] Check robots.txt is correct
- [ ] Run Lighthouse SEO audit
- [ ] Submit sitemap to Google Search Console (first time only)

---

## Technical Details

### Dependencies
No additional dependencies were added. Uses existing:
- `axios` - for API calls
- `fs` - for file writing
- `path` - for path handling

### Build Integration
The sitemap generation is integrated into the build process via package.json scripts:

```json
{
  "scripts": {
    "build": "npm version patch && npm run generate-sitemap && webpack --config config/webpack.prod.js",
    "build:no-version": "npm run generate-sitemap && webpack --config config/webpack.prod.js",
    "generate-sitemap": "node scripts/generate-sitemap.js"
  }
}
```

### Error Handling
The sitemap generator includes robust error handling:
- If events API fails, it continues with 0 events
- If articles API fails, it continues with 0 articles
- Logs are provided for debugging
- Process exits with error code 1 on complete failure

### Performance
- Sitemap generation typically takes 2-5 seconds
- Runs only during build time (not runtime)
- No impact on user-facing application performance

---

## Support & Maintenance

### Common Issues

**Q: Sitemap generation fails during build**
A: Ensure `REACT_APP_SERVER_URL` is set in your environment variables

**Q: Events/articles not appearing in sitemap**
A: Check that the backend APIs are accessible and returning data

**Q: Search engines not finding new pages**
A: Regenerate sitemap and resubmit to Google Search Console

### Getting Help
For technical issues with SEO implementation:
1. Check the console logs during `npm run generate-sitemap`
2. Verify environment variables are set correctly
3. Test API endpoints manually
4. Contact the development team: bgsn.tech.nl@gmail.com

---

## Future Enhancements

Potential SEO improvements for future versions:
- [ ] Multi-language support (Bulgarian + English)
- [ ] Dynamic Open Graph images for events
- [ ] AMP (Accelerated Mobile Pages) for articles
- [ ] Enhanced local SEO for each region
- [ ] FAQ schema markup
- [ ] Video schema for video content
- [ ] Review/rating schema for events
- [ ] Automatic sitemap submission to search engines

---

**Last Updated**: October 15, 2025
**Version**: 3.2.0


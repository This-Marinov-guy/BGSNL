# SEO Quick Reference Guide

## Quick Commands

```bash
# Generate sitemap manually
npm run generate-sitemap

# Build with sitemap generation (recommended)
npm run build

# Build without version bump
npm run build:no-version
```

## PageHelmet Usage Examples

### Basic (Auto SEO)
```jsx
<PageHelmet pageTitle="Events" />
```

### Enhanced (Recommended for key pages)
```jsx
<PageHelmet 
  pageTitle="Annual Bulgarian Festival 2025"
  description="Join us for the biggest Bulgarian festival in Amsterdam! Traditional food, music, and dance."
  image="https://www.bulgariansociety.nl/assets/images/events/festival.jpg"
  keywords="Bulgarian festival, Amsterdam, culture, events"
  canonicalUrl="https://www.bulgariansociety.nl/amsterdam/events/festival-2025"
/>
```

### Private Pages (No indexing)
```jsx
<PageHelmet pageTitle="Dashboard" noIndex={true} />
```

## Structured Data Usage

### For Event Pages
```jsx
import EventStructuredData from "../../component/common/EventStructuredData";

<EventStructuredData event={eventData} region={regionName} />
```

### For Article Pages
```jsx
import ArticleStructuredData from "../../component/common/ArticleStructuredData";

<ArticleStructuredData article={articleData} />
```

## Checklist for New Content

### Before Publishing Event
- [ ] Clear, descriptive title (< 60 chars)
- [ ] Event description (150-160 chars)
- [ ] Featured image (1200x630px recommended)
- [ ] Location details filled
- [ ] Correct dates set
- [ ] Add `<EventStructuredData />` to event page

### Before Publishing Article
- [ ] Engaging title (< 60 chars)
- [ ] Meta description (150-160 chars)
- [ ] Featured image (1200x630px recommended)
- [ ] Add `<ArticleStructuredData />` to article page

### Before Production Deploy
- [ ] Run `npm run build` (auto-generates sitemap)
- [ ] Check `public/sitemap.xml` exists
- [ ] Test key URLs
- [ ] Run Lighthouse SEO audit

## Environment Variables

Required in `.env`:
```env
REACT_APP_SERVER_URL=https://api.bulgariansociety.nl/api/
```

## SEO Testing Tools

- **Google Search Console**: https://search.google.com/search-console
- **Rich Results Test**: https://search.google.com/test/rich-results
- **Lighthouse**: Chrome DevTools > Lighthouse tab
- **Sitemap Location**: https://www.bulgariansociety.nl/sitemap.xml

## Common Issues

**Q: Sitemap not generating?**
A: Check that `REACT_APP_SERVER_URL` is set in environment

**Q: Events not in sitemap?**
A: Ensure backend API is accessible and returning events

**Q: Meta tags not showing?**
A: Ensure PageHelmet is used and props are passed correctly

## File Locations

- Sitemap Generator: `scripts/generate-sitemap.js`
- Robots.txt: `public/robots.txt`
- Enhanced Helmet: `src/component/common/Helmet.jsx`
- Event Schema: `src/component/common/EventStructuredData.jsx`
- Article Schema: `src/component/common/ArticleStructuredData.jsx`
- Full Guide: `SEO-GUIDE.md`

## PageHelmet Props Quick Reference

| Prop | Type | Required | Default |
|------|------|----------|---------|
| `pageTitle` | string | No | - |
| `description` | string | No | Default org description |
| `keywords` | string | No | Default keywords |
| `image` | string | No | Default splash image |
| `url` | string | No | Base URL |
| `type` | string | No | "website" |
| `canonicalUrl` | string | No | - |
| `noIndex` | boolean | No | false |

---
**Version**: 3.2.0 | **Last Updated**: Oct 2025


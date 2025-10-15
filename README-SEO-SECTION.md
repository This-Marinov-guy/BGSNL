# SEO Features - Section to Add to README.md

Add this section to your main README.md file:

---

## 🔍 SEO Features

This project includes comprehensive SEO optimizations to maximize search engine visibility.

### Features

- ✅ **Dynamic XML Sitemap** - Auto-generated from backend data
- ✅ **Enhanced Meta Tags** - Open Graph, Twitter Cards, and more
- ✅ **Structured Data** - Schema.org markup for Events and Articles
- ✅ **Optimized robots.txt** - Proper indexing directives
- ✅ **Canonical URLs** - Prevent duplicate content issues
- ✅ **Social Media Optimization** - Rich previews on all platforms

### Quick Commands

```bash
# Generate sitemap manually
npm run generate-sitemap

# Build with automatic sitemap generation
npm run build

# Build without version bump
npm run build:no-version
```

### Documentation

- **Full Guide**: [SEO-GUIDE.md](./SEO-GUIDE.md) - Complete documentation
- **Quick Reference**: [SEO-QUICK-REFERENCE.md](./SEO-QUICK-REFERENCE.md) - Developer cheatsheet
- **Implementation Summary**: [SEO-IMPLEMENTATION-SUMMARY.md](./SEO-IMPLEMENTATION-SUMMARY.md) - What was implemented

### Sitemap

The sitemap is automatically generated during production builds and includes:
- All static routes (home, about, contact, etc.)
- All regional routes (8 regions × multiple pages)
- Dynamic event routes (fetched from backend)
- Dynamic article routes (fetched from WordPress)

**Location**: `public/sitemap.xml`
**URL**: https://www.bulgariansociety.nl/sitemap.xml

### Environment Variables

Required for sitemap generation:

```env
REACT_APP_SERVER_URL=https://api.bulgariansociety.nl/api/
```

### Testing SEO

1. **Lighthouse Audit**: Chrome DevTools → Lighthouse → SEO
2. **Rich Results**: https://search.google.com/test/rich-results
3. **Sitemap Check**: https://www.bulgariansociety.nl/sitemap.xml

### For Developers

When creating new pages, always include the Helmet component:

```jsx
import PageHelmet from "../../component/common/Helmet";

<PageHelmet 
  pageTitle="Your Page Title"
  description="Page description (150-160 characters)"
/>
```

See [SEO-QUICK-REFERENCE.md](./SEO-QUICK-REFERENCE.md) for more examples.

---


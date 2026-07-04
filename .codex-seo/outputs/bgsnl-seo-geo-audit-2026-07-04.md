# BGSNL SEO/GEO Audit - 2026-07-04

## Scope

Audited crawlability, indexation readiness, page intent, titles, internal links, structured data, source citations, answer-first content, search visibility, and AI answer visibility for `https://www.bulgariansociety.nl`.

Studentjobs tooling and environment were used for methodology and credentials. Secret values were not copied into this report.

## Highest-Impact Gaps

| Rank | Severity | Gap | Evidence | Status |
| --- | --- | --- | --- | --- |
| 1 | Critical live technical | Production still serves the old SPA shell to raw crawlers: generic title, no route body, no route canonical, no prerender root, and missing answer-ready content on priority pages. | `npm run audit:bgsnl-live-html -- --out .codex-seo/outputs/bgsnl-live-html-audit-current-2026-07-04.json` found 14/14 priority routes with issues: 14 critical, 129 high, 14 medium. Earlier live samples also returned `BodyText: Bulgarian Society Netherlands You need to enable JavaScript to run this app.` and `HasPrerenderRoot: false`. | Fixed in local build; blocked on deployment/indexing. |
| 2 | High indexation | Priority pages are not all indexed in Google: `/about` is crawled but not indexed, and `/maastricht` is unknown to Google. | Search Console URL Inspection for `sc-domain:bulgariansociety.nl` returned 12 `PASS` and 2 `NEUTRAL` priority URLs in `.codex-seo/outputs/google-search-console-indexation-current-2026-07-04.json`. | Local build has canonicals, internal links, and sitemap coverage; needs deployment and recrawl. |
| 3 | High search/GEO | `BGSNL past events` competes with unrelated BSNL entities because the live official page is not yet answer-ready in raw HTML. | Search sampling returned unrelated BSNL results; Gemini grounded search confirmed unrelated BSNL results compete with the answer. | Fixed in local build with `/events/past-events` prerendered archive. |
| 4 | Medium authority/entity | BGSNL depends on official site, LinkedIn, Radio Bulgaria, and Bulgarian government directory for entity consensus; no Ahrefs Site Audit project/API units were available for deeper authority benchmarking. | Local Organization schema includes `sameAs` references; Ahrefs Site Audit API returned no project rows and Ahrefs SERP calls were blocked by API unit limit. | No local critical issue. Recheck after deployment and crawl. |

## Local Fix Verified

The current worktree contains the high-leverage fix: static prerendering for 65 sitemap routes, route-specific metadata/canonicals, JSON-LD, internal links, source citations, answer-first blocks, and a past-events archive.

Fresh local evidence:

| Check | Result |
| --- | --- |
| `node scripts/bgsnl-crawl-audit.js --out .codex-seo/outputs/bgsnl-crawl-audit-current-2026-07-04.json` | 0 findings |
| `node scripts/bgsnl-geo-query-benchmark.js --out .codex-seo/outputs/geo-query-benchmark-current-2026-07-04.json` | 0 findings |
| `node scripts/full-site-sitemap-crawl.js --out .codex-seo/outputs/full-site-sitemap-crawl-current-2026-07-04.json` | 65/65 URLs prerendered, 0 pages with issues |
| `npm run audit:bgsnl-live-html -- --out .codex-seo/outputs/bgsnl-live-html-audit-current-2026-07-04.json` | Production gate fails: 14/14 priority routes have critical/high live HTML gaps |
| Search Console URL Inspection | 12/14 priority URLs pass; `/about` is crawled but not indexed, `/maastricht` is unknown to Google |
| Local `/events/past-events` build sample | route-specific title, 5 JSON-LD blocks, 3,546 words, prerender root present |

## Search and AI Benchmark

Search sampling found BGSNL visible for brand, join, internship, and local society queries, but live snippets still use old generic SPA copy. Gemini with Google Search grounding cited the official site for BGSNL and past-events intent, but also confirmed unrelated BSNL results compete for `BGSNL past events`.

## Tool Limitations

Ahrefs Site Audit API had no accessible project rows for `bulgariansociety.nl`. Ahrefs SERP API calls were blocked by account API unit limits. The local Ahrefs CSV export was used instead; the regression self-test against that export passes.

Google Search Console credentials from the borrowed environment have owner access to `sc-domain:bulgariansociety.nl`, and read-only URL Inspection was saved locally. The Google Indexing API should not be used to submit these general BGSNL pages because that API is intended for supported verticals such as job posting and livestream content.

The Vercel connector exposed no teams, the repo has no `.vercel/project.json`, the borrowed environment has no Vercel/GitHub deploy token, and listing projects without a team failed. Production deployment could not be performed safely from this session.

## Next External Step

Deploy the current worktree build to the real BGSNL production project, then request recrawl/reindexing for:

- `https://www.bulgariansociety.nl/`
- `https://www.bulgariansociety.nl/about`
- `https://www.bulgariansociety.nl/events/past-events`
- `https://www.bulgariansociety.nl/groningen`
- `https://www.bulgariansociety.nl/sitemap.xml`

After deployment, rerun `npm run audit:bgsnl-live-html`, the same local crawl outputs, Search Console URL Inspection, search sampling, and Gemini grounded prompt. The goal is complete only when production raw HTML matches the local prerendered build, `/about` and `/maastricht` are no longer high-priority indexation gaps, and the `BGSNL past events` query no longer has a high-impact official-page gap.

# Deployment: public discovery and API hardening

Set the following server-only values in the production deployment manager. Do not put any of them in a `NEXT_PUBLIC_*` variable, source control, browser bundle or GitHub workflow output.

| Service | Variable | Requirement |
| --- | --- | --- |
| Website + API SSR | Website `BGSNL_SERVER_KEY`; API `SSR_SERVER_KEY` | Same random secret, at least 32 bytes. Required for server-rendered public fetches. |
| API proxy ingress | `TRUST_PROXY_HOPS` | Exact trusted reverse-proxy hop count, normally `1`; never use unrestricted proxy trust. |
| Google Scripts export | API `GOOGLE_SCRIPTS_PASS` | Separate random service key, at least 32 characters. The integration is intentionally unavailable until configured. |
| Koko mobile integration | API `KOKO_APP_PASS` | Separate random service key, at least 32 characters. |
| Website revalidation | Website `SITEMAP_REVALIDATE_TOKEN` | Random secret used only by the GitHub workflow. |
| Event sitemap dispatch | API `GITHUB_SITEMAP_REPOSITORY`, `GITHUB_SITEMAP_DISPATCH_TOKEN` | Repository `owner/name` and a fine-grained token scoped to this repository with **Contents: write** only (required for GitHub repository dispatch). Optional; timed sitemap revalidation remains the fallback. |
| GitHub Actions | `SITEMAP_REVALIDATE_URL`, `SITEMAP_REVALIDATE_TOKEN` | URL is `https://www.bulgariansociety.nl/api/revalidate`; token must equal the website value. |

## Release order

1. Deploy API and website with the SSR key pair and integration keys configured.
2. Backfill existing event URLs once. First review the target environment, then run `npm run backfill:event-slugs -- --apply`; production additionally requires `--production-confirm=EVENT_SLUG_BACKFILL`.
3. Add the two GitHub Actions secrets and the API dispatch token. Creating or archiving an event will then refresh `/sitemap.xml` and `/llms.txt`; failure to dispatch cannot fail the event operation.
4. Verify the live domain, not localhost: `/`, a public event, article, `/sitemap.xml`, `/robots.txt`, `/llms.txt`, and a private `/user` route. Public event ID links should return a 308 to the stored-region slug URL; nonexistent/hidden event URLs must return 404.

Public SSR fetches now fail visibly on upstream failures rather than emitting empty lists that could be indexed or interpreted as sitemap deletions. The API's public event serializers are allowlists; add new public fields intentionally rather than returning Mongoose documents.

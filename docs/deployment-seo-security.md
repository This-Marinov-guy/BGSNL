# Deployment: public discovery and API hardening

Set the following server-only values in the production deployment manager. Do not put any of them in a `NEXT_PUBLIC_*` variable, source control, browser bundle or GitHub workflow output.

| Service | Variable | Requirement |
| --- | --- | --- |
| Website + API SSR | Website `BGSNL_SERVER_KEY`; API `SSR_SERVER_KEY` | Same random secret, at least 32 bytes. Required for server-rendered public fetches. |
| API proxy ingress | `TRUST_PROXY_HOPS` | Exact trusted reverse-proxy hop count, normally `1`; never use unrestricted proxy trust. |
| Google Scripts export | API `GOOGLE_SCRIPTS_PASS` | Separate random service key, at least 32 characters. The integration is intentionally unavailable until configured. |
| Koko mobile integration | API `KOKO_APP_PASS` | Separate random service key, at least 32 characters. |
| Website revalidation | Website `SITEMAP_REVALIDATE_TOKEN` | Random secret used only by the GitHub workflow. |
| Event archive schedule | Website `CRON_SECRET` | Separate random secret, at least 32 bytes. Vercel uses it to invoke the daily event-archive job. |
| Event sitemap dispatch | API `GITHUB_SITEMAP_REPOSITORY`, `GITHUB_SITEMAP_DISPATCH_TOKEN` | Repository `owner/name` and a fine-grained token scoped to this repository with **Contents: write** only (required for GitHub repository dispatch). Optional; timed sitemap revalidation remains the fallback. |
| GitHub Actions | `SITEMAP_REVALIDATE_URL`, `SITEMAP_REVALIDATE_TOKEN` | URL is `https://www.bulgariansociety.nl/api/revalidate`; token must equal the website value. |

## Release order

1. Deploy API and website with the SSR key pair and integration keys configured.
2. Backfill existing event URLs once. First review the target environment, then run `npm run backfill:event-slugs -- --apply`; production additionally requires `--production-confirm=EVENT_SLUG_BACKFILL`.
3. Follow the Next.js sitemap setup below: configure the shared revalidation secret, publish the workflow with the Next.js rollout, verify a manual run, then enable automatic runs. Configure the optional API dispatch token for event-triggered refreshes; failure to dispatch cannot fail the event operation.
4. Verify the live domain, not localhost: `/`, a public event, article, `/sitemap.xml`, `/robots.txt`, `/llms.txt`, and a private `/user` route. Public event ID links should return a 308 to the stored-region slug URL; nonexistent/hidden event URLs must return 404.

Public SSR fetches now fail visibly on upstream failures rather than emitting empty lists that could be indexed or interpreted as sitemap deletions. The API's public event serializers are allowlists; add new public fields intentionally rather than returning Mongoose documents.

## GitHub sitemap refresh action

`.github/workflows/refresh-sitemap.yml` refreshes the Next.js discovery cache:

- When the API dispatches `event-sitemap-changed` after publication or archival, once enabled.
- Manually through Actions → Refresh public event sitemap → Run workflow.
- Daily at 06:17 UTC as a fallback, once enabled (GitHub scheduled runs can be delayed).

The workflow requests no repository permissions, performs no checkout/commits,
and cannot deploy the site. Runs are serialized and time-limited. After the
protected POST confirms revalidation, it fetches `/sitemap.xml` and `/llms.txt`,
checks the sitemap XML and canonical domain, and reports the number of URLs.

Set the repository secret `SITEMAP_REVALIDATE_TOKEN` to the same server-only
value as the production website. `SITEMAP_REVALIDATE_URL` is optional and defaults
to `https://www.bulgariansociety.nl/api/revalidate`. The API's separate,
repository-scoped dispatch token is needed only for immediate event-triggered
refreshes; manual and scheduled runs do not require it. Do not copy a broad
personal CLI token into the API environment.

### Next.js rollout configuration

This workflow is prepared for the pending Next.js deployment. It calls the
Next.js `app/api/revalidate/route.js` endpoint; it cannot regenerate the old Vite
build's static sitemap. Automatic jobs are skipped while the repository variable
`SITEMAP_REFRESH_ENABLED` is unset or `false`. Manual runs bypass this switch so
that deployment can be verified before enabling automation.

1. Generate a new secret locally with `openssl rand -hex 32`. Save it in the two
   places below; both values must be identical. Do not use a `NEXT_PUBLIC_` prefix.
2. In the **Vercel BGSNL project → Settings → Environment Variables**, add
   `SITEMAP_REVALIDATE_TOKEN` for **Production** before the Next.js deployment.
   Existing deployments do not acquire newly added environment values; deploy
   Next.js after configuring it. SSR must also have website `BGSNL_SERVER_KEY`
   matching API `SSR_SERVER_KEY` as listed above, and the production API URL must
   point to the intended API deployment.
3. In **This-Marinov-guy/BGSNL → Settings → Secrets and variables → Actions**,
   configure these repository settings:

   | Tab | Name | Value |
   | --- | --- | --- |
   | Secrets | `SITEMAP_REVALIDATE_TOKEN` | The same generated value as Vercel Production. |
   | Secrets (optional) | `SITEMAP_REVALIDATE_URL` | `https://www.bulgariansociety.nl/api/revalidate`; this is already the workflow default. |
   | Variables | `SITEMAP_REFRESH_ENABLED` | `false` until the manual production check succeeds, then `true`. |

4. Include `.github/workflows/refresh-sitemap.yml` on the repository's default
   branch (`main`) as part of the Next.js release. GitHub requires the workflow
   on the default branch for repository dispatch and scheduled runs, and for the
   **Run workflow** button to appear. Ensure Actions are allowed in the repository.
5. Deploy the Next.js site to **https://www.bulgariansociety.nl**. The sitemap
   action does not build or deploy the application and needs no Vercel API token.
6. Open **Actions → Refresh public event sitemap → Run workflow**, select `main`,
   and run it. Success requires the protected POST to return
   `{"revalidated":true}`, a valid `/sitemap.xml` using the canonical website
   origin, and `/llms.txt` referencing that sitemap. The job summary reports the
   sitemap URL count.
7. Set the repository **variable** `SITEMAP_REFRESH_ENABLED=true`. Daily refreshes
   now run at 06:17 UTC. To pause automatic jobs later, set it back to `false`;
   manual runs remain available.

### Immediate refresh after event changes (optional)

Manual and daily refreshes work without this configuration. To also request a
refresh when the API publishes or archives an event:

1. Create a GitHub **fine-grained personal access token** with resource owner
   `This-Marinov-guy`, repository access limited to **BGSNL**, and repository
   permission **Contents: Read and write** (Metadata read is implicit). This
   permission is required by GitHub's repository dispatch endpoint. Set an expiry
   and replace the API's token before it expires.
2. Set these server environment variables on the **BGSNL API** deployment:

   | Name | Value |
   | --- | --- |
   | `GITHUB_SITEMAP_REPOSITORY` | `This-Marinov-guy/BGSNL` |
   | `GITHUB_SITEMAP_DISPATCH_TOKEN` | The fine-grained token from step 1. |

3. Deploy/restart the API with those values after the website's manual check
   succeeds. Its existing `dispatchSitemapRefresh` helper sends
   `event-sitemap-changed`. No GitHub webhook or MongoDB Atlas trigger is needed.
   The event-announcement email trigger remains separate.

### Troubleshooting

- **Job skipped:** automatic jobs require the repository variable
  `SITEMAP_REFRESH_ENABLED=true`. A manual run bypasses the variable.
- **401:** GitHub and the deployed website have different revalidation tokens,
  or the website has not been redeployed since its token was added.
- **404/405 or an HTML response:** confirm the production domain serves Next.js
  and `/api/revalidate` is not still handled by the old Vite deployment.
- **Sitemap fetch fails:** check the website's SSR key, API URL and API availability.
- **Manual/daily works but no event run appears:** check the API's repository name,
  dispatch token permissions/expiry and that the workflow is on `main`.

Sitemap refresh makes new URLs available to crawlers; it does not force indexing.

References: [GitHub workflow triggers](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows),
[repository dispatch permissions](https://docs.github.com/en/rest/repos/repos#create-a-repository-dispatch-event),
[configuration variables](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-variables).

# Administration

`/user/dashboard` is the authenticated administration overview. It shows cards based on the account's existing roles. Individual pages and API endpoints retain their permission and regional checks.

| Area | URL |
| --- | --- |
| Events | `/user/dashboard/events` |
| Internships | `/user/dashboard/internships` |
| Members and alumni | `/user/dashboard/members` |
| Support tickets | `/user/dashboard/support` |

Event analytics is a view within Events (`/user/dashboard/events?view=analytics`), available to the existing board/admin roles. Member statistics is a tab in Members (`/user/dashboard/members?view=statistics`). Neither has an independent page, overview card or access-request option. Previous analytics/statistics URLs redirect to these views and retain filters.

Event and internship editors use `/<area>/new` and `/<area>/<id>/edit` under the dashboard. Guest-list checks use `/user/dashboard/guest-list`. Old administration URLs redirect while retaining query parameters, including existing ticket QR-code links.

## Image previews

Event details use `yet-another-react-lightbox` through `ImageGallery.jsx`, loaded on demand. Clicking a poster, ticket, background or gallery image opens the viewer at that image with gallery navigation, zoom, captions and download. The details dialog suspends its focus and Escape handling until the viewer closes. The user profile’s Tickets tab uses the same gallery to browse, zoom and download ticket images; each download retains its ticket filename.

## Access requests

Accounts without all administration permissions can select missing areas in the overview's **Request access** dialog. The website proxies `POST /backoffice/access-requests` to the authenticated API. The server derives the account ID and email from the authenticated account, validates the areas, and queues an email to the existing internal-notification subscribers. Requests do not grant roles automatically.

The API must have `INTERNAL_NOTIFICATIONS_ENABLED=true` and configured `INTERNAL_NOTIFICATION_SUBSCRIBERS` (comma-separated), plus the existing internal email transport credentials. Disabled notifications return an error instead of reporting success. No additional frontend environment variables are needed.

Requests are limited to three per account per UTC day using Redis; the temporary counter expires within 48 hours. No access-request or email-delivery collection is created. A successful response means queued, not confirmed delivered; the existing in-process email queue is not durable across restarts.

Validation: `node --experimental-vm-modules --test scripts/administration.test.mjs scripts/account-route-state.test.mjs scripts/cookie-session.test.mjs` in BGSNL; `node --test tests/backoffice-access-requests.test.js tests/backoffice-accounts.test.js tests/internal-notifications.test.js` in BGSNL-API. The email tests use a mock sender.

# BGSNL website

Next.js 16 App Router frontend for Bulgarian Society Netherlands.

## Local development

Use Node.js 20.9+ and install dependencies in each of the three checkouts:

```bash
npm install
```

Start the complete local stack from this directory:

```bash
npm run dev:all
```

This replaces listeners on **3000 (BGSNL), 8080 (BGSNL-API), and 6000
(Domakin-Mailer)**, then starts the services in dependency order and waits for
HTTP readiness. Existing listeners receive SIGTERM first (up to 30 seconds),
then SIGKILL if the same listener is still holding its port. Recognized dev
watchers in that listener's checkout are stopped too. No other ports are cleared.
In particular, an unrelated app currently using one of these three ports will
be stopped. Ctrl+C shuts down this launcher's stack; a startup failure stops
the other services instead of leaving a partially started stack.

To inspect configuration and occupied ports **without stopping anything**:

```bash
npm run dev:check
```

From the parent `BGSNL website` directory, the equivalent startup command is
`node start-local.mjs`.

Expected checkout layout:

```text
Projects/
  BGSNL website/
    BGSNL/
    BGSNL-API/
  Domakin/
    Domakin-Mailer/
```

Set `BGSNL_MAILER_DIR=/absolute/path/to/Domakin-Mailer` if its location differs.
The launcher requires macOS/Linux, `lsof`, and installed dependencies; it never
runs package installs or migrations automatically. `npm run dev` remains
available to start only the frontend.

The site is available at <http://localhost:3000>. The API is at
<http://localhost:8080/api/v1>; the mailer readiness endpoint is
<http://localhost:6000/health>.

### Local configuration and email

The launcher reads each backend's `.env`, then `.env.dev`, then `.env.local`,
with shell variables taking precedence. It does not evaluate these files as
shell scripts and never rewrites them. Next.js still loads its own env files.
The launcher enforces development mode, exact ports and local API/mailer URLs
in child environments only. The website's server-only SSR key is matched to
the API's `SSR_SERVER_KEY`. A new ephemeral BGSNL-scoped mailer secret is shared
between API and mailer at each launch, without writing it to disk or exposing
it in the browser.

Local API email delivery uses `BGSNL_EMAIL_PROVIDER=domakin` and
`MAILER_API_URL=http://127.0.0.1:6000/api`. Account, password-reset, ticket,
billing and internal notification emails use the Bulgarian Society channel.
Update the Mailer checkout too: its BGSNL template registrations and shared
notification snapshot are required. Production delivery remains unchanged
unless explicitly opted into this provider.

**This is not an email sandbox.** The existing database and mail-provider
credentials remain in use; triggered emails (including the mailer's configured
BCC) can reach real recipients. Use dedicated development credentials and test
recipients. The launcher disables the API billing worker, SES event consumer,
email-store maintenance, Sheets email logging and mailer Axiom logging. It does
not create or migrate databases, change Stripe keys, or modify provider routes.
The mailer's BGSNL email-store database and configured delivery provider must
be reachable; a failing `/health` stops startup with an error.

Two legacy email flows require additional template setup before testing:

- The contest-materials UUID `c130f73a-17f7-4fe8-be84-4acf9d5d2800` is absent
  from the existing mailer snapshot. Import and register the original template.
- The old Resend campaign `gala-festival-invitation-1` needs a matching local
  snapshot and an explicit `DOMAKIN_RESEND_TEMPLATE_MAP` JSON object in the API's
  local env, mapping its Resend ID to that snapshot's UUID. No substitute
  campaign or language is selected automatically.

These gaps are reported by `dev:check`. Local delivery errors never fall back
to Mailtrap/Resend, to avoid unintended sends or duplicates.

Launcher tests (use isolated fixture servers, no real databases or emails):

```bash
npm run test:dev-services
```

### Standalone frontend

The frontend environment must define both API URLs:

```env
NEXT_PUBLIC_SERVER_URL=https://your-production-api.example/api/
NEXT_PUBLIC_TEST_SERVER_URL=http://localhost:8080/api/
```

Public pages fetch through `NEXT_PUBLIC_TEST_SERVER_URL` during local server
rendering and through `NEXT_PUBLIC_SERVER_URL` in production. Browser requests
follow the same rule.

For authenticated server-to-server SSR requests, set this server-only value:

```env
BGSNL_SERVER_KEY=the-same-value-as-the-api-SSR_SERVER_KEY
```

Do not add a `NEXT_PUBLIC_` prefix to that key.

PrimeReact 11 also requires a PrimeUI license key. Add the Community or
Commercial key issued for the deployment:

```env
NEXT_PUBLIC_PRIMEUI_LICENSE=your-primeui-license-key
```

## Production check

```bash
npm run build
npm start
```

## Website reports and help

The Help launcher sits at the bottom-right and opens upward on desktop; on
mobile it opens a full-screen, keyboard-accessible panel. It uses shared inputs,
buttons and typography, with reduced-motion support. Private report views load
client-side only, and polling pauses while hidden or minimized.

- `/user#help`: signed-in users' reports and help links, including locked accounts.
- `/user/support`: staff inbox for active society-wide administrators to reply
  and change report statuses. The API independently enforces permissions.
- Guests give their name plus email or phone and can return from the same
  browser for up to 90 days. Clearing browser storage loses guest access.

Deploy the matching BGSNL-API changes first. Conversations are stored in Mongo;
see `BGSNL-API/docs/support.md` in the sibling repository for routes, security,
limits, deployment notes and the isolated browser-test fixture. Replies appear
in-site; this first version does not send email/SMS notifications or attachments.

Run `npm run test:support` for browser-state/privacy helper tests. No new
frontend environment variables or third-party widget subscription are required.

# BGSNL website

Next.js 16 App Router frontend for Bulgarian Society Netherlands.

## Development in one Docker container

Start Docker Desktop, then run from this checkout:

```bash
npm run dev:all       # first run builds the image; later starts reuse it
npm run dev:logs      # combined logs (Ctrl+C stops following logs)
npm run dev:stop      # stop every process in the container
```

The website stays at http://localhost:3000, API at http://localhost:8080/api/v1,
and Mailer at http://localhost:6000/health. One container runs Next.js, API,
Mailer, Redis, the spreadsheet queue worker, and Stripe test webhook forwarding.
The parent `node start-local.mjs` launcher now starts this Docker stack too.
Only Docker Desktop is required when using the direct commands below; the
Node/npm launcher shortcuts additionally require Node on the host:

```bash
docker compose -f compose.dev.yml up -d --wait --wait-timeout 300
docker compose -f compose.dev.yml stop
```

Source folders are mounted for hot reload. Next.js uses polling, the API/worker
use nodemon legacy watching, and the Mailer uses tsx watching with polling enabled.
Dependencies and Next.js output live in Docker volumes, separate from host files.
Changed package manifests/lockfiles are installed on the next container start;
use `npm run dev:restart` after changing dependencies or environment files.
Use `npm run dev:build` followed by `npm run dev:all` after changing the Dockerfile
or upgrading the bundled runtimes. `npm run dev:status` shows readiness;
`npm run dev:check` checks Compose configuration without starting services.

The source image includes all three checkouts but excludes env files, host
node_modules, build output, and Git metadata. At runtime the existing env files
are read from the mounted checkouts. Credentials are not build arguments or
Compose environment values. Redis is private to the container and persists in
its own volume. Stop/start and `docker compose -f compose.dev.yml down` preserve
these volumes; do not use `down -v` unless you intend to erase local Redis data
and dependency/cache volumes.

Outbound internet access remains enabled for configured databases, email,
storage, Sheets and other integrations. Stripe CLI forwards test webhooks into
the container without a public tunnel. Other providers needing inbound webhooks
still need a tunnel to the relevant localhost port. For a service running on
your Mac itself, use `host.docker.internal` rather than `localhost` in its URL.
The existing remote MongoDB and mailer email database remain external; this
does not clone or migrate their data. Triggered email/Sheets actions continue
to use the configured accounts. Default ports bind only to your computer.

Stop an existing host development stack before starting Docker: the Docker
launcher does not terminate processes holding its ports. A service crash stops
the stack; no automatic restart loop runs after you stop the container. Startup
waits for readiness, and `stop` gives processes time to shut down, including Redis.

The build assumes the checkout layout below. The Dockerfile-specific ignore
file limits its parent build context to these three repositories. For a different
layout, update Compose source/context paths and Dockerfile COPY paths together.

## Host development (optional)

Use Node.js 20.9+ and install dependencies in each of the three checkouts:

```bash
npm install
```

Start the complete local stack from this directory:

```bash
npm run dev:host
```

This replaces listeners on **3000 (BGSNL), 8080 (BGSNL-API), and 6000
(Domakin-Mailer)**, then starts Mailer, the Stripe test webhook listener, the API,
and the website in dependency order and waits for readiness. Existing listeners receive SIGTERM first (up to 30 seconds),
then SIGKILL if the same listener is still holding its port. Recognized dev
watchers in that listener's checkout are stopped too. No other ports are cleared.
In particular, an unrelated app currently using one of these three ports will
be stopped. Ctrl+C shuts down this launcher's stack; a startup failure stops
the other services instead of leaving a partially started stack.

To inspect configuration and occupied ports **without stopping anything**:

```bash
npm run dev:host:check
```

From the parent `BGSNL website` directory, the equivalent startup command is
`node BGSNL/scripts/dev-services.mjs`.

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
The launcher requires macOS/Linux, `lsof`, the Stripe CLI, and installed dependencies; it never
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
not create or migrate databases or modify production provider routes. Stripe
keys are overridden only in the local API process as described below.
The mailer's BGSNL email-store database and configured delivery provider must
be reachable; a failing `/health` stops startup with an error.

Two legacy email flows require additional template setup before testing:

- The contest-materials UUID `c130f73a-17f7-4fe8-be84-4acf9d5d2800` is absent
  from the existing mailer snapshot. Import and register the original template.
- The old Resend campaign `gala-festival-invitation-1` needs a matching local
  snapshot and an explicit `DOMAKIN_RESEND_TEMPLATE_MAP` JSON object in the API's
  local env, mapping its Resend ID to that snapshot's UUID. No substitute
  campaign or language is selected automatically.

These gaps are reported by `dev:host:check`. Local delivery errors never fall back
to Mailtrap/Resend, to avoid unintended sends or duplicates.

Launcher tests (use isolated fixture servers, no real databases or emails):

```bash
npm run test:dev-services
```

### Stripe test payments and webhooks

`npm run dev:host` also starts [Stripe CLI forwarding](https://docs.stripe.com/cli/listen).
Install the CLI once with `brew install stripe/stripe-cli/stripe`. A prebuilt
binary at `../.tools/stripe` is also detected; `BGSNL_STRIPE_CLI` overrides both
that path and the `stripe` executable on PATH.

The launcher uses `STRIPE_SECRET_KEY_TEST` and `STRIPE_PUBLISHABLE_KEY_TEST`
from the API's local environment, falling back to the `STRIPE_NL_SECRET_KEY`
and `STRIPE_NL_PUBLISHABLE_KEY` pair. Both must be test keys (`sk_test_` and
`pk_test_`); live keys are rejected. All regional clients in the launched API
use this one test account, so test events from every city reach the same handler.
The CLI authenticates using the same key; a separate `stripe login` is unnecessary.

Events are forwarded to:

```text
http://127.0.0.1:8080/api/v1/webhooks/stripe-payments?region=netherlands
```

The launcher captures the CLI's signing secret, supplies it to all API webhook
secret variables, and only then starts the API. Secrets stay in process memory
and are redacted from listener output. Signature verification remains enabled.
The listener is stopped on Ctrl+C; if it exits unexpectedly, the stack stops too.
`dev:host:check` validates keys and CLI availability without connecting to Stripe.

To test fulfillment, start checkout through the local website and complete it
with a Stripe test payment method. Watch `[stripe-webhooks]` for a forwarded
`checkout.session.completed` event and a `200` response, then confirm the account
or ticket was updated. Generic `stripe trigger` checkout fixtures do not include
BGSNL's checkout metadata and cannot verify its fulfillment flow. Membership
and alumni price IDs must exist in the selected Stripe test account.

The listener receives events for the whole selected test account; use a dedicated
test account when running multiple environments. Test payments can still trigger
the application's real email delivery described above. Existing test sessions
created in a different regional Stripe account should be recreated after restart.

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

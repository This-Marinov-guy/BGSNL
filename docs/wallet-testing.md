# Wallet test setup

Current scope: automatically provisioned account-bound digital cards with public QR links, backend revocation, a live public card page, signed Apple `.pkpass` generation, and Google generic-object creation/update with signed save links. The mock design preview remains separate. Production has not been deployed, Google publishing approval is not yet confirmed, and physical-device installation has not been verified. Automatic updates to already-installed native passes are not implemented; native passes explicitly say **Scan to verify** instead of presenting a stale Active badge.

## Account settings

Settings includes a Membership card row. Device detection runs only after mounting and combines platform hints with an authenticated, no-store backend availability check. There is no browser-brand allowlist: iPhone/Mac browsers can download Apple passes; Android 9+ and Windows/Linux/ChromeOS browsers can use Google's web save flow. HTTPS/top-level and membership/provider-readiness checks still apply. Websites cannot reliably detect whether the native Wallet app is installed. Unavailable badges remain disabled with an explanatory tooltip. Availability is rechecked on click; Google save URLs are restricted to the official HTTPS save endpoint.

Issuance recovers the public card identifier from the strictly validated canonical public URL because the authentication proxy strips top-level `token` fields. Do not weaken that credential filter. Apple uses a native `.pkpass` navigation (not a blob or popup). HTTP issuance failures redirect to `/user?walletError=<fixed-code>#settings`, where the code is consumed and an error toast is shown. Availability, creation, sharing and Google request failures also show toasts. Browser/OS errors after a successful pass handoff cannot be detected by the website, and a cancelled share sheet is not treated as an error.

Regression checks: `node --experimental-vm-modules --test --test-name-pattern='wallet issuers|Apple navigation' scripts/cookie-session.test.mjs` exercises the real credential-stripping proxy and issuance error redirects. After starting the development stack, verify Settings in Safari and another Mac browser: Apple should open the native pass or download a `.pkpass` file, not return JSON. Confirm adding on the actual Apple device separately. Google save flows require the issuer/tester permissions described below.

Member and alumni accounts receive a unique card token automatically. Settings offers **Open**, **Share** (native share sheet or copy link), and the device-supported wallet button. There is no checkbox. Exceptionally, if a card is missing, **Create** replaces those actions and restores them after a successful authenticated POST. Existing users can be backfilled using `BGSNL-API/scripts/backfill-wallet-cards.js`; see the API migration guide. Existing revoked links are not reactivated automatically; explicit Create restores them with a new token. Backend revoke/restore endpoints remain authenticated, CSRF-protected and rate-limited.

Native issuance is gated by `WALLET_ISSUANCE_ENABLED=1` and valid signing credentials. Google additionally requires `GOOGLE_WALLET_ISSUER_ACCESS_VERIFIED=1`, and production requires `GOOGLE_WALLET_PUBLISHING_APPROVED=1`. Development enables signing and verified Google access; production flags must be supplied explicitly after rollout checks. Apple artwork comes from the owner-downloaded official badge package (US_UK); Google artwork comes from its official SVG asset package. Non-English Apple assets were removed from the project.

Records use random 128-bit tokens (22 URL-safe characters), a unique Mongo token index and an account identity key. Both platforms share `https://bulgariansociety.nl/c/{token}`, confirmed by the owner. Account conversions resolve aliases; public reads use current account data. Subscription status is reconciled when the stored billing snapshot is older than one minute. Errors never become Active. The public response excludes email, billing data, tokens and internal IDs; application request-body logging and site analytics are disabled for these routes. Configure hosting/access-log redaction for `/c/*` and `/api/cards/*` separately.

## Local preview

With the existing dev stack running, open `/dev/wallet-card`. Choose member/alumni and active/locked cases. The page fetches `/api/dev/wallet-card` with no-store caching. Refresh status repeats the request. An unknown card returns unavailable, never Active. Both preview API and page are unavailable in production.

In development, Settings → Membership card → **Preview card** opens this preview in a new tab without requiring a supported wallet device or signing credentials. The button is omitted in production because the preview route is development-only. This is a mocked digital-card design preview, not an exact Apple/Google native layout preview, and it never issues a pass.

The v1 background is used unchanged. Fonts come from `public/assets/fonts`. The avatar is a local mock image, not the uploaded example's embedded illustration. The status badge is above the card, pending visual approval. The name and label now use 60px/44px at the 1080px reference scale, increased from 46px/34px for review. The QR background is transparent, with four modules of quiet-zone spacing retained; verify scanning on the final background/device before issuance. Colors and sizes are editable in `specifications.json`. The native payload drafts are not native visual previews; each platform's artwork/layout must still be prepared and approved.

Run `npm run test:wallet` and `npm run wallet:check` from BGSNL. The configuration check exits 1 while credentials are missing, and never prints key contents.

## Credentials

Merge the entries in `.env.wallet.example` into your existing `.env.development.local`; do not overwrite existing values. Keep keys/certificates in the ignored `.wallet-local/` directory, never `public/`. Paths are relative to BGSNL, so the same paths work in the existing Docker bind mount. Restart the frontend after environment changes.

### Apple

1. Registered test Pass Type ID: `pass.nl.bulgariansociety.membership.test`, in Bulgarian Society Netherlands team `826Q79398Y`.
2. Run `npm run wallet:csr` once to create a private key and certificate signing request locally. This refuses to overwrite existing material. Upload only `.wallet-local/apple/pass.csr` to Apple; retain the private key locally.
3. Obtain its Pass Type ID certificate and Apple's appropriate WWDR intermediate, then export/convert certificates to PEM. Configure the paths and identifier from `.env.wallet.example`.
4. Certificate identity, key match and WWDR signature are checked by the issuer implementation. Local signed-package tests verify the archive manifest and detached PKCS#7 signature. Test installation on an iPhone before production rollout. The current certificate uses the previously registered `.test` identifier; any switch to a different production identifier needs a matching certificate/key pair.

Official guide: https://developer.apple.com/help/account/capabilities/create-wallet-identifiers-and-certificates

### Google

Use `bulgariansocietynetherlands@gmail.com` as the owner, not the unrelated Domakin account.

1. Verified BGSNL Wallet issuer: `3388000000023197450`, in demo mode. The existing two loyalty-card draft classes were not changed. The merchant ID is not the numeric Wallet issuer ID.
2. Keep the issuer in demo mode. Add intended tester Google accounts.
3. Cloud project created by the owner: **User Engagement**, ID `user-engagement-509313`. Google Wallet API was enabled on 2026-09-21. Dedicated service account created without project-wide roles: `bgsnl-wallet-issuer@user-engagement-509313.iam.gserviceaccount.com` (ID `106042594026046012600`). Its JSON key is installed locally and issuer Developer access was verified with a successful generic-class list request after the owner granted access. Do not create a duplicate account.
4. Store the service-account JSON key locally and set its path and the numeric issuer ID. Never send the private key in chat.
5. Native issuance creates/reuses `3388000000023197450.bgsnl_membership_v1` and a stable generic object per token; it does not alter the two old loyalty drafts. Object data is written through the API, and the short signed JWT references only the object ID. Verify saving with an allowed tester; request/confirm publishing access before enabling general production issuance. The development payload-draft preview is still unsigned and separate from this implementation.

Official guides:
- https://developers.google.com/wallet/generic/getting-started/issuer-onboarding
- https://developers.google.com/wallet/generic/getting-started/auth/rest

## Phone QR testing

`WALLET_TEST_BASE_URL` defaults to `http://localhost:3000`. A phone interprets localhost as itself. Use an explicitly approved HTTPS test host/tunnel, or a reachable LAN dev address. No tunnel or deployment has been created. The current Docker port binding is loopback-only; a LAN URL alone does not change that.

## Before real membership cards

The owner approved the digital-card design and confirmed `https://bulgariansociety.nl/c/{token}`. Native templates retain the branding and fields but use platform-controlled fonts/layout; they are not copies of the portrait web card. No production deployment or device installation has been verified.

Deployment order:

1. Deploy API changes and verify the `walletCards` unique token index exists. Retain the existing trusted-client-IP forwarding configuration for rate limiting.
2. Deploy the frontend `/c/` pages, API routes and public branding assets, with issuance disabled initially. Keep signing secrets in the frontend server's secret store, never public assets or browser env vars. `.env.wallet.example` lists file-path and base64 secret options.
3. Verify automatic signup provisioning, migration, Open/Share, two different members, repeat requests, Member↔Alumni conversion, Active/Locked transitions, preserved revocation, and unavailable/error states against the deployment. Phone QR scans must resolve on the confirmed HTTPS production domain, not localhost.
4. Enable Apple and demo Google signing for controlled installation tests. Confirm Google publishing access before setting its production approval flag. Do not declare end-to-end success from a signed file or API access check alone.
5. Enable production issuance after device tests and approval of the native layout. Keep checking current membership through the QR page; downloaded passes do not automatically update or disappear after link revocation.

Tests: `BGSNL_TEST_WALLET_SIGNING=1 npm run test:wallet` (frontend, local credentials required for signature verification), and `node --test tests/wallet.test.js` (API). Unit tests use in-memory records; live Mongo concurrency/index behavior and deployment remain integration-test requirements.

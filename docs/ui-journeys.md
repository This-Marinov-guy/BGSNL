# Local UI journeys

The Playwright suite in `e2e/journeys.spec.mjs` exercises signup, event creation
and editing, ticket purchase, internship applications, support reports, and
back office account management in the browser.
It creates a Member, a paid Alumni, and a paid Member with an `active_member`
role for each normal run. Guest internship access is expected to show the
join/login prompt; paid accounts submit an application.

## First run

From the workspace root, with the development environment configured:

```sh
cd BGSNL-API
node scripts/setup-e2e-prices.mjs
cd ..
node start-local.mjs e2e
cd BGSNL
E2E_RUN_WRITES=1 npm run test:e2e
```

The price setup is idempotent and writes the test price IDs to the ignored
`BGSNL/.env.e2e.local` file. `start-local.mjs e2e` starts the same development
stack as the normal start script with an in-memory mailer. It does not send
email. Stripe runs in test mode. The suite refuses to run unless the mock
mailer, localhost site, and test price IDs are present.

The suite writes synthetic accounts, events, tickets, applications, and reports
to the configured development database. It also edits the event, updates the
Member and Alumni profiles, assigns an active Member role, and transfers those
two accounts between Member and Alumni through the owner checkout UI. Each
normal run uses new account and event names. It does not clean up those records.
Playwright saves screenshots
and traces for failures under `test-results/` and an HTML report under
`playwright-report/`; both are ignored by Git.

The tests run in order with one worker because the later role journeys use
accounts and an event created by the first four tests. The active Member role
is assigned only to the newly created `e2e-active-*` account by the guarded
development script after paid signup completes. The same guarded script adds
an admin role to that synthetic account after the customer journeys, so the
back office tests can use the accounts created earlier in the run. Transfer
requests use the mock mailer. The tests open the equivalent owner link after
verifying that the back office queued the email, then confirm the plan change
in Stripe's test Billing Portal. The price setup creates a separate test
product for each plan, as required by the Billing Portal.

For local debugging, `E2E_REUSE_RUN_ID=<id>` reuses the three synthetic accounts
from a previous run; the first three tests verify login instead of creating
new accounts. The event title still receives a fresh suffix. Omit this variable
to test the complete creation flows. Set `E2E_RUN_ID=<id>` to give a fresh run
a known ID while still creating its accounts.
`E2E_SKIP_TRANSFER_REQUEST=1` resumes only the owner side of transfer tests
when a transfer email was already queued for a reused account. The normal run
always submits the back office request.

## Run one journey

```sh
E2E_RUN_WRITES=1 npm run test:e2e -- -g 'submit a support ticket'
```

Role journeys require accounts from the same run. Use the full suite for a
fresh run, or set `E2E_REUSE_RUN_ID` when checking a specific role journey.

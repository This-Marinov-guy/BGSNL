# BGSNL design system

Extracted from the existing dashboard and shared controls. The typography policy below applies sitewide; the dashboard sections apply to overview/list screens, excluding event creation and editing.

Character: a compact, approachable administration workspace in the existing BGSNL brand.

## Sitewide typography

Roboto body copy uses weight 400 so paragraphs remain comfortable to read. Labels, navigation, and controls use 500; LeagueSpartan headings and deliberate emphasis use 600. These roles apply at mobile and desktop widths. Archive is the display font exception: its established weights, including the homepage hero and footer title, stay intact.

## Dashboard tokens
Defined on `.page` in `src/screens/userActions/dashboard-workspace.module.scss`:
- `--dashboard-accent: #017363`: established green for selected navigation and primary actions.
- `--dashboard-ink: #19251f`: existing dark text, readable on pale panels.
- `--dashboard-muted: #607168`: established secondary text, keeping descriptions subordinate.
- `--dashboard-surface: #f0f5f1`: existing pale green for grouped information.
- `--dashboard-tutorial-surface: #dceaff` and `--dashboard-tutorial-link: #234e91`: established blue pair from role badges, used to distinguish the tutorial banner while keeping its link legible.
- `--dashboard-radius: .75rem`: existing card/control shape, shared across the workspace.
- `--dashboard-gutter: clamp(1rem, 3vw, 2rem)`: 16px minimum mobile breathing room, up to 32px on desktop.

## Typography and spacing
LeagueSpartan, Roboto, sans-serif. Body/control text stays at least 1rem. Dashboard headings scale from 2rem to 3rem with 1.1 line height. Use 4/8/12/16/24/32px spacing: small gaps inside controls, 24px between sections. Panels follow their content; the two overview banners share their grid row height so their bottom-right actions align.

## Components
- Badges: solid semantic fills, no contrasting border, compact `.18rem .45rem` padding, `.45rem` corner radius, LeagueSpartan 600, and white text (`--badge-text`). Amber and other visually lighter fills use warm off-white (`--badge-text-soft`); the fills are dark enough for readable light text. Website badge tokens live in `src/styles/globals.scss`; email markup uses equivalent pixel values inline for email-client compatibility. This keeps status, region, ticket, and role labels consistent without enlarging dense lists.
- Main navigation: green current-area fill, neutral inactive links; mobile native disclosure overlays content below its trigger. Local management/analytics navigation uses a pale green track and white selected segment.
- Buttons: existing solid green primary, outlined secondary and cancellation, solid red filter reset. Minimum interactive target 44px. Visible keyboard focus, no autofocus.
- Overview banners: matching row height on desktop; underlined link-style actions sit at the bottom right with 44px touch targets. The access action remains a button because it opens a dialog.
- Filters: retain blue label panel; desktop fields share a row and reset uses a 44px column. Tablet two columns; mobile disclosure with stacked fields and a labelled reset.
- Cards: existing complete border, compact image at upper right, two-column facts. No decorative single-edge borders.
- Accounts: desktop table with contained horizontal scroll; mobile identity first, region and actions second. Long names and email addresses wrap.
- Guest list: desktop table; mobile rows use compact cards with name and actions first, email beneath, type and presence together, and short metadata on one line. The modal body scrolls vertically beneath its fixed header, including in fullscreen mode.
- Internships: compact identity row, labelled availability toggle, separate edit/delete actions and a 44px drag handle with arrow-key reordering. Layout is CSS-based, without viewport resize state.
- Motion: existing short 150–250ms transitions; respect reduced motion.

## Copy and states

Dashboard page headers show the title and any primary action without a descriptive subtitle.

Event campaign modals reuse the shared AppModal and event-form buttons. The local
`--campaign-accent`, `--campaign-ink`, `--campaign-surface` and `--campaign-radius`
tokens mirror the dashboard values above so the portal and after-save review do
not require the dashboard page wrapper. Radio groups use pale flat panels,
with 12px inside-group gaps and 24px between groups. Choose and review are separate
steps; sending requires a recipient count, previews and explicit confirmation.
The email preview is a contained 28rem document viewport (not a content panel).
`--campaign-warning-surface: #fff4d6` and `--campaign-warning-ink: #674707`
reuse the shared loading-recovery warning palette for closed/nearly-full sales.
Use concise sentence case and action verbs. Keep real counts, loading skeletons, specific retry errors and existing empty states. Preserve URL-driven filtering, pagination and modals and existing permission checks.

The interaction and responsive specification is in `docs/dashboard-ux.md`.

Monthly summary follows the dashboard tokens and uses flat pale-green sections,
one primary Save news action, and one expanded news item at a time. The email
preview is a contained 40rem document viewport, not a fixed-height content panel.
News is optional; the automatic email still runs without it. Loading uses the
shared skeleton and failures use the shared icon-only retry banner.

Metrics views place the Events and Members tabs beside the page title, above the existing full-width, layered layout:
filters, flat pale-green totals, then event and member charts. Native date fields and
the existing filter panel handle regional scope and academic-year defaults.
The charts use the dashboard accent for data and include a text table for
screen readers; chart cards keep the dashboard radius and content-based height.
Event metric cards share their row height. The total-ticket breakdown reuses
the established green for members and red for guests.

# BGSNL design system

Extracted from the existing dashboard and shared controls. This pass applies to dashboard overview/list screens, excluding event creation and editing.

Character: a compact, approachable administration workspace in the existing BGSNL brand.

## Dashboard tokens
Defined on `.page` in `src/screens/userActions/dashboard-workspace.module.scss`:
- `--dashboard-accent: #017363`: established green for selected navigation and primary actions.
- `--dashboard-ink: #19251f`: existing dark text, readable on pale panels.
- `--dashboard-muted: #607168`: established secondary text, keeping descriptions subordinate.
- `--dashboard-surface: #f0f5f1`: existing pale green for grouped information.
- `--dashboard-radius: .75rem`: existing card/control shape, shared across the workspace.
- `--dashboard-gutter: clamp(1rem, 3vw, 2rem)`: 16px minimum mobile breathing room, up to 32px on desktop.

## Typography and spacing
LeagueSpartan, Roboto, sans-serif. Body/control text stays at least 1rem. Dashboard headings scale from 2rem to 3rem with 1.1 line height. Use 4/8/12/16/24/32px spacing: small gaps inside controls, 24px between sections. Panels follow their content; no forced equal heights.

## Components
- Main navigation: green current-area fill, neutral inactive links; mobile native disclosure overlays content below its trigger. Local management/analytics navigation uses a pale green track and white selected segment.
- Buttons: existing solid green primary, outlined secondary and cancellation, solid red filter reset. Minimum interactive target 44px. Visible keyboard focus, no autofocus.
- Filters: retain blue label panel; desktop fields share a row and reset uses a 44px column. Tablet two columns; mobile disclosure with stacked fields and a labelled reset.
- Cards: existing complete border, compact image at upper right, two-column facts. No decorative single-edge borders.
- Accounts: desktop table with contained horizontal scroll; mobile identity first, region and actions second. Long names and email addresses wrap.
- Internships: compact identity row, labelled availability toggle, separate edit/delete actions and 44px up/down reorder controls alongside drag-and-drop. Layout is CSS-based, without viewport resize state.
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

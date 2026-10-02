# BGSNL dashboard UX

## Intent
Board members and administrators need to find events, people and operational work quickly on desktop and on phones. Keep regional permissions, URL-controlled filters and modal behaviour. Exclude event creation and editing.

## Layout
Desktop:
[← Account] [Overview | Events | Members | Internships | Support | System]
[Manage / Analytics]
[Page title                                       Primary action]
[Filters: all fields in one row                              Reset]
[Content: two-column cards or a full-width table]

Mobile:
[←] [Current dashboard area                         ▾]
[Manage | Analytics]
[Page title]
[Primary / secondary actions]
[Filters                                           ▾]
[Cards: identity row, then two-column facts/actions]

## Decisions
- One shared permission-aware section navigation avoids returning to the overview for every task.
- Mobile area navigation opens over the content below it without shifting the page or creating horizontal scrolling.
- Compact segmented local navigation wraps text; filters stack on phones, use two columns on tablets and one row on desktop.
- Content-sized panels and consistent 16px mobile gutters reduce nested boxes and avoid empty stretching.
- Preserve the existing green, pale green, cream and blue label palette and LeagueSpartan typography.

## Required states and accessibility
Keep existing loading skeletons, retry, empty, export-in-progress and pagination states. Preserve URL query ownership. Links have current-page semantics; mobile disclosure exposes expanded state natively. Controls have visible keyboard focus and at least 44px targets. Text wraps; tables alone may scroll horizontally. No autofocus. Respect reduced motion.

## Validation
Check overview, events/manage/analytics, accounts/manage/statistics, internships, support and monitoring at mobile, tablet and desktop widths. Exercise navigation, filter disclosure, query persistence and long labels. Confirm event form sources are untouched. No open product questions.


## Verification and UX review
- No blocking UX issue in the changed layouts after correcting inherited equal-height event cards, desktop tab wrapping and centred mobile account text.
- Permission-aware navigation uses the existing administration access configuration. Event create/edit files are unchanged.
- Visual checks used temporary synthetic fixtures for event cards, account rows, filters and navigation at 320, 390, 768 and 1440px. No viewport overflow; tablet filters have two columns, desktop reset retains a 44px column. Mobile section/filter disclosures were exercised.
- All six main dashboard routes compiled and returned HTTP 200. Sass compilation, ESLint, minimum font sizes and 13 administration/filter/modal tests passed.
- Three internship application-access tests fail on both HEAD and the working tree. No membership/access logic changed in this pass.
- Authenticated backend data and mutation flows were not exercised because a signed-in local session was unavailable. Temporary fixture code was removed.

# Frontend resource-lifecycle audit — 20 September 2026

## Scope

Follow-up to the event-details request loop. Scanned 484 JavaScript/JSX/MJS modules and 173 effect declarations, then reviewed request dependencies, polling, event listeners, image previews, timers, and animation cleanup. This was a source audit with targeted browser checks, not a production load test or a complete Core Web Vitals benchmark.

## Fixed in this audit

| Area | Finding | Change |
| --- | --- | --- |
| Header navigation | Scroll cleanup passed a different anonymous function, leaving the original listener attached after unmount. Dropdown handlers were rebound through a document-wide query every render. | Remove the exact listener; batch scroll updates through one animation frame; disconnect the resize observer; delegate dropdown clicks once within the header. |
| Multi-image upload | Generated object URLs survived unmount or replacement of the image list. Image processing could finish after the component disappeared. | Track owned preview URLs and revoke them on removal, replacement, and unmount. Avoid allocating previews or updating state after unmount. |
| Single-image preview | FileReader continued after file replacement or unmount. | Detach the callback and abort an unfinished read during cleanup. |
| Accounts and analytics | Stale results were ignored, but superseded requests continued consuming browser resources. | Abort account searches, member statistics, and event analytics requests when dependencies change or the view unmounts. |
| Ticket purchase pages | Event and account requests could continue after navigation. | Abort both requests on cleanup, guard responses, and use local loading state for background refreshes. |
| GIF search | Pending debounce timers and requests survived unmount; earlier responses could overwrite newer results. | Own the timer and AbortController in an effect; cancel on query change/unmount; guard result updates and encode the query. |

These request changes reuse the shared HTTP hook's AbortSignal support from the preceding event-details fix. Browser cancellation does not guarantee cancellation of server work already underway.

## Reviewed without changes

- Support polling already checks tab visibility, prevents overlapping requests, and cleans up intervals/controllers.
- Account polling includes visibility and in-flight guards; payment polling has bounded attempts and skips hidden tabs.
- The global background animation cancels scheduled work and listeners.
- The recommendation banner gained caching in a concurrent change. That update was preserved and was not authored as part of this audit.
- No additional request loop was confirmed in the inspected effects.

## Verification

- Focused ESLint passed for all nine files changed in this audit.
- Production build passed using `next build --webpack`, including generation of 70 static pages.
- An isolated browser harness using the actual GIF component confirmed one started search and one cancellation when the component unmounted.
- The public event page rendered and its Buy ticket link opened checkout with the event, price, questions, add-ons, and booking form. No booking or payment was submitted.
- Temporary browser-test routes were removed before the production build.

## Limits and follow-up observations

- The browser extension rejected the upload fixture through its file-chooser API, so image preview cleanup was reviewed in source but was not exercised end-to-end in the browser.
- Authenticated dashboard cancellation paths were checked in source and by lint/build, not through a full authenticated browser session.
- Browser logs included a hydration warning showing extension-injected Grammarly body attributes and an uncontrolled-to-controlled input warning during checkout. These were not attributed to resource exhaustion; the input warning remains a separate follow-up.
- No claim is made that the exact `ERR_INSUFFICIENT_RESOURCES` condition was reproduced, or that every page has been benchmarked. The audit fixes confirmed lifecycle problems that can accumulate unnecessary browser work.

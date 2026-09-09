<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## UI design rules

- Center standard modals horizontally and vertically in the viewport on desktop
  and mobile, unless a different position is explicitly requested. Keep intentional
  exceptions such as the bottom-right Help widget and fullscreen media previews.
- Step navigation must fit its container without scrolling. On mobile, keep each
  label visible below its step number.
- Do not add eyebrow labels above headings.
- Do not use a border on modal frames.
- Do not use single-edge or partial borders as decorative accents. Prefer spacing,
  a solid background, or a complete enclosing border when separation is needed.

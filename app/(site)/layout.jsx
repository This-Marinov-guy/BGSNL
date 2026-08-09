/**
 * No `dynamic = "force-dynamic"` here on purpose.
 *
 * Forcing dynamic rendering site-wide also disables the routing-layer param
 * allow-list in app/(site)/[region]/layout.jsx, which turns an unknown region
 * into a soft 404 (200 status with 404 content) — bad for a migration whose
 * whole point is SEO. Routes that genuinely need per-request rendering opt in
 * individually with their own `export const dynamic = "force-dynamic"`.
 */
export default function SiteLayout({ children }) {
  return children;
}

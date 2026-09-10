/**
 * Legacy client-side head writer retained as a no-op for compatibility with
 * legacy screens. App Router metadata is now the single owner of title,
 * canonical, robots and social tags, so hydration cannot create duplicates.
 */
const PageHelmet = () => null;

export default PageHelmet;

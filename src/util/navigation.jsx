"use client";

/**
 * Compatibility layer that provides the small slice of the react-router-dom API
 * this codebase used, implemented on top of next/navigation and next/link.
 *
 * The migration touched 98 files; rewriting every call site by hand would have
 * been far riskier than adapting the six hooks/components actually in use:
 *   Link (55) · useParams (33) · useNavigate (33) · useLocation (9)
 *   useSearchParams (6) · Navigate (3)
 *
 * Everything here delegates to Next — <Link> renders a real next/link, so
 * prefetching and client navigation are Next's, not a polyfill's.
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import NextLink from "next/link";
import {
  useParams,
  useSearchParams as useNextSearchParams,
  usePathname,
  useRouter,
} from "next/navigation";

export { useParams, usePathname, useRouter };

const toPath = (to) => {
  if (typeof to === "string") return to;
  if (!to) return "/";
  return `${to.pathname ?? ""}${to.search ?? ""}${to.hash ?? ""}` || "/";
};

/**
 * react-router's <Link to> -> next/link's <Link href>.
 * `state` and `reloadDocument` have no Next equivalent and are dropped.
 */
export const Link = forwardRef(function Link(
  { to, href, replace, state, reloadDocument, ...rest },
  ref
) {
  return (
    <NextLink ref={ref} href={toPath(to ?? href)} replace={replace} {...rest} />
  );
});

/**
 * react-router's useNavigate(). Supports the numeric history forms used here:
 * navigate(-1) -> back, navigate(0) -> refresh.
 */
export const useNavigate = () => {
  const router = useRouter();

  return useCallback(
    (to, options = {}) => {
      if (typeof to === "number") {
        if (to === 0) return router.refresh();
        return to < 0 ? router.back() : router.forward();
      }
      const path = toPath(to);
      return options.replace ? router.replace(path) : router.push(path);
    },
    [router]
  );
};

/**
 * react-router's useLocation(). `state` is always null — Next has no equivalent.
 *
 * Deliberately built on usePathname() rather than useSearchParams(): reading
 * search params in a client component makes Next bail out of static prerender
 * and emit the nearest Suspense fallback instead of real HTML. Every consumer
 * of `.search`/`.hash` here reads it inside an effect, so taking those from
 * window (empty during SSR) is equivalent and keeps pages prerenderable.
 */
export const useLocation = () => {
  const pathname = usePathname();

  return useMemo(
    () => ({
      pathname: pathname ?? "/",
      search: typeof window === "undefined" ? "" : window.location.search,
      hash: typeof window === "undefined" ? "" : window.location.hash,
      state: null,
      key: "default",
    }),
    [pathname]
  );
};

/**
 * react-router's useSearchParams() -> [params, setParams].
 * next/navigation's own hook returns a read-only value, so the setter is
 * rebuilt here. Like react-router, it pushes by default.
 */
export const useSearchParams = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useNextSearchParams();

  const setSearchParams = useCallback(
    (next, options = {}) => {
      const current = new URLSearchParams(searchParams?.toString() ?? "");
      const resolved = typeof next === "function" ? next(current) : next;
      const params = new URLSearchParams(
        resolved instanceof URLSearchParams ? resolved.toString() : resolved ?? {}
      );
      const qs = params.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;

      return options.replace ? router.replace(url) : router.push(url);
    },
    [router, pathname, searchParams]
  );

  return [searchParams ?? new URLSearchParams(), setSearchParams];
};

/** react-router's <Navigate to replace /> — redirects once on mount. */
export const Navigate = ({ to, replace = false }) => {
  const router = useRouter();
  const path = toPath(to);

  useEffect(() => {
    if (replace) router.replace(path);
    else router.push(path);
  }, [router, path, replace]);

  return null;
};

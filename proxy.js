import { NextResponse } from "next/server";
import { articleSlug } from "@/util/seo/site";
import { paymentCookieName, validPaymentToken } from "@/util/payments/return-policy.mjs";

/**
 * Normalise legacy article links before rendering starts. The old client used
 * underscore slugs with URL-encoded punctuation; current canonical links use
 * clean hyphenated slugs. Doing this at the routing boundary produces a real
 * HTTP 308 instead of a redirect marker inside a streamed 200 response.
 */
export default function proxy(request) {
  if (["/success", "/fail", "/donation/success", "/payment/pending"].includes(request.nextUrl.pathname)) {
    const checkout = request.nextUrl.searchParams.get("checkout");
    const cookieName = paymentCookieName(checkout);
    if (!cookieName || !validPaymentToken(request.cookies.get(cookieName)?.value)) {
      const response = NextResponse.redirect(new URL("/", request.url));
      response.headers.set("Cache-Control", "private, no-store");
      return response;
    }
    // This only rejects obviously unauthorised requests before streaming. A
    // well-formed cookie is still verified against the API/Stripe by the page.
    return NextResponse.next();
  }
  const match = request.nextUrl.pathname.match(
    /^\/articles\/([^/]+)\/([^/]+)$/
  );

  if (!match) return NextResponse.next();

  const [, articleId, encodedSlug] = match;

  try {
    const decodedTitle = decodeURIComponent(encodedSlug).replace(/_/g, " ");
    const canonicalSlug = articleSlug(decodedTitle);

    if (canonicalSlug !== encodedSlug) {
      const destination = request.nextUrl.clone();
      destination.pathname = `/articles/${articleId}/${canonicalSlug}`;
      return NextResponse.redirect(destination, 308);
    }
  } catch {
    // Invalid percent encoding is left to the route, which returns its normal
    // error/not-found response rather than making up a destination.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/articles/:articleId/:articleTitle", "/success", "/fail", "/donation/success", "/payment/pending"],
};

export const SITE_URL = "https://www.bulgariansociety.nl";
export const SITE_NAME = "Bulgarian Society Netherlands";
export const SITE_SHORT_NAME = "BGSNL";
export const DEFAULT_DESCRIPTION =
  "The Bulgarian Society Netherlands connects Bulgarians across the Netherlands through local chapters, cultural events, student initiatives, careers and community.";
export const DEFAULT_IMAGE = `${SITE_URL}/assets/images/splashscreens/welcome.png`;

const OG_TYPES = new Set(["website", "article", "book", "profile"]);

export function absoluteUrl(value, fallback = DEFAULT_IMAGE) {
  if (!value) return fallback;

  try {
    return new URL(value, `${SITE_URL}/`).toString();
  } catch {
    return fallback;
  }
}

export function stripHtml(value = "") {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncateText(value = "", maxLength = 160) {
  const text = stripHtml(value);
  const characters = Array.from(text);

  if (characters.length <= maxLength) return text;

  const shortened = characters
    .slice(0, Math.max(1, maxLength - 1))
    .join("")
    .replace(/\s+\S*$/, "")
    .trimEnd();

  return `${shortened || characters.slice(0, maxLength - 1).join("")}…`;
}

export function toMetadata({
  title,
  description,
  image,
  imageAlt,
  path = "/",
  type = "website",
  robots,
  useGeneratedImage = false,
}) {
  const canonicalUrl = absoluteUrl(path, SITE_URL);
  const resolvedTitle = stripHtml(title || SITE_NAME).trim();
  const resolvedDescription = truncateText(description || DEFAULT_DESCRIPTION);
  const resolvedImage = absoluteUrl(image, DEFAULT_IMAGE);
  const resolvedImageAlt = imageAlt || `${resolvedTitle} — ${SITE_SHORT_NAME}`;
  const isDefaultImage = resolvedImage === DEFAULT_IMAGE;

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    alternates: { canonical: canonicalUrl },
    ...(robots ? { robots } : {}),
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      url: canonicalUrl,
      siteName: SITE_SHORT_NAME,
      type: OG_TYPES.has(type) ? type : "website",
      locale: "en_NL",
      ...(!useGeneratedImage
        ? {
            images: [
              {
                url: resolvedImage,
                alt: resolvedImageAlt,
                ...(isDefaultImage
                  ? { width: 1200, height: 630, type: "image/png" }
                  : {}),
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: resolvedDescription,
      ...(!useGeneratedImage
        ? { images: [{ url: resolvedImage, alt: resolvedImageAlt }] }
        : {}),
    },
  };
}

export function humanizeRegion(region = "") {
  return region
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" & ");
}

export function articleSlug(title = "") {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "article";
}

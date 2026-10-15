import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { SITE_URL } from "./site";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const LOCAL_IMAGES = path.join(process.cwd(), "public", "assets", "images");

function imageLocation(source) {
  if (typeof source !== "string" || !source.trim()) return null;

  let url;
  try {
    url = new URL(source, SITE_URL);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443")) return null;

  if (url.hostname === "www.bulgariansociety.nl" && url.pathname.startsWith("/assets/images/")) {
    let file;
    try {
      file = path.resolve(process.cwd(), "public", `.${decodeURIComponent(url.pathname)}`);
    } catch {
      return null;
    }
    if (file.startsWith(`${LOCAL_IMAGES}${path.sep}`)) return { file };
    return null;
  }

  const host = url.hostname.toLowerCase();
  if (
    host === "res.cloudinary.com" ||
    host === "wordpress.com" || host.endsWith(".wordpress.com") ||
    host === "wp.com" || host.endsWith(".wp.com") ||
    host === "bulgariansociety.nl" || host.endsWith(".bulgariansociety.nl")
  ) return { url: url.toString() };

  return null;
}

export async function loadShareImage(source) {
  const location = imageLocation(source);
  if (!location) return null;

  try {
    let bytes;
    if (location.file) {
      bytes = await readFile(location.file);
    } else {
      const response = await fetch(location.url, {
        signal: AbortSignal.timeout(4000),
        redirect: "error",
        next: { revalidate: 3600 },
      });
      if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) return null;
      if (Number(response.headers.get("content-length")) > MAX_IMAGE_BYTES) return null;
      bytes = Buffer.from(await response.arrayBuffer());
    }

    if (bytes.byteLength > MAX_IMAGE_BYTES) return null;
    const jpeg = await sharp(bytes, { limitInputPixels: 30_000_000 })
      .rotate()
      .resize(900, 900, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  } catch {
    return null;
  }
}

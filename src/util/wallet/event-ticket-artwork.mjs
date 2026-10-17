import sharp from "sharp";

// Wallet images do not accept CSS, so round the chapter mark in the PNG itself.
export async function circularEventLogo(source, size) {
  const mask = Buffer.from(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`);
  return sharp(source).resize(size, size, { fit: "cover" }).ensureAlpha()
    .composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
}

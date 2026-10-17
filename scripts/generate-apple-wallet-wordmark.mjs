// Generate checked-in artwork from bundled Archive glyph outlines, never system fonts.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { EVENT_TICKET_REGIONS, eventTicketBrand } from "../src/util/wallet/event-ticket-brand.mjs";
import { circularEventLogo } from "../src/util/wallet/event-ticket-artwork.mjs";
// Reuse the font parser shipped with the project's pinned Next.js version.
import fontkit from "next/dist/compiled/@next/font/dist/fontkit/index.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const font = fontkit.default(await readFile(path.join(root, "public/assets/fonts/Archive-Regular.ttf")));
const destination = path.join(root, "public/assets/wallet-cards/apple");
const googleDestination = path.join(root, "public/assets/wallet-cards/google");
await mkdir(destination, { recursive: true });
await mkdir(googleDestination, { recursive: true });
function wordmarkLines(shortName) {
  return ["BULGARIAN", "SOCIETY", shortName.toUpperCase()].map((title, index) => {
    const run = font.layout(title);
    const ratio = Math.min(13 / font.unitsPerEm, 107 / run.advanceWidth);
    let advance = 0;
    const glyphs = run.glyphs.map((glyph, i) => {
      if (!glyph.id) throw new Error("Archive is missing a required title glyph");
      const position = run.positions[i];
      const outline = `<path transform="translate(${advance + position.xOffset} ${position.yOffset})" d="${glyph.path.toSVG()}"/>`;
      advance += position.xAdvance;
      return outline;
    }).join("");
    return `<g transform="translate(51 ${15 + index * 14}) scale(${ratio} ${-ratio})">${glyphs}</g>`;
  }).join("");
}
const variants = [
  { variant: "logo", brand: eventTicketBrand(), color: "#000000" },
  { variant: "event-logo", brand: eventTicketBrand(), color: "#ffffff" },
  ...EVENT_TICKET_REGIONS.map(region => ({ variant: `event-logo-${region}`, brand: eventTicketBrand(region), color: "#ffffff" })),
];
async function renderWordmark(scale, brand, color, roundMark = true) {
  const source = path.join(root, "public/assets/images/logo", brand.logoFile);
  const mark = roundMark ? await circularEventLogo(source, 46 * scale) :
    await sharp(source).resize(46 * scale, 46 * scale, { fit: "contain", background: "#00000000" }).png().toBuffer();
  const title = Buffer.from(`<svg width="${160 * scale}" height="${50 * scale}" viewBox="0 0 160 50" xmlns="http://www.w3.org/2000/svg"><g fill="${color}">${wordmarkLines(brand.shortName)}</g></svg>`);
  return sharp({ create: { width: 160 * scale, height: 50 * scale, channels: 4, background: "#00000000" } })
    .composite([{ input: mark, left: 0, top: 2 * scale }, { input: title, left: 0, top: 0 }])
    .png().toBuffer();
}
for (const scale of [1, 2, 3]) {
  for (const { variant, brand, color } of variants) {
    await writeFile(path.join(destination, `${variant}${scale === 1 ? "" : `@${scale}x`}.png`),
      await renderWordmark(scale, brand, color, variant !== "logo"));
  }
}
for (const region of ["netherlands", ...EVENT_TICKET_REGIONS]) {
  const brand = eventTicketBrand(region);
  await writeFile(path.join(googleDestination, `${region}-event-wide-logo.png`), await renderWordmark(8, brand, "#ffffff"));
  const source = path.join(root, "public/assets/images/logo", brand.logoFile);
  const paddedLogo = await sharp(source).resize(520, 520, { fit: "contain", background: "#ffffff" }).png().toBuffer();
  await writeFile(path.join(googleDestination, `${region}-event-logo.png`),
    await sharp({ create: { width: 660, height: 660, channels: 3, background: "#ffffff" } })
      .composite([{ input: paddedLogo, left: 70, top: 70 }]).png().toBuffer());
}
console.log("Generated national and regional Apple and Google Wallet wordmarks with bundled Archive.");

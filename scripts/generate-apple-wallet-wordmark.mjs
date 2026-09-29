// Generate checked-in artwork from bundled Archive glyph outlines, never system fonts.
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
// Reuse the font parser shipped with the project's pinned Next.js version.
import fontkit from "next/dist/compiled/@next/font/dist/fontkit/index.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const font = fontkit.default(await readFile(path.join(root, "public/assets/fonts/Archive-Regular.ttf")));
const destination = path.join(root, "public/assets/wallet-cards/apple");
await mkdir(destination, { recursive: true });
const ratio = 10 / font.unitsPerEm;
const lines = ["BULGARIAN SOCIETY", "NETHERLANDS"].map((title, index) => {
  const run = font.layout(title);
  if (run.advanceWidth * ratio > 107) throw new Error("Wallet title exceeds its image bounds");
  let advance = 0;
  const glyphs = run.glyphs.map((glyph, i) => {
    if (!glyph.id) throw new Error("Archive is missing a required title glyph");
    const position = run.positions[i];
    const outline = `<path transform="translate(${advance + position.xOffset} ${position.yOffset})" d="${glyph.path.toSVG()}"/>`;
    advance += position.xAdvance;
    return outline;
  }).join("");
  return `<g transform="translate(51 ${21 + index * 16}) scale(${ratio} ${-ratio})">${glyphs}</g>`;
}).join("");
for (const scale of [1, 2, 3]) {
  const mark = await sharp(path.join(root, "public/assets/images/logo/logo-nl-circle.png"))
    .resize(46 * scale, 46 * scale, { fit: "contain", background: "#00000000" }).png().toBuffer();
  const title = Buffer.from(`<svg width="${160 * scale}" height="${50 * scale}" viewBox="0 0 160 50" xmlns="http://www.w3.org/2000/svg"><g fill="#FFFFFF">${lines}</g></svg>`);
  await sharp({ create: { width: 160 * scale, height: 50 * scale, channels: 4, background: "#00000000" } })
    .composite([{ input: mark, left: 0, top: 2 * scale }, { input: title, left: 0, top: 0 }])
    .png().toFile(path.join(destination, `logo${scale === 1 ? "" : `@${scale}x`}.png`));
}
console.log("Generated Apple Wallet wordmarks at 1x, 2x and 3x with bundled Archive in white.");

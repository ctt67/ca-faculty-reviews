/**
 * Careviews logo asset generator
 *
 * Generates all PNG / ICO assets from the SVG source files.
 * Uses `sharp`, which ships with Next.js — no extra install needed.
 *
 * Run from the project root:
 *   node scripts/generate-logo-assets.mjs
 *
 * Outputs to public/logo/ and public/ (favicons, touch icons).
 *
 * NOTE: Full-lockup PNGs (with wordmark) use the browser-based exporter
 * instead: open public/logo/export-full-logo.html in Chrome.
 * Sharp cannot fetch Google Fonts, so mark-only assets are generated here.
 */

import sharp from "sharp";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root   = join(__dirname, "..");
const LOGO   = join(root, "public", "logo");
const PUBLIC = join(root, "public");

mkdirSync(LOGO,   { recursive: true });

// ── SVG source strings (mark only — no font dependency) ──────────────────────

const MARK_NAVY = `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M 72 11.9 A 44 44 0 1 0 72 88.1 L 64.5 75.1 A 29 29 0 1 1 64.5 24.9 Z" fill="#1B3055"/>
  <circle cx="82" cy="50" r="8" fill="#C9A84C"/>
</svg>`;

const MARK_WHITE = `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M 72 11.9 A 44 44 0 1 0 72 88.1 L 64.5 75.1 A 29 29 0 1 1 64.5 24.9 Z" fill="#ffffff"/>
  <circle cx="82" cy="50" r="8" fill="#D9BE6A"/>
</svg>`;

const APP_ICON_SVG = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="112" fill="#1B3055"/>
  <g transform="translate(76,76) scale(3.6)">
    <path d="M 72 11.9 A 44 44 0 1 0 72 88.1 L 64.5 75.1 A 29 29 0 1 1 64.5 24.9 Z" fill="#ffffff"/>
    <circle cx="82" cy="50" r="8" fill="#D9BE6A"/>
  </g>
</svg>`;

const PROFILE_SVG = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="256" cy="256" r="256" fill="#1B3055"/>
  <g transform="translate(76,76) scale(3.6)">
    <path d="M 72 11.9 A 44 44 0 1 0 72 88.1 L 64.5 75.1 A 29 29 0 1 1 64.5 24.9 Z" fill="#ffffff"/>
    <circle cx="82" cy="50" r="8" fill="#D9BE6A"/>
  </g>
</svg>`;

// ── Helper ────────────────────────────────────────────────────────────────────

async function svgToPng(svgString, outPath, size, { background } = {}) {
  const buf = Buffer.from(svgString);
  let pipeline = sharp(buf, { density: 300 }).resize(size, size);
  if (background) pipeline = pipeline.flatten({ background });
  await pipeline.png().toFile(outPath);
  console.log(`  ✓  ${outPath.replace(root, "")}`);
}

// ── Minimal ICO encoder (16/32/48 px) ────────────────────────────────────────
// Format: ICONDIR + ICONDIRENTRY[] + PNG blobs

async function makeFaviconIco(sizes, icoPath) {
  const pngs = await Promise.all(
    sizes.map(async (size) => {
      const svg = Buffer.from(MARK_NAVY);
      return sharp(svg, { density: 300 }).resize(size, size).png().toBuffer();
    })
  );

  const headerSize  = 6;
  const entrySize   = 16;
  const dataOffset  = headerSize + entrySize * pngs.length;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);           // reserved
  header.writeUInt16LE(1, 2);           // type = icon
  header.writeUInt16LE(pngs.length, 4);

  let currentOffset = dataOffset;
  const entries = pngs.map((png, i) => {
    const size = sizes[i];
    const entry = Buffer.alloc(entrySize);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);   // width  (0 = 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1);   // height
    entry.writeUInt8(0, 2);                          // color count
    entry.writeUInt8(0, 3);                          // reserved
    entry.writeUInt16LE(1, 4);                       // color planes
    entry.writeUInt16LE(32, 6);                      // bits per pixel
    entry.writeUInt32LE(png.length, 8);              // image size
    entry.writeUInt32LE(currentOffset, 12);          // file offset
    currentOffset += png.length;
    return entry;
  });

  writeFileSync(icoPath, Buffer.concat([header, ...entries, ...pngs]));
  console.log(`  ✓  ${icoPath.replace(root, "")}`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\nGenerating Careviews logo assets…\n");

  // Mark — transparent background
  await svgToPng(MARK_NAVY,  join(LOGO, "careviews-mark-navy-4096.png"),  4096);
  await svgToPng(MARK_NAVY,  join(LOGO, "careviews-mark-navy-1024.png"),  1024);
  await svgToPng(MARK_WHITE, join(LOGO, "careviews-mark-white-4096.png"), 4096);
  await svgToPng(MARK_WHITE, join(LOGO, "careviews-mark-white-1024.png"), 1024);

  // App icon (rounded-rect, navy bg)
  await svgToPng(APP_ICON_SVG(512), join(LOGO, "careviews-app-icon-512.png"),   512);
  await svgToPng(APP_ICON_SVG(512), join(LOGO, "careviews-app-icon-192.png"),   192);
  await svgToPng(APP_ICON_SVG(512), join(PUBLIC, "android-chrome-512x512.png"), 512);
  await svgToPng(APP_ICON_SVG(512), join(PUBLIC, "android-chrome-192x192.png"), 192);

  // Apple Touch Icon (circular on navy — 180×180)
  await svgToPng(PROFILE_SVG(512), join(PUBLIC, "apple-touch-icon.png"), 180);
  await svgToPng(PROFILE_SVG(512), join(LOGO,   "careviews-profile-512.png"), 512);

  // Favicon .ico (16, 32, 48 px)
  await makeFaviconIco([16, 32, 48], join(PUBLIC, "favicon.ico"));

  console.log("\nDone! Full-lockup PNGs (with wordmark) → open public/logo/export-full-logo.html in Chrome.\n");
}

main().catch((err) => { console.error(err); process.exit(1); });

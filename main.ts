// gta6-meme-x-01 entry for @cerylay (v3) — Node 22, standard library only.
//
// The program's only job is to hand POST.json to the gate. The entry itself
// is the X post named in POST.json: a Leonida Airlines boarding pass meme,
// posted from @cerylay30, with make.fun's ghost as the passenger photo, the
// mark as the airline logo, and the make.fun pitch in the footer.
// Nothing this program writes about the post is judged: the house reads
// the post itself from X (its first picture and its text).
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const POST_FILE = "POST.json";

// The gate only accepts an X post address: x.com or twitter.com (with an
// optional www./mobile. prefix), /status/ (or /statuses/, /i/web/status/),
// and an id of digits only. Anything else is refused before grading, so
// check the shape here instead of handing the gate a bad address.
function isXPostUrl(url: string): boolean {
  const m = /^https?:\/\/(?:www\.|mobile\.)?(?:x\.com|twitter\.com)\/(?:[^/]+\/(?:status|statuses)|i\/web\/status)\/(\d+)\/?(?:[?#].*)?$/.exec(url);
  if (!m) return false;
  // The id must fit in 64 bits; compare as a BigInt, never as a string.
  return BigInt(m[1]) < 2n ** 64n;
}

const raw = readFileSync(join(BOT_DIR, POST_FILE), "utf8");
const post: unknown = JSON.parse(raw);
if (typeof post !== "object" || post === null || typeof (post as { url?: unknown }).url !== "string") {
  console.error(`${POST_FILE} must be a JSON object with a url string`);
  process.exit(1);
}
const url = (post as { url: string }).url;
if (!isXPostUrl(url)) {
  console.error(`${POST_FILE} url must be an X post address, e.g. https://x.com/<handle>/status/<id>`);
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
writeFileSync(join(OUTPUT_DIR, POST_FILE), JSON.stringify(post));
console.log(`wrote ${POST_FILE} for ${url}`);

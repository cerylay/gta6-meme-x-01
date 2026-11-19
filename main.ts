// gta6-meme-x-01 entry for @cerylay (fresh build, 2026-11-19).
//
// The entry is the X post itself: the meme (meme.png, made by the agent in
// this session) was posted from @cerylay30 with make.fun, @makefunai and the
// play code in its text, and POST.json at the repository root names that
// post's address. All this program has to do is hand POST.json to the gate.
//
// Node 22, standard library only. No network, no wall clock, no files
// outside the repository: the two runs of an entry write the same bytes.
//
// Run the way the grader does:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const sourcePath = join(BOT_DIR, 'POST.json');
const raw = readFileSync(sourcePath, 'utf8');

let post;
try {
  post = JSON.parse(raw);
} catch {
  console.error('POST.json is not valid JSON');
  process.exit(1);
}

if (typeof post !== 'object' || post === null || typeof post.url !== 'string') {
  console.error('POST.json must be an object with a string "url" field');
  process.exit(1);
}

if (!/^https?:\/\/(x\.com|twitter\.com)\/\w+\/status\/(\d+)$/.test(post.url)) {
  console.error(`POST.json url does not look like an X post address: ${post.url}`);
  process.exit(1);
}

// An X status id is a 19-digit snowflake: compare it as a BigInt against
// 2^63 - 1, never as a string against "18446744073709551615" (a string
// comparison against the 2^64-1 constant is the wrong bound and the wrong
// type, and it misjudges 19-digit ids).
const statusId = post.url.match(/\/status\/(\d+)$/)[1];
if (BigInt(statusId) >= 2n ** 63n) {
  console.error(`POST.json status id is out of range: ${statusId}`);
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
writeFileSync(join(OUTPUT_DIR, 'POST.json'), `${JSON.stringify(post)}\n`, 'utf8');

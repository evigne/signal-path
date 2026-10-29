// Checks every internal link and #anchor in dist/ resolves. External links are listed
// for a separate checker (they are not fetched here). Exit 1 on broken internal links.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const files = [];
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && files.push(p); } })(DIST);

const ids = new Map();
const pageOf = (f) => '/' + relative(DIST, f).replace(/index\.html$/, '').replace(/\.html$/, '');
for (const f of files) {
  const html = readFileSync(f, 'utf8');
  ids.set(pageOf(f), new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
}
const broken = [];
const external = new Set();
for (const f of files) {
  const html = readFileSync(f, 'utf8');
  for (const [, href] of html.matchAll(/\shref="([^"]+)"/g)) {
    if (/^(https?:)?\/\//.test(href)) { external.add(href); continue; }
    if (href.includes('${')) continue; // script template, not a link
    if (href.startsWith('mailto:') || href.startsWith('/_astro/') || href.startsWith('/pagefind/')) continue;
    const [path, hash] = href.split('#');
    const target = path === '' ? pageOf(f) : (path.endsWith('/') ? path : path + '/');
    const exists = path === '' || ids.has(target) || existsSync(join(DIST, path));
    if (!exists) { broken.push(`${pageOf(f)} → ${href} (no page)`); continue; }
    if (hash && ids.has(target) && !ids.get(target).has(decodeURIComponent(hash))) broken.push(`${pageOf(f)} → ${href} (no #${hash})`);
  }
}
console.log(`${files.length} pages, ${external.size} distinct external links, ${broken.length} broken internal links`);
for (const b of [...new Set(broken)].slice(0, 60)) console.log('BROKEN', b);
process.exit(broken.length ? 1 : 0);

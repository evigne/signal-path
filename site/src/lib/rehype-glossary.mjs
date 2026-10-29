// Links the first use of each of a topic's glossary_terms to the glossary and adds a
// definition tooltip (shown on hover and keyboard focus). Skips headings, code, links,
// claim citations and existing glossary links.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const dir = fileURLToPath(new URL('../../../content/glossary/', import.meta.url));
const GLOSSARY = new Map(
  readdirSync(dir)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => parse(readFileSync(dir + f, 'utf8')))
    .map((g) => [g.id, g]),
);

const SKIP = new Set(['a', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'svg', 'script', 'style', 'kbd']);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function forms(g) {
  const out = [g.term, ...(g.aliases || [])].filter((t) => t && t.length >= 3);
  return [...new Set(out)].sort((a, b) => b.length - a.length);
}

export default function rehypeGlossary() {
  return (tree, file) => {
    const fm = file.data?.astro?.frontmatter;
    const ids = fm?.glossary_terms;
    if (!Array.isArray(ids) || !ids.length) return;
    const pending = ids.map((id) => GLOSSARY.get(id)).filter(Boolean);
    let n = 0;

    const visit = (node, skip) => {
      if (!pending.length || !node.children) return;
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (child.type === 'element') {
          const cls = child.properties?.className || [];
          const skipHere = skip || SKIP.has(child.tagName) || cls.includes('claim-head') || cls.includes('claim-cite');
          visit(child, skipHere);
          continue;
        }
        if (skip || child.type !== 'text') continue;
        for (let k = 0; k < pending.length; k++) {
          const g = pending[k];
          const re = new RegExp(`(^|[^\\w-])(${forms(g).map(esc).join('|')})(?![\\w-])`);
          const m = re.exec(child.value);
          if (!m) continue;
          const start = m.index + m[1].length;
          const word = m[2];
          const tipId = `gloss-${g.id}-${n++}`;
          const before = { type: 'text', value: child.value.slice(0, start) };
          const after = { type: 'text', value: child.value.slice(start + word.length) };
          const tip = {
            type: 'element',
            tagName: 'span',
            properties: { id: tipId, role: 'tooltip', className: ['gloss-tip'] },
            children: [
              { type: 'element', tagName: 'strong', properties: {}, children: [{ type: 'text', value: g.expansion && g.expansion !== g.term ? `${g.term} — ${g.expansion}` : g.term }] },
              { type: 'text', value: ` ${g.plain_definition}` },
            ],
          };
          const link = {
            type: 'element',
            tagName: 'span',
            properties: { className: ['gloss'] },
            children: [
              { type: 'element', tagName: 'a', properties: { href: `/glossary/#${g.id}`, className: ['gloss-term'], ariaDescribedBy: tipId }, children: [{ type: 'text', value: word }] },
              tip,
            ],
          };
          node.children.splice(i, 1, before, link, after);
          pending.splice(k, 1);
          i += 1; // continue after the link with the remaining text
          break;
        }
      }
    };
    visit(tree, false);
  };
}

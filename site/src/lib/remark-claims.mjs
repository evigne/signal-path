// Turns :::claim{label source loc} container directives into labelled callouts with
// citations, and ::::beginner / ::::expert depth blocks into <details>. Claims cite
// sources resolved against research/source_register.json. Unknown source IDs or a
// standard/practice claim without a source fail the build, mirroring validate.py.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { visit } from 'unist-util-visit';
import { DIAGRAMS } from './diagrams.mjs';

const registerPath = fileURLToPath(new URL('../../../research/source_register.json', import.meta.url));
const register = new Map(JSON.parse(readFileSync(registerPath, 'utf8')).sources.map((s) => [s.id, s]));

export const LABELS = {
  standard: { text: 'Standard-defined', icon: 'M4 3h9a3 3 0 0 1 3 3v11H7a3 3 0 0 0-3 3V3Zm0 17a3 3 0 0 1 3-3h9' },
  practice: { text: 'Common practice', icon: 'M10 2l2.4 5 5.6.8-4 3.9.9 5.5L10 14.6 5.1 17.2l.9-5.5-4-3.9L7.6 7Z' },
  example: { text: 'Illustrative example', icon: 'M7 2h6v5l4 9a2 2 0 0 1-1.8 2.8H4.8A2 2 0 0 1 3 16l4-9V2Zm-1 0h8' },
  mission: { text: 'Mission-specific', icon: 'M4 18V3m0 1h10l-2 3.5L14 11H4' },
};

// Depth blocks: ::::beginner (intuition, open for Beginner and Intermediate readers)
// and ::::expert (edge cases, open only in Expert mode). Both stay one click away.
const DEPTH = {
  beginner: { chip: 'Intuition' },
  expert: { chip: 'Expert deep dive' },
};

const svg = (d) =>
  `<svg aria-hidden="true" width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;

const text = (value) => ({ type: 'text', value });
const span = (className, children) => ({ type: 'claimSpan', data: { hName: 'span', hProperties: { className } }, children });

function restoreDirective(node) {
  // Text like "a:b" can be mis-read as a directive; put it back as plain text.
  const attrs = node.attributes && Object.keys(node.attributes).length
    ? `{${Object.entries(node.attributes).map(([k, v]) => `${k}="${v}"`).join(' ')}}`
    : '';
  const inner = (node.children || []).map((c) => c.value ?? '').join('');
  return text(`:${node.name}${inner ? `[${inner}]` : ''}${attrs}`);
}

export default function remarkClaims() {
  return (tree, vfile) => {
    // The trailing "## Sources" section in the content files is an authoring note; the
    // topic page renders the real source list (after the inline tool), so drop both.
    const isSourcesHeading = (n) => n?.type === 'heading' && n.depth === 2 && n.children?.[0]?.value === 'Sources';
    tree.children = tree.children.filter((n, i, all) => {
      const isNote = n.type === 'paragraph' && n.children?.[0]?.value?.startsWith('Rendered from the');
      return !isSourcesHeading(n) && !(isNote && isSourcesHeading(all[i - 1]));
    });
    visit(tree, (node, index, parent) => {
      if (node.type === 'leafDirective' && node.name === 'diagram') {
        const make = DIAGRAMS[node.attributes?.name];
        if (!make) throw new Error(`${vfile.path}: unknown diagram "${node.attributes?.name}"`);
        if (parent && index !== undefined) parent.children[index] = { type: 'html', value: make() };
        return;
      }
      if (node.type === 'textDirective' || node.type === 'leafDirective') {
        if (parent && index !== undefined) parent.children[index] = restoreDirective(node);
        return;
      }
      if (node.type !== 'containerDirective') return;
      if (node.name === 'beginner' || node.name === 'expert') {
        const title = node.attributes?.title;
        if (!title) throw new Error(`${vfile.path}: :::${node.name} block needs a title`);
        const meta = DEPTH[node.name];
        node.data = { hName: 'details', hProperties: { className: ['depth-block', `depth-${node.name}`], dataDepthBlock: node.name } };
        node.children = [
          {
            type: 'depthSummary',
            data: { hName: 'summary' },
            children: [span(['depth-chip'], [text(meta.chip)]), span(['depth-title'], [text(title)])],
          },
          { type: 'depthBody', data: { hName: 'div', hProperties: { className: ['depth-body'] } }, children: node.children },
        ];
        return;
      }
      if (node.name !== 'claim') {
        throw new Error(`${vfile.path}: unknown directive :::${node.name}`);
      }
      const { label, source, loc } = node.attributes || {};
      const meta = LABELS[label];
      if (!meta) throw new Error(`${vfile.path}: claim label "${label}" is not standard/practice/example/mission`);
      const ids = (source || '').split(',').map((s) => s.trim()).filter(Boolean);
      if ((label === 'standard' || label === 'practice') && ids.length === 0) {
        throw new Error(`${vfile.path}: ${label} claim needs a source`);
      }
      const cite = [];
      ids.forEach((id, i) => {
        const s = register.get(id);
        if (!s) throw new Error(`${vfile.path}: claim source "${id}" is not in the source register`);
        if (i) cite.push(text(', '));
        cite.push({ type: 'link', url: `/sources/#${id}`, title: s.title, children: [text(s.doc_number && s.doc_number !== '—' ? s.doc_number : s.title)] });
      });
      // The section reference is folded away in Beginner mode (CSS), leaving a short pill.
      if (loc) cite.push(span(['claim-loc'], [text(`${ids.length ? ' ' : ''}${loc}`)]));

      const head = {
        type: 'claimHead',
        data: { hName: 'div', hProperties: { className: ['claim-head'] } },
        children: [
          {
            type: 'claimSpan',
            data: { hName: 'span', hProperties: { className: ['label-chip', `label-${label}`] } },
            children: [{ type: 'html', value: svg(meta.icon) }, text(meta.text)],
          },
          ...(cite.length ? [span(['claim-cite'], cite)] : []),
        ],
      };
      const body = { type: 'claimBody', data: { hName: 'div', hProperties: { className: ['claim-body'] } }, children: node.children };
      node.data = { hName: 'aside', hProperties: { className: ['claim', `claim-${label}`], 'aria-label': meta.text } };
      node.children = [head, body];
    });
  };
}

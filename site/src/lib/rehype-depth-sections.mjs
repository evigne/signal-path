// Wraps the body of the standards-heavy topic sections ("Precise terminology" and
// "Standard, practice and mission choices") in <details data-depth-block="standards">.
// They render open; the depth switch folds them in Beginner mode. Headings stay outside
// the <details> so the on-page contents links keep working.
const FOLDABLE = new Set(['Precise terminology', 'Standard, practice and mission choices']);
const textOf = (n) => (n.type === 'text' ? n.value : (n.children || []).map(textOf).join(''));

export default function rehypeDepthSections() {
  return (tree) => {
    const kids = tree.children;
    const out = [];
    for (let i = 0; i < kids.length; i++) {
      const n = kids[i];
      out.push(n);
      if (n.type === 'element' && n.tagName === 'h2' && FOLDABLE.has(textOf(n).trim())) {
        const body = [];
        while (i + 1 < kids.length && !(kids[i + 1].type === 'element' && kids[i + 1].tagName === 'h2')) body.push(kids[++i]);
        out.push({
          type: 'element',
          tagName: 'details',
          properties: { className: ['depth-section'], dataDepthBlock: 'standards', open: true },
          children: [
            { type: 'element', tagName: 'summary', properties: {}, children: [{ type: 'text', value: 'Show the standards detail (folded in Beginner view)' }] },
            ...body,
          ],
        });
      }
    }
    tree.children = out;
  };
}

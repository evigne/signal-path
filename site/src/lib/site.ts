import { getCollection, type CollectionEntry } from 'astro:content';

export const SECTIONS = [
  { id: 'start-here', title: 'Start Here', blurb: 'The whole chain, both directions, in plain words.' },
  { id: 'fundamentals', title: 'Fundamentals', blurb: 'Bits, symbols, rates, units and time codes.' },
  { id: 'space-link', title: 'Space Link', blurb: 'RF, bands, synchronization, coding, frames and packets.' },
  { id: 'ground-segment', title: 'Ground Segment', blurb: 'Stations, provider networks, SLE and C2 software.' },
  { id: 'operations', title: 'Operations', blurb: 'Telemetry and command lifecycles, databases, files.' },
  { id: 'security-resilience', title: 'Security & Resilience', blurb: 'SDLS, keys, anti-replay and command authority.' },
  { id: 'data-capacity', title: 'Data & Capacity', blurb: 'Contact planning and data return.' },
  { id: 'troubleshooting', title: 'Troubleshooting', blurb: 'Layered fault isolation and symptom guides.' },
  { id: 'labs', title: 'Labs', blurb: 'Interactive tools with fictional data.' },
  { id: 'reference', title: 'Reference', blurb: 'Protocol tables, standards map, glossary and sources.' },
] as const;

export type SectionId = (typeof SECTIONS)[number]['id'];

export const sectionTitle = (id: string) => SECTIONS.find((s) => s.id === id)?.title ?? id;

export const NAV = [
  { href: '/start-here/', label: 'Start Here', match: ['start-here'] },
  { href: '/section/fundamentals/', label: 'Fundamentals', match: ['fundamentals'] },
  { href: '/section/space-link/', label: 'Space Link', match: ['space-link'] },
  { href: '/section/ground-segment/', label: 'Ground Segment', match: ['ground-segment'] },
  { href: '/section/operations/', label: 'Operations', match: ['operations'] },
  { href: '/section/security-resilience/', label: 'Security & Resilience', match: ['security-resilience'] },
  { href: '/section/data-capacity/', label: 'Data & Capacity', match: ['data-capacity'] },
  { href: '/section/troubleshooting/', label: 'Troubleshooting', match: ['troubleshooting', 'symptoms'] },
  { href: '/labs/', label: 'Labs', match: ['labs'] },
  { href: '/section/reference/', label: 'Reference', match: ['reference', 'glossary', 'standards', 'sources', 'providers'] },
];

export const LEVEL_TEXT: Record<string, string> = { intro: 'Intro', core: 'Core', advanced: 'Advanced' };

export const LABEL_TEXT: Record<string, string> = {
  standard: 'Standard-defined',
  practice: 'Common practice',
  example: 'Illustrative example',
  mission: 'Mission-specific',
};

export const PATH_ORDER = [
  'operator-conversation-fluency',
  'ground-c2-software-engineer',
  'communications-deep-dive',
  'security-aware-operations',
  'fast-reference',
];

export const byTitle = <T extends { data: { title: string } }>(a: T, b: T) => a.data.title.localeCompare(b.data.title);

export async function topicMap() {
  const topics = await getCollection('topics');
  return new Map(topics.map((t) => [t.id, t]));
}

export async function sortedPaths() {
  const paths = await getCollection('paths');
  return paths.sort((a, b) => PATH_ORDER.indexOf(a.id) - PATH_ORDER.indexOf(b.id));
}

export async function sourceMap() {
  const sources = await getCollection('sources');
  return new Map(sources.map((s) => [s.id, s]));
}

export type Topic = CollectionEntry<'topics'>;

export const topicHref = (id: string) => `/topics/${id}/`;
export const labHref = (id: string) => `/labs/${id}/`;
export const symptomHref = (id: string) => `/symptoms/${id}/`;
export const standardHref = (id: string) => `/standards/${id}/`;
export const glossaryHref = (id: string) => `/glossary/#${id}`;
export const pathHref = (id: string) => `/paths/${id}/`;

export const sourceLabel = (s: { data: { doc_number?: string; title: string } }) =>
  s.data.doc_number && s.data.doc_number !== '—' ? s.data.doc_number : s.data.title;

export const minutes = ([a, b]: [number, number]) => (a === b ? `${a} min` : `${a}–${b} min`);

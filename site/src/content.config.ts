import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

// Content lives outside the site in ../content and is validated in full by
// content/tools/validate.py (JSON Schema). These Zod schemas type the fields the
// site reads and let everything else through.

const sourceRef = z.object({ id: z.string(), loc: z.string().optional() });
const label = z.enum(['standard', 'practice', 'example', 'mission']);

const topics = defineCollection({
  loader: glob({ base: '../content/topics', pattern: '**/*.md', generateId: ({ data }) => String(data.id) }),
  schema: z
    .object({
      id: z.string(),
      title: z.string(),
      definition: z.string(),
      section: z.string(),
      subsection: z.string().optional(),
      level: z.enum(['intro', 'core', 'advanced']),
      order: z.number(),
      est_minutes: z.tuple([z.number(), z.number()]),
      prerequisites: z.array(z.string()).default([]),
      learning_paths: z.array(z.string()).default([]),
      objectives: z.array(z.string()),
      chain_position: z.object({
        direction: z.enum(['downlink', 'uplink', 'both']),
        stage: z.string(),
        before: z.string().optional(),
        after: z.string().optional(),
      }),
      glossary_terms: z.array(z.string()).default([]),
      related_topics: z.array(z.string()).default([]),
      related_labs: z.array(z.string()).default([]),
      related_symptoms: z.array(z.string()).default([]),
      standards: z.array(z.string()).default([]),
      tool: z.number().int().min(1).max(9).optional(),
      sources: z.array(sourceRef),
      owner: z.string(),
      reviewer: z.string(),
      last_reviewed: z.coerce.string(),
      next_review: z.coerce.string(),
      status: z.string(),
      open_issues: z.array(z.string()).default([]),
    })
    .loose(),
});

const yamlCollection = <T extends z.ZodRawShape>(dir: string, shape: T) =>
  defineCollection({
    loader: glob({ base: `../content/${dir}`, pattern: '*.yaml' }),
    schema: z.object(shape).loose(),
  });

const glossary = yamlCollection('glossary', {
  id: z.string(),
  term: z.string(),
  expansion: z.string().optional(),
  plain_definition: z.string(),
  precise_meaning: z.string(),
  layer: z.string().optional(),
  aliases: z.array(z.string()).default([]),
  example_usage: z.string().optional(),
  related_terms: z.array(z.string()).default([]),
  topics: z.array(z.string()).default([]),
  label,
  sources: z.array(sourceRef).default([]),
});

const standards = yamlCollection('standards', {
  id: z.string(),
  doc_number: z.string(),
  title: z.string(),
  issue: z.string(),
  book: z.string(),
  published: z.string(),
  corrigenda: z.array(z.object({ name: z.string(), date: z.string(), in_local_library: z.boolean().optional() })).default([]),
  status: z.string(),
  last_checked: z.coerce.string(),
  scope: z.string(),
  services: z.array(z.string()).default([]),
  pdus: z.array(z.string()).default([]),
  mission_must_define: z.array(z.string()).default([]),
  does_not_define: z.array(z.string()).default([]),
  dependencies: z.array(z.string()).default([]),
  related_topics: z.array(z.string()).default([]),
  official_url: z.string(),
  register_id: z.string(),
});

const labs = yamlCollection('labs', {
  id: z.string(),
  title: z.string(),
  tool: z.number(),
  level: z.string(),
  est_minutes: z.tuple([z.number(), z.number()]).optional(),
  objectives: z.array(z.string()),
  prerequisites: z.array(z.string()).default([]),
  fictional_input: z.object({ description: z.string(), data: z.string() }).loose(),
  presets: z.array(z.object({ name: z.string(), settings: z.record(z.string(), z.unknown()) })).default([]),
  break_it: z.array(z.string()).default([]),
  steps: z.array(z.object({ title: z.string(), instruction: z.string(), expected: z.string(), hint: z.string().optional() })),
  expected_result: z.string(),
  explanation: z.string(),
  common_mistakes: z.array(z.string()).default([]),
  reset: z.string(),
  accessibility: z.array(z.string()).default([]),
  sources: z.array(sourceRef).default([]),
});

const symptoms = yamlCollection('symptoms', {
  id: z.string(),
  title: z.string(),
  layer: z.string(),
  observables: z.array(z.string()),
  evidence_to_gather: z.array(z.string()),
  questions_to_ask: z.array(z.string()),
  likely_causes: z.array(z.object({ cause: z.string(), test: z.string(), label })),
  sample_log: z.string().optional(),
  coordinate_with: z.array(z.string()).default([]),
  related_topics: z.array(z.string()).default([]),
  sources: z.array(sourceRef),
});

const paths = yamlCollection('paths', {
  id: z.string(),
  title: z.string(),
  level: z.string(),
  audience: z.string(),
  prerequisites: z.array(z.string()),
  modules: z.array(z.object({ title: z.string(), topics: z.array(z.string()), labs: z.array(z.string()).optional() })),
  est_hours: z.tuple([z.number(), z.number()]),
  milestones: z.array(z.string()),
  outcomes: z.array(z.string()),
});

const cell = z.object({
  state: z.enum(['cited', 'not_public', 'to_research']),
  value: z.string().optional(),
  sources: z.array(sourceRef).optional(),
});
const providers = yamlCollection('providers', {
  id: z.string(),
  name: z.string(),
  note: z.string().optional(),
  last_checked: z.coerce.string(),
  cells: z.record(z.string(), cell),
});

const quizzes = yamlCollection('quizzes', {
  id: z.string(),
  topic: z.string(),
  items: z.array(
    z
      .object({
        id: z.string(),
        type: z.enum(['single-choice', 'multi-choice', 'numeric', 'decode']),
        prompt: z.string(),
        data: z.string().optional(),
        choices: z.array(z.object({ text: z.string(), correct: z.boolean(), feedback: z.string().optional() })).optional(),
        answer: z
          .object({
            value: z.union([z.number(), z.string()]).optional(),
            tolerance: z.number().optional(),
            unit: z.string().optional(),
            fields: z.record(z.string(), z.union([z.number(), z.string()])).optional(),
          })
          .optional(),
        explanation: z.string(),
        label,
        sources: z.array(sourceRef).optional(),
      })
      .loose(),
  ),
});

const sources = defineCollection({
  loader: file('../research/source_register.json', {
    parser: (text) => (JSON.parse(text) as { sources: Array<Record<string, unknown>> }).sources,
  }),
  schema: z
    .object({
      id: z.string(),
      title: z.string(),
      publisher: z.string(),
      doc_number: z.string().optional(),
      date: z.string(),
      url: z.string(),
      source_type: z.string(),
      access_date: z.string(),
      terms: z.string(),
      reliability: z.string(),
      status: z.string(),
      review_due: z.string(),
      notes: z.string().optional(),
    })
    .loose(),
});

export const collections = { topics, glossary, standards, labs, symptoms, paths, providers, quizzes, sources };

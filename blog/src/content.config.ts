/**
 * 콘텐츠 정의
 *  - notes: blog/notes 아래 모든 .md (ComputerScience 저장소에서 자동 복사된 원본 그대로)
 *  - blog : src/content/blog.yaml (블로그 화면 문구)
 */
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { parse as parseYaml } from 'yaml';
import { noteSlug } from './lib/slug';

const notes = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './notes',
    generateId: ({ entry }) => noteSlug(entry),
  }),
  // 원본 노트에는 frontmatter가 없어도 됩니다. 있으면 title 정도만 사용.
  schema: z.looseObject({
    title: z.string().optional(),
  }),
});

const link = z.object({ label: z.string(), href: z.string() });

const blog = defineCollection({
  loader: file('src/content/blog.yaml', { parser: (text) => ({ blog: parseYaml(text) }) }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    brand: z.string(),
    sourceRepo: z.string().url(),
    sourceBranch: z.string().default('main'),
    nav: z.array(link).default([]),
    sidebarLinks: z.array(link).default([]),
    labels: z.object({
      home: z.string(),
      toc: z.string(),
      viewSource: z.string(),
      menu: z.string(),
      notFound: z.string(),
      backHome: z.string(),
    }),
  }),
});

export const collections = { notes, blog };

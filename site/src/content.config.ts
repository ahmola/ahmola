/**
 * 콘텐츠 스키마 정의
 * ---------------------------------------------------------------
 * src/content/ 안의 텍스트 파일이 어떤 모양이어야 하는지 정합니다.
 * 필드를 빠뜨리거나 타입이 틀리면 `npm run dev` / `npm run build` 때
 * 어느 파일의 어느 필드가 문제인지 에러로 알려줍니다.
 *
 * 새 필드를 추가하고 싶다면: 여기 스키마에 먼저 추가 → yaml/md에 값 작성
 * → 컴포넌트에서 사용.
 */
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { parse as parseYaml } from 'yaml';

const link = z.object({
  label: z.string(),
  href: z.string(),
});

/** site.yaml: 사이트 전체에서 쓰는 문구 (메뉴, 섹션 제목, 소개 등) */
const site = defineCollection({
  // site.yaml 파일 하나를 'site'라는 항목 하나로 읽어옵니다.
  loader: file('src/content/site.yaml', {
    parser: (text) => ({ site: parseYaml(text) }),
  }),
  schema: z.object({
    meta: z.object({
      title: z.string(),
      description: z.string(),
      lang: z.string().default('ko'),
    }),
    nav: z.array(link),
    hero: z.object({
      eyebrow: z.string(),
      name: z.string(),
      tagline: z.string(),
      quote: z.string().optional(),
      actions: z.array(link).default([]),
    }),
    about: z.object({
      title: z.string(),
      paragraphs: z.array(z.string()).default([]),
    }),
    stack: z.object({
      title: z.string(),
      description: z.string().optional(),
    }),
    projects: z.object({
      title: z.string(),
      description: z.string().optional(),
      emptyText: z.string(),
      labels: z.object({
        detail: z.string(),
        github: z.string(),
        demo: z.string(),
        back: z.string(),
        period: z.string(),
        role: z.string(),
        stack: z.string(),
      }),
    }),
    contact: z.object({
      title: z.string(),
      description: z.string().optional(),
      links: z.array(link).default([]),
    }),
    footer: z.object({
      text: z.string(),
    }),
    notFound: z.object({
      title: z.string(),
      description: z.string(),
      backLabel: z.string(),
    }),
  }),
});

/** stack.yaml: 기술 스택 카테고리 목록 */
const stack = defineCollection({
  loader: file('src/content/stack.yaml'),
  schema: z.object({
    title: z.string(),
    order: z.number().default(0),
    items: z.array(z.string()).default([]),
  }),
});

/** projects/*.md: 프로젝트 하나 = 마크다운 파일 하나 (파일명이 URL이 됨) */
const projects = defineCollection({
  // 이름이 _ 로 시작하는 파일(_template.md 등)은 무시합니다.
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    period: z.string().optional(),
    role: z.string().optional(),
    stack: z.array(z.string()).default([]),
    github: z.string().url().optional(),
    demo: z.string().url().optional(),
    /** 작을수록 앞에 표시 */
    order: z.number().default(100),
    /** true면 사이트에 표시하지 않음 (작성 중인 글) */
    draft: z.boolean().default(false),
  }),
});

export const collections = { site, stack, projects };

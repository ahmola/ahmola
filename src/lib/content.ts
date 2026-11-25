/**
 * 콘텐츠를 불러오는 함수 모음.
 * 컴포넌트에서는 astro:content 를 직접 쓰지 않고 여기 함수만 사용합니다.
 */
import { getCollection, getEntry } from 'astro:content';

/** site.yaml 전체 */
export async function getSite() {
  const entry = await getEntry('site', 'site');
  if (!entry) throw new Error('src/content/site.yaml 을 찾을 수 없습니다.');
  return entry.data;
}

/** 스택 카테고리 (order 순) */
export async function getStack() {
  const items = await getCollection('stack');
  return items.map((i) => i.data).sort((a, b) => a.order - b.order);
}

/** 공개된 프로젝트 (draft 제외, order 순) */
export async function getProjects() {
  const items = await getCollection('projects', ({ data }) => !data.draft);
  return items.sort((a, b) => a.data.order - b.data.order);
}

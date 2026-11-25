/**
 * 노트 목록 / 사이드바 트리 / 제목 계산
 */
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import sources from '../../sources.json';

export type Note = CollectionEntry<'notes'>;

export interface TreeNode {
  name: string;
  /** 폴더면 undefined */
  note?: Note;
  children: TreeNode[];
  /** 트리 안의 경로 (폴더 열림 판단용) */
  path: string;
}

export async function getBlog() {
  const entry = await getEntry('blog', 'blog');
  if (!entry) throw new Error('src/content/blog.yaml 을 찾을 수 없습니다.');
  return entry.data;
}

/** 원본 저장소 기준 상대 경로 (예: "Backend/Spring/Actuator.md") */
export function sourcePath(note: Note): string {
  return (note.filePath ?? '').replace(/^(\.\/)?notes\//, '');
}

/** 이 노트가 온 원본 저장소 (sources.json 에서 dir 이 가장 길게 일치하는 항목) */
export function sourceOf(note: Note) {
  const p = sourcePath(note);
  return [...sources]
    .sort((a, b) => b.dir.length - a.dir.length)
    .find((s) => s.dir === '' || p === s.dir || p.startsWith(s.dir + '/'))!;
}

/** 원본 저장소에서 이 노트를 보는 GitHub 주소 */
export function sourceUrl(note: Note): string {
  const s = sourceOf(note);
  const p = sourcePath(note);
  const inRepo = s.dir ? p.slice(s.dir.length + 1) : p;
  return `${s.repo}/blob/${s.branch}/${inRepo.split('/').map(encodeURIComponent).join('/')}`;
}

/** 파일명에서 확장자를 뺀 이름 (사이드바 표시용) */
export function fileTitle(note: Note): string {
  const p = sourcePath(note);
  return p.slice(p.lastIndexOf('/') + 1).replace(/\.md$/i, '');
}

export const isHome = (note: Note) => note.id === 'readme';

export async function getNotes() {
  return getCollection('notes');
}

const collator = new Intl.Collator('ko', { numeric: true, sensitivity: 'base' });

/** 폴더 구조 그대로의 트리 */
export function buildTree(notes: Note[]): TreeNode[] {
  const root: TreeNode = { name: '', children: [], path: '' };
  for (const note of notes) {
    if (isHome(note)) continue;
    const parts = sourcePath(note).split('/');
    let cur = root;
    parts.forEach((part, i) => {
      const isFile = i === parts.length - 1;
      const path = parts.slice(0, i + 1).join('/');
      if (isFile) {
        cur.children.push({ name: part.replace(/\.md$/i, ''), note, children: [], path });
      } else {
        let next = cur.children.find((c) => !c.note && c.name === part);
        if (!next) {
          next = { name: part, children: [], path };
          cur.children.push(next);
        }
        cur = next;
      }
    });
  }
  // 폴더 먼저 → 그 폴더의 README → 나머지 파일 (이름순)
  const rank = (n: TreeNode) => (n.note ? (/^readme$/i.test(n.name) ? 1 : 2) : 0);
  const sort = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => rank(a) - rank(b) || collator.compare(a.name, b.name));
    nodes.forEach((n) => sort(n.children));
  };
  sort(root.children);
  return root.children;
}

/**
 * 노트 목록 / 사이드바 트리 / 제목 계산
 */
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

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

/** 폴더 구조 그대로의 트리 (폴더 먼저, 그다음 파일 / 이름순) */
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
  const sort = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => (!!a.note === !!b.note ? collator.compare(a.name, b.name) : a.note ? 1 : -1));
    nodes.forEach((n) => sort(n.children));
  };
  sort(root.children);
  return root.children;
}

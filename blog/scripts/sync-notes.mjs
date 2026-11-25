#!/usr/bin/env node
/**
 * ComputerScience 저장소의 노트를 blog/notes 로 그대로 복사합니다.
 * (파일 내용은 손대지 않고, 블로그에 필요한 파일만 골라 복사)
 *
 * 사용법: node scripts/sync-notes.mjs <ComputerScience 경로> [대상 경로=notes]
 * - ComputerScience 저장소의 GitHub Actions(sync-blog.yml)도 이 스크립트를 사용합니다.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';

const [, , srcArg, destArg = 'notes'] = process.argv;
if (!srcArg) {
  console.error('usage: node scripts/sync-notes.mjs <ComputerScience 경로> [대상 경로]');
  process.exit(1);
}

const src = resolve(srcArg);
const dest = resolve(destArg);

/** 블로그에 포함하지 않을 경로 (저장소 루트 기준) */
const EXCLUDE = [
  '.git',
  '.github',
  '.idea',
  'node_modules',
  'Algorithm/CodingTest', // 코딩테스트 풀이는 GitHub 링크로만 연결
  'AI/홈페이지/coffeeshop', // 실습 프로젝트 코드
];
/** 복사할 확장자: 노트 + 노트에서 참조하는 이미지/문서 */
const INCLUDE_EXT = new Set(['.md', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.pdf']);

const isExcluded = (rel) =>
  EXCLUDE.some((p) => rel === p || rel.startsWith(p + '/')) || rel.split('/').some((s) => s === '.DS_Store');

let count = 0;
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    const rel = relative(src, abs).split(sep).join('/');
    if (isExcluded(rel)) continue;
    if (statSync(abs).isDirectory()) walk(abs);
    else if (INCLUDE_EXT.has(extname(name).toLowerCase())) {
      const out = join(dest, rel);
      mkdirSync(dirname(out), { recursive: true });
      cpSync(abs, out);
      count++;
    }
  }
}

if (!existsSync(src)) {
  console.error(`source not found: ${src}`);
  process.exit(1);
}
rmSync(dest, { recursive: true, force: true }); // 원본에서 지운 파일도 반영되도록 전체 교체
mkdirSync(dest, { recursive: true });
walk(src);
console.log(`synced ${count} files → ${relative(process.cwd(), dest) || dest}`);

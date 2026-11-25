#!/usr/bin/env node
/**
 * 원본 저장소의 노트를 blog/notes 아래로 그대로 복사합니다.
 * (파일 내용은 손대지 않고, 블로그에 필요한 파일만 골라 복사)
 *
 * 사용법: node scripts/sync-notes.mjs <원본 저장소 경로> <대상 경로>
 *   ComputerScience → node scripts/sync-notes.mjs ../ComputerScience notes
 *   REST            → node scripts/sync-notes.mjs ../Architectural-Styles-... notes/REST
 *
 * 어떤 저장소가 notes 의 어느 폴더로 들어가는지, 무엇을 제외할지는 blog/sources.json 에 있습니다.
 * 각 원본 저장소의 GitHub Actions(sync-blog.yml)도 이 스크립트를 사용합니다.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const [, , srcArg, destArg = 'notes'] = process.argv;
if (!srcArg) {
  console.error('usage: node scripts/sync-notes.mjs <원본 저장소 경로> [대상 경로]');
  process.exit(1);
}

const blogDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const notesRoot = join(blogDir, 'notes');
const sources = JSON.parse(readFileSync(join(blogDir, 'sources.json'), 'utf8'));

const src = resolve(srcArg);
const dest = resolve(destArg);
const destDir = relative(notesRoot, dest).split(sep).join('/');
const source = sources.find((s) => s.dir === destDir);
if (!source) {
  console.error(`sources.json 에 dir "${destDir}" 항목이 없습니다.`);
  process.exit(1);
}

/** 항상 제외 + 저장소별 제외 (원본 저장소 루트 기준) */
const EXCLUDE = ['.git', '.github', '.idea', 'node_modules', ...source.exclude];
/** 이 대상 폴더 안에 있지만 다른 저장소가 관리하는 폴더 (지우지 않음). 예: notes/REST */
const KEEP = sources
  .filter((s) => s !== source && s.dir.startsWith(destDir ? destDir + '/' : ''))
  .map((s) => (destDir ? s.dir.slice(destDir.length + 1) : s.dir).split('/')[0]);
/** 복사할 확장자: 노트 + 노트에서 참조하는 이미지/문서 */
const INCLUDE_EXT = new Set(['.md', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.pdf']);

const isExcluded = (rel) =>
  EXCLUDE.some((p) => rel === p || rel.startsWith(p + '/')) || rel.split('/').includes('.DS_Store');

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
// 원본에서 지운 파일도 반영되도록 대상 폴더를 비우고 다시 복사 (KEEP 폴더는 보존)
mkdirSync(dest, { recursive: true });
for (const name of readdirSync(dest)) {
  if (!KEEP.includes(name)) rmSync(join(dest, name), { recursive: true, force: true });
}
walk(src);
console.log(`[${source.name}] synced ${count} files → ${relative(process.cwd(), dest) || dest}`);

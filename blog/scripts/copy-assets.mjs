/**
 * notes/ 안의 이미지·PDF를 public/notes/ 로 복사합니다 (dev/build 직전에 자동 실행).
 * 노트 안의 상대 경로 이미지는 rewrite-links 플러그인이 /blog/notes/... 로 바꿔 연결합니다.
 */
import { cpSync, existsSync, rmSync } from 'node:fs';
import { extname } from 'node:path';

const src = 'notes';
const dest = 'public/notes';
rmSync(dest, { recursive: true, force: true });
if (existsSync(src)) {
  cpSync(src, dest, {
    recursive: true,
    filter: (p) => !extname(p) || extname(p).toLowerCase() !== '.md',
  });
}

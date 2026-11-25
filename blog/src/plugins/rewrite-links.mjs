/**
 * remark 플러그인: 노트 안의 "상대 경로"를 블로그 주소에 맞게 바꿉니다.
 *  - 이미지/파일:  image/a.png       → /blog/notes/<폴더>/image/a.png
 *  - 다른 노트:    ../Spring/Bean.md  → /blog/backend/spring/bean/
 *  - 원본 저장소 링크: https://github.com/ahmola/ComputerScience/blob/main/Planning.md
 *                    → /blog/planning/   (블로그 안의 글로 이동, sources.json 의 모든 저장소 대상)
 * 원본 .md 파일은 건드리지 않고, 화면에 그릴 때만 바뀝니다.
 */
import { visit } from 'unist-util-visit';
import GithubSlugger from 'github-slugger';
import path from 'node:path';

const isRelative = (url) => url && !/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(url);

function slugPath(rel) {
  const slugger = new GithubSlugger();
  return rel
    .replace(/\.md$/i, '')
    .split('/')
    .filter(Boolean)
    .map((seg) => { slugger.reset(); return slugger.slug(seg); })
    .join('/');
}

export default function rewriteLinks({ base = '/', notesDir, sources = [] }) {
  const root = path.resolve(notesDir);
  const prefix = base.endsWith('/') ? base : base + '/';
  // 예) https://github.com/ahmola/ComputerScience/blob/main/<경로>.md → notes/<dir>/<경로>.md
  const repoLinks = sources.map((s) => ({
    dir: s.dir,
    re: new RegExp('^' + s.repo.replace(/\/$/, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '/blob/[^/]+/(.+\\.md)(#.*)?$', 'i'),
  }));

  return (tree, file) => {
    const filePath = file.path ?? file.history?.[0];
    if (!filePath || !path.resolve(filePath).startsWith(root)) return;
    const dir = path.relative(root, path.dirname(path.resolve(filePath))).split(path.sep).join('/');

    const rewrite = (url) => {
      // 원본 저장소의 .md 링크 → 블로그 안의 글 (저장소 루트 기준 경로)
      const hit = url && repoLinks.map((r) => ({ r, m: url.match(r.re) })).find((x) => x.m);
      if (hit) {
        const m = hit.m;
        let rel = m[1];
        try { rel = decodeURIComponent(rel); } catch {}
        if (hit.r.dir) rel = `${hit.r.dir}/${rel}`;
        const slug = slugPath(rel);
        return `${prefix}${slug === 'readme' ? '' : slug + '/'}${m[2] ?? ''}`;
      }
      if (!isRelative(url)) return url;
      const [raw, hash] = url.split('#');
      let decoded = raw;
      try { decoded = decodeURI(raw); } catch {}
      const target = path.posix.normalize(path.posix.join(dir, decoded));
      if (target.startsWith('..')) return url;
      if (/\.md$/i.test(target)) {
        const slug = slugPath(target);
        return `${prefix}${slug === 'readme' ? '' : slug + '/'}${hash ? '#' + hash : ''}`;
      }
      return `${prefix}notes/${target}`;
    };

    visit(tree, (node) => {
      if ((node.type === 'image' || node.type === 'link' || node.type === 'definition') && node.url) {
        node.url = rewrite(node.url);
      } else if (node.type === 'html' && typeof node.value === 'string') {
        node.value = node.value.replace(
          /\b(src|href)(\s*=\s*)(["'])([^"']+)\3/gi,
          (_, attr, eq, q, url) => `${attr}${eq}${q}${rewrite(url)}${q}`,
        );
      }
    });
  };
}

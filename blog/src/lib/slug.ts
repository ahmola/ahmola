import GithubSlugger from 'github-slugger';

/**
 * 노트 경로 → URL 경로
 * 예) "Backend/Spring/Actuator.md" → "backend/spring/actuator"
 *     "Network/TCP와 UDP.md"       → "network/tcp와-udp"
 * 콘텐츠 id 생성(content.config.ts)과 노트 간 링크 변환(rewrite-links) 양쪽에서 같이 씁니다.
 */
export function noteSlug(relPath: string): string {
  const slugger = new GithubSlugger();
  return relPath
    .replace(/\.md$/i, '')
    .split('/')
    .filter(Boolean)
    .map((seg) => {
      slugger.reset();
      return slugger.slug(seg);
    })
    .join('/');
}

/** base('/blog')를 붙인 절대 경로 */
export function withBase(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}

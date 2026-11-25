/** '#about' 같은 섹션 링크를 어느 페이지에서든 홈의 섹션으로 가도록 변환 */
export function resolveHref(href: string) {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  if (href.startsWith('#')) return `${base}${href}`;
  if (href.startsWith('/')) return `${base}${href.slice(1)}`;
  return href;
}

export function isExternal(href: string) {
  return /^https?:\/\//.test(href);
}

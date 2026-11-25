/**
 * 페이지 공통 효과
 *  - [data-reveal]   : 화면에 들어오면 서서히 나타남
 *  - [data-scramble] : 글자가 무작위 문자에서 원래 글자로 디코딩되듯 나타남
 *  - 헤더 메뉴       : 현재 보고 있는 섹션 강조
 * 사용자가 "동작 줄이기"를 켜두면 애니메이션 없이 바로 표시합니다.
 */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const GLYPHS = 'アイウエオカキクケコサシスセソタチツテト0123456789ABCDEF<>/{}=+*';

function scramble(el: HTMLElement) {
  const target = el.dataset.scrambleText ?? el.textContent ?? '';
  el.dataset.scrambleText = target;
  if (reduceMotion) { el.textContent = target; return; }

  const chars = [...target];
  const duration = Math.min(1200, 300 + chars.length * 45);
  const start = performance.now();

  const frame = (now: number) => {
    const progress = Math.min(1, (now - start) / duration);
    const revealed = Math.floor(progress * chars.length);
    el.textContent = chars
      .map((c, i) => (i < revealed || c === ' ' ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
      .join('');
    if (progress < 1) requestAnimationFrame(frame);
    else el.textContent = target;
  };
  requestAnimationFrame(frame);
}

function setupReveal() {
  const items = document.querySelectorAll<HTMLElement>('[data-reveal], [data-scramble]');
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        el.classList.add('is-visible');
        if (el.hasAttribute('data-scramble')) scramble(el);
        io.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
  );
  items.forEach((el) => io.observe(el));
}

function setupActiveNav() {
  const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]')];
  const sections = links
    .map((a) => document.getElementById(a.hash.slice(1)))
    .filter((s): s is HTMLElement => !!s);
  if (!sections.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const id = entry.target.id;
        links.forEach((a) => a.classList.toggle('is-active', a.hash === `#${id}`));
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  sections.forEach((s) => io.observe(s));
}

setupReveal();
setupActiveNav();

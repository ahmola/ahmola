// @ts-check
import { defineConfig } from 'astro/config';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  // 배포 주소. ahmola.github.io 저장소로 옮기면 이대로 사용하면 됩니다.
  site: 'https://ahmola.github.io',
  // 다른 저장소(예: github.com/ahmola/portfolio)에서 Pages로 배포한다면
  // base: '/portfolio' 처럼 저장소 이름을 지정하세요.
});

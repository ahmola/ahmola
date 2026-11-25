# ahmola.github.io

Astro로 만든 포트폴리오 사이트입니다. https://ahmola.github.io

사이트 코드는 전부 `site/` 안에 있고, `main`에 push하면 `.github/workflows/deploy.yml`이 자동 배포합니다.

## 실행

```bash
cd site
npm install
npm run dev      # http://localhost:4321 — 파일 저장하면 바로 반영
npm run build    # dist/ 에 정적 사이트 생성
```

## 디렉터리 구조

```
site/
├─ astro.config.mjs          # 사이트 주소(site), 배포 경로(base)
├─ public/                   # 그대로 복사되는 파일 (favicon, 이미지)
│  └─ images/
└─ src/
   ├─ content/               # ✏️ 텍스트는 전부 여기서 수정
   │  ├─ site.yaml           #   소개, 메뉴, 섹션 제목, 버튼 문구, 연락처
   │  ├─ stack.yaml          #   기술 스택 카테고리
   │  └─ projects/           #   프로젝트 1개 = .md 파일 1개
   │     ├─ _template.md     #   복사용 템플릿 (_로 시작하면 사이트에 안 나옴)
   │     └─ sample-project.md
   ├─ content.config.ts      # 위 텍스트 파일들의 형식(스키마) 정의
   ├─ lib/                   # 콘텐츠 불러오기, URL 헬퍼
   ├─ layouts/               # 페이지 공통 뼈대 (head, 헤더, 푸터)
   ├─ components/
   │  ├─ sections/           # 메인 페이지 섹션 (Hero, About, Stack, Projects, Contact)
   │  └─ *.astro             # 공통 컴포넌트 (Header, Footer, Section, ProjectCard)
   ├─ pages/                 # 파일 경로 = URL
   │  ├─ index.astro         #   / (섹션 순서는 여기서 조정)
   │  ├─ projects/[slug].astro  # /projects/<파일명>/
   │  └─ 404.astro
   └─ styles/global.css      # 색, 폰트, 간격 변수
```

## 자주 하는 수정

| 하고 싶은 것 | 수정할 곳 |
|---|---|
| 소개, 메뉴, 버튼 문구 | `site/src/content/site.yaml` |
| 기술 스택 | `site/src/content/stack.yaml` |
| 프로젝트 추가 | `_template.md` 복사 → `site/src/content/projects/이름.md`, `draft: false` |
| 섹션 순서/삭제 | `site/src/pages/index.astro` |
| 색, 폰트 | `site/src/styles/global.css` 맨 위 `:root` 변수 |
| 새 텍스트 필드 추가 | `content.config.ts` 스키마 → yaml → 컴포넌트 순서로 |

yaml에서 필드를 빠뜨리거나 형식이 틀리면 `npm run dev` 실행 시 어느 파일, 어느 필드인지 에러로 알려줍니다.

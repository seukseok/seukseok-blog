# seukseok의 개인 블로그

Astro 기반 정적(Static-first) 개인 블로그입니다. 한국어 콘텐츠 중심, 카테고리(`tech/review/log`) 구조, SEO 기본요소, Cloudflare Pages 배포를 전제로 설계했습니다.

## 핵심 특징
- 정적 사이트 + 빠른 렌더링
- 사람이 쓰기 쉬운 Markdown + Decap CMS(/admin)

## 로컬 실행
```bash
npm install
npm run dev
```

## 작성 워크플로
### 1) 글 초안 생성
```bash
npm run new:post -- --category=tech --title="새 글 제목"
```

### 2) 콘텐츠 검사
```bash
npm run check:content
```
- 금지어(민감정보 패턴) 검사
- frontmatter `aiSummary` 확인
- 이미지 경로 규칙(`/images/posts/...`) 검사

### 3) 게시 상태 전환
```bash
npm run publish:post -- src/content/posts/2026-02-14-sample.md
```

### 4) 빌드
```bash
npm run build
```

## 이미지 규칙
- 대표 이미지: `/public/images/posts/<slug>/cover.png`
- frontmatter `coverImage`는 `/images/posts/<slug>/cover.png` 형태 사용

## CMS (Decap)
- 접속 경로: `/admin`
- 설정 파일: `public/admin/config.yml`
- GitHub OAuth App/권한 구성 후 웹 UI에서 글 작성 가능

## Cloudflare Pages 배포 가이드
1. GitHub에 새 리포지토리 생성 (예: `seukseok-blog`)
2. 이 프로젝트 push
3. Cloudflare Pages > Create Project > Connect to Git
4. Framework preset: `Astro`
5. Build command: `npm run build`
6. Build output directory: `dist`
7. Environment Variable 필요 시 추가
8. 배포 완료 후 `seukseok.dev` 커스텀 도메인 연결

## seukseok.dev DNS 연결
Cloudflare DNS에서 아래 설정:
- `CNAME` / `@` -> `<project>.pages.dev` (flattening 사용)
- `CNAME` / `www` -> `<project>.pages.dev`

## 자동 배포
- `main` 브랜치 push 시 GitHub Actions에서 `npm run ci` 검사
- Cloudflare Pages Git 연동으로 자동 배포

## 인증/사용자 작업이 필요한 단계
다음은 사용자 인증이 필요하므로 직접 실행해야 합니다.
1. GitHub 리포지토리 생성/권한 부여
2. Cloudflare Pages Git 연결 승인
3. Cloudflare DNS에서 `seukseok.dev` 레코드 추가
4. (선택) Decap CMS용 GitHub OAuth App 설정

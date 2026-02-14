# Setup & Deploy 상세 가이드

## 1. GitHub 새 리포지토리 생성
```bash
cd /home/seukseok/.openclaw/workspace/seukseok-blog
git init
git add .
git commit -m "feat: initialize Astro blog"
# GitHub에서 빈 repo 생성 후
# git remote add origin git@github.com:<YOUR_ID>/seukseok-blog.git
# git push -u origin main
```

## 2. Cloudflare Pages 연결
- Cloudflare Dashboard > Workers & Pages > Create > Pages > Connect to Git
- Repo 선택 후 Build 설정:
  - Build command: `npm run build`
  - Output directory: `dist`
  - Node: 22 권장

## 3. 커스텀 도메인
- Pages 프로젝트 > Custom domains > `seukseok.dev`, `www.seukseok.dev`
- DNS 자동 생성 또는 수동 CNAME 설정

## 4. 확인 체크리스트
- `https://seukseok.dev/sitemap-index.xml` 접근 확인
- `https://seukseok.dev/robots.txt` 접근 확인
- 개별 포스트 소스에서 JSON-LD 스크립트 확인

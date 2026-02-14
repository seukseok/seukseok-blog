---
title: "Cloudflare Pages 배포 트러블슈팅: Workers 화면에 들어갔을 때"
description: "Astro 블로그를 Cloudflare에 올리면서 자주 막히는 포인트(Workers/Pages 경로 혼동, 빌드 설정, GitHub SSH 인증)를 실제 흐름으로 정리"
pubDate: 2026-02-14
category: "tech"
tags: ["Cloudflare Pages", "Astro", "GitHub", "Troubleshooting"]
draft: false
coverImage: "/images/posts/cloudflare-pages-troubleshooting/cover.png"
coverAlt: "Cloudflare Pages 배포 설정 화면"
aiSummary: "Workers 경로로 들어가 Deploy command가 필수로 뜨는 문제를 Pages 경로로 전환해 해결하고, GitHub SSH 인증 후 정상 배포했다."
---

이번 글은 `seukseok.dev`를 실제로 배포하면서 겪은 문제를 기준으로 정리한 기록입니다.
핵심은 단순합니다. **블로그(정적 사이트)는 Workers가 아니라 Pages 플로우로 배포**해야 합니다.

## 문제 1) 배포 화면에서 Deploy command가 필수로 뜸

증상:
- `Deploy command` 입력란이 필수로 표시됨
- `npx wrangler ...` 같은 Workers 배포 형태가 유도됨

원인:
- `Workers & Pages` 메뉴 안에서도 Workers 생성 흐름으로 들어간 상태

해결:
1. 현재 화면에서 뒤로 이동
2. 하단의 `Looking to deploy Pages? Get started` 클릭
3. `Pages -> Continue with GitHub` 경로로 재진입

## 문제 2) Pages 설정값을 무엇으로 넣어야 하나

Astro 기준 최소 정답:

- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: 비움(기본)

참고:
- `Build output directory`를 `/`로 두면 오동작 가능성이 높습니다.
- `Deploy command`는 Pages에서 필요하지 않습니다.

## 문제 3) GitHub push 인증 실패

증상:
- HTTPS push 시 인증 실패 (`could not read Username ...`)

해결(SSH 권장):
1. SSH 키 생성
   ```bash
   ssh-keygen -t ed25519 -C "seukseok@github" -f ~/.ssh/id_ed25519
   ```
2. 공개키 등록 (`~/.ssh/id_ed25519.pub` 내용 전체)
3. 연결 확인
   ```bash
   ssh -T git@github.com
   ```
4. 원격을 SSH로 변경 후 push
   ```bash
   git remote set-url origin git@github.com:seukseok/seukseok-blog.git
   git push -u origin main
   ```

중요:
- GitHub에 넣는 값은 fingerprint(SHA256...)가 아니라 `ssh-ed25519 AAAA...` 형태의 공개키 한 줄입니다.

## 결과

- `seukseok-blog.pages.dev` 배포 성공
- `seukseok.dev` 커스텀 도메인 연결 완료
- 모바일/데스크탑에서 반응형 표시 정상 확인

## 재발 방지 체크리스트

- 시작 경로가 Pages인지 먼저 확인
- Build command/output directory를 템플릿대로 고정
- SSH 인증을 먼저 끝내고 push
- 배포 성공 후 custom domain 연결

이 과정을 한 번 템플릿화해두면, 이후 새 블로그/랜딩 페이지도 거의 같은 방식으로 10~20분 안에 배포할 수 있습니다.

---
title: "Cloudflare Pages 배포 트러블슈팅: Workers 화면에 들어갔을 때"
description: "Astro 블로그 배포 중 Workers/Pages 경로 혼동, 빌드 설정, GitHub SSH 인증 이슈를 실제 해결 흐름으로 정리"
pubDate: 2026-02-14
category: "tech"
tags: ["Cloudflare Pages", "Astro", "GitHub", "Troubleshooting"]
draft: false
coverImage: "/images/posts/cloudflare-pages-troubleshooting/cover.png"
coverAlt: "Cloudflare Pages 배포 설정 화면"
aiSummary: "Workers 경로에서 막히는 문제를 Pages 플로우로 전환해 해결했고, SSH 인증 후 정상 배포를 완료했다."
---

## 한 줄 결론

Cloudflare에 블로그를 올릴 때 `Deploy command`가 필수로 뜨면 거의 100% Workers 화면으로 들어간 상태다.

## 문제와 배경

`seukseok.dev` 블로그를 배포하는 과정에서 설정값을 넣어도 계속 배포가 막혔다. 특히 `Deploy command`를 강제로 요구하는 화면이 반복되어 진행이 안 됐다.

## 원인 분석

원인은 경로 혼동이었다.

- `Workers & Pages` 메뉴에서 **Workers 생성 플로우**로 진입
- 정적 블로그에 맞는 **Pages 배포 플로우**가 아니었음

## 해결 과정

해결 방법은 아래 순서로 정리된다.

1. 현재 화면에서 뒤로 이동
2. 하단 `Looking to deploy Pages? Get started` 클릭
3. `Pages -> Continue with GitHub`로 재진입
4. 빌드 설정 입력
   - Build command: `npm run build`
   - Build output directory: `dist`

## 추가 이슈: GitHub push 인증 실패

HTTPS push 시 인증 오류가 발생했다. 이 부분은 SSH로 전환해 해결했다.

```bash
ssh-keygen -t ed25519 -C "seukseok@github" -f ~/.ssh/id_ed25519
ssh -T git@github.com
git remote set-url origin git@github.com:seukseok/seukseok-blog.git
git push -u origin main
```

주의할 점:
- GitHub에 등록할 값은 fingerprint가 아니라 `id_ed25519.pub`의 `ssh-ed25519 ...` 한 줄 전체다.

## 검증

- `seukseok-blog.pages.dev` 배포 성공
- `seukseok.dev` 도메인 연결 완료
- 모바일/데스크탑 모두 정상 표시 확인

## 요약

같은 문제를 줄이려면 이 네 가지만 먼저 확인하면 된다.

- Pages 경로로 들어갔는지
- Build command가 `npm run build`인지
- Output directory가 `dist`인지
- GitHub 인증을 SSH로 안정화했는지

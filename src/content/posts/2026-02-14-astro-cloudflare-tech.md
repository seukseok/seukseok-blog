---
title: "Astro + Cloudflare Pages로 블로그 시작하기"
description: "정적 우선 아키텍처와 자동 배포로 개인 블로그를 빠르게 운영하는 방법"
pubDate: 2026-02-14
category: "tech"
tags: ["Astro", "Cloudflare", "Static Site"]
draft: false
coverImage: "/images/posts/astro-cloudflare/cover.png"
coverAlt: "Astro와 Cloudflare 로고"
aiSummary: "Astro 정적 빌드와 Cloudflare Pages Git 연동으로 운영 부담이 적은 블로그를 구축했다."
---

개인 블로그를 오래 운영하려면 **작성은 쉬워야 하고, 배포는 자동화**되어야 합니다.

이번 구성의 핵심은 다음 세 가지입니다.

1. Astro 정적 사이트 생성(SSG)
2. GitHub push 기반 Cloudflare Pages 자동 배포
3. SEO 기본요소(캐노니컬, 사이트맵, robots, JSON-LD) 기본 내장

## 왜 Astro를 선택했나

- 콘텐츠 중심 프로젝트에서 구조가 단순함
- 빌드 결과가 작고 빠름
- Markdown + Content Collections 조합이 안정적임

## 운영 루틴

- 글 생성: `npm run new:post -- --category tech --title "제목"`
- 검증: `npm run check:content`
- 배포: `git push origin main`

이렇게 하면 작성자는 글에 집중하고, 플랫폼은 배포를 책임집니다.

---
title: "Astro + Cloudflare Pages로 블로그 시작하기"
description: "정적 우선 아키텍처와 자동 배포를 기준으로 개인 블로그를 빠르게 운영하는 방법"
pubDate: 2026-02-14
category: "tech"
tags: ["Astro", "Cloudflare", "Static Site"]
draft: false
coverImage: "/images/posts/astro-cloudflare/cover.png"
coverAlt: "Astro와 Cloudflare 로고"
aiSummary: "Astro 정적 빌드와 Cloudflare Pages Git 연동으로 운영 부담이 낮은 블로그 구조를 구축했다."
---

## 한 줄 결론

개인 블로그는 정적 생성(SSG) + Git 기반 자동 배포 조합이 가장 운영 효율이 높다.

## 문제와 배경

블로그를 오래 운영하려면 글 작성보다 배포와 유지보수 비용이 낮아야 한다. 수동 배포 구조에서는 글 작성 리듬이 끊기기 쉽다.

## 원인 분석

운영 부담이 커지는 원인은 두 가지다.

- 콘텐츠 작성과 배포가 분리되어 있어 반복 작업이 생김
- SEO 기본 설정이 누락되면 검색 유입이 안정적으로 쌓이지 않음

## 해결 과정

다음 구조로 초기 설정을 고정했다.

1. Astro 기반 정적 사이트 생성
2. GitHub `main` 브랜치 push를 Cloudflare Pages 자동 배포와 연결
3. canonical, sitemap, robots, JSON-LD를 기본 구성에 포함

## 검증

- 작성 루틴: Markdown 글 추가 → commit/push
- 배포 루틴: push 후 Pages 자동 빌드/배포
- 결과: 운영자가 별도 배포 명령 없이 콘텐츠 반영 가능

## 요약

운영 기준은 단순하게 유지하는 것이 좋다.

- 작성: Markdown
- 검증: 콘텐츠 체크 스크립트
- 배포: Git push 자동화

이 구조는 개인 블로그뿐 아니라 기술 문서 사이트로 확장할 때도 동일하게 재사용할 수 있다.

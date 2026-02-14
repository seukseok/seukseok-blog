---
title: "Astro + Cloudflare Pages로 블로그 시작하기"
description: "정적 우선 아키텍처와 자동 배포를 기준으로 개인 블로그를 빠르게 운영한 기록"
pubDate: 2026-02-14
category: "tech"
tags: ["Astro", "Cloudflare", "Static Site"]
draft: false
coverImage: "/images/posts/astro-cloudflare/cover.png"
coverAlt: "Astro와 Cloudflare 로고"
aiSummary: "Astro 정적 빌드와 Cloudflare Pages Git 연동으로 작성과 배포를 단순화했다."
---

## 한 줄 결론

처음 개인 블로그를 만들 때는 Astro + Cloudflare Pages 조합이 가장 빠르고 안정적이었다.

## 문제와 배경

블로그를 오래 운영하려면 글 쓰는 흐름이 끊기지 않아야 한다. 예전에 수동 배포를 쓰면, 글 하나 올릴 때마다 배포 작업이 별도로 필요해서 결국 글을 덜 쓰게 됐다.

## 원인 분석

운영이 귀찮아지는 이유는 명확했다.

- 글 작성과 배포가 분리되어 반복 작업이 생김
- SEO 기본 설정이 빠지면 검색 유입이 잘 안 쌓임

## 해결 과정

이번에는 시작할 때부터 아래 3가지를 고정했다.

1. Astro로 정적 사이트(SSG) 구성
2. GitHub `main` 브랜치 push 시 Cloudflare Pages 자동 배포
3. canonical, sitemap, robots, JSON-LD 기본 포함

## 검증

실제 운영 루틴은 아래처럼 짧다.

- 글 작성: Markdown 파일 추가
- 반영: commit + push
- 배포: Cloudflare Pages가 자동 실행

결과적으로 운영자가 서버 명령을 따로 치지 않아도 글이 바로 반영됐다.

## 요약

개인 블로그는 복잡한 기능보다 운영 단순성이 더 중요했다.

- 작성: Markdown
- 검증: 콘텐츠 체크 스크립트
- 배포: Git push 자동화

이 구조는 학생 개인 블로그뿐 아니라 포트폴리오/문서 사이트로 확장하기도 편하다.

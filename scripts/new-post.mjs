#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [k, ...v] = arg.replace(/^--/, '').split('=');
    return [k, v.join('=') || true];
  }),
);

const title = String(args.title || '').trim();
const category = String(args.category || 'tech');
const validCategories = ['tech', 'review', 'log'];

if (!title) {
  console.error('사용법: npm run new:post -- --category=tech --title="글 제목"');
  process.exit(1);
}
if (!validCategories.includes(category)) {
  console.error(`category는 ${validCategories.join(', ')} 중 하나여야 합니다.`);
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .replace(/[^\w\s-가-힣]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-');

const date = new Date().toISOString().slice(0, 10);
const filename = `${date}-${slug}.md`;
const filePath = path.join(process.cwd(), 'src/content/posts', filename);

if (fs.existsSync(filePath)) {
  console.error(`이미 존재하는 파일입니다: ${filePath}`);
  process.exit(1);
}

const template = `---
title: "${title}"
description: "요약 설명"
pubDate: ${date}
category: "${category}"
tags: []
draft: true
coverImage: "/images/posts/${slug}/cover.png"
coverAlt: "대표 이미지 설명"
aiSummary: ""
---

## 시작

`;

fs.writeFileSync(filePath, template, 'utf8');
console.log(`생성 완료: ${filePath}`);

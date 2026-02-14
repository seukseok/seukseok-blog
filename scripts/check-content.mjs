#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const contentDir = path.join(process.cwd(), 'src/content/posts');
const forbiddenTerms = ['주민등록번호', '비밀번호', 'password=', 'secret_key', 'api_key'];

const files = fs
  .readdirSync(contentDir)
  .filter((f) => f.endsWith('.md'))
  .map((f) => path.join(contentDir, f));

let hasError = false;
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');

  for (const term of forbiddenTerms) {
    if (text.toLowerCase().includes(term.toLowerCase())) {
      console.error(`[금지어] ${file}: ${term}`);
      hasError = true;
    }
  }

  if (!text.includes('aiSummary:')) {
    console.error(`[frontmatter 누락] ${file}: aiSummary`);
    hasError = true;
  }

  const imageMatches = [...text.matchAll(/coverImage:\s*"([^"]+)"/g)];
  if (imageMatches[0] && !imageMatches[0][1].startsWith('/images/posts/')) {
    console.error(`[이미지 경로 규칙 위반] ${file}: ${imageMatches[0][1]}`);
    hasError = true;
  }
}

if (hasError) process.exit(1);
console.log('콘텐츠 검사 통과');

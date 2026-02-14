#!/usr/bin/env node
import fs from 'node:fs';

const target = process.argv[2];
if (!target) {
  console.error('사용법: npm run publish:post -- src/content/posts/파일명.md');
  process.exit(1);
}

if (!fs.existsSync(target)) {
  console.error(`파일을 찾을 수 없습니다: ${target}`);
  process.exit(1);
}

let text = fs.readFileSync(target, 'utf8');
text = text.replace(/draft:\s*true/g, 'draft: false');
if (/updatedDate:\s*$/.test(text)) {
  text = text.replace(/updatedDate:\s*$/m, `updatedDate: ${new Date().toISOString().slice(0, 10)}`);
}
fs.writeFileSync(target, text, 'utf8');
console.log(`게시 상태로 변경 완료: ${target}`);

---
title: "KiCad DRC가 계속 잡아내던 전원선 폭 문제를 net class로 해결"
description: "전원 트레이스 폭/클리어런스 오류를 net class 정책으로 정리한 PCB 작업 메모."
pubDate: 2025-12-14
category: "tech"
tags: ["Electronics", "PCB", "KiCad"]
draft: false
aiSummary: "전원 트레이스 폭/클리어런스 오류를 net class 정책으로 정리한 PCB 작업 메모."
---

보드 수정할 때마다 같은 DRC 경고가 반복됐다. 원인은 사람이 매번 수동으로 폭을 지정해서였다.

해결은 간단했다. 전원망을 net class로 분리해 규칙을 강제했다.

- `PWR_5V`: width 0.8mm
- `PWR_3V3`: width 0.5mm
- signal: width 0.2mm

이렇게 해두니 라우팅 중 실수가 크게 줄었다.

현장에서 자주 놓치는 부분은 커넥터 핀의 thermal relief 설정이다. 전류가 큰 구간은 솔더링성과 발열을 같이 봐야 해서 일괄 규칙이 오히려 독이 될 수 있다. 이 부분은 보드 용도마다 확인이 필요하다.


## 이번 주 기술 이슈 (문제-해결형)
Node.js LTS 라인 업데이트 및 보안 패치 공지가 잦았던 구간

- Node.js blog
  - https://nodejs.org/en/blog
- Node.js releases
  - https://nodejs.org/en/about/previous-releases

런타임 마이너 업데이트는 기능보다 ABI/네이티브 모듈 재빌드 이슈를 먼저 만든다. 그래서 배포 전에 N-API 모듈과 prebuild 바이너리 유무를 확인해야 롤백 비용을 줄일 수 있다. 현업에서는 앱 코드보다 빌드 캐시/아티팩트 호환성이 장애 시간을 좌우하는 경우가 많다.

## 참고
- KiCad 공식 문서 (Net Classes, DRC)
- IPC-2221 개요 (확인 필요: 최종 폭 산정은 온도/구리두께 조건 의존)

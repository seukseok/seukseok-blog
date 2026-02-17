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

## 참고
- KiCad 공식 문서 (Net Classes, DRC)
- IPC-2221 개요 (확인 필요: 최종 폭 산정은 온도/구리두께 조건 의존)

---
title: "Zephyr west 빌드 캐시 꼬임을 빠르게 푸는 루틴"
description: "Zephyr 프로젝트에서 보드 전환 후 발생한 빌드 오류를 pristine build로 해결한 짧은 메모."
pubDate: 2026-01-18
category: "tech"
tags: ["Zephyr", "RTOS", "Embedded", "C"]
draft: false
aiSummary: "Zephyr 프로젝트에서 보드 전환 후 발생한 빌드 오류를 pristine build로 해결한 짧은 메모."
---

Zephyr로 보드를 바꿔가며 테스트하다 보면, 어제는 되던 빌드가 오늘 갑자기 깨질 때가 있다.

대부분은 캐시 꼬임이었다.

```text
CMake Error: The current CMakeCache.txt directory ... is different ...
```

이때는 고민하지 않고 아래 루틴으로 정리했다.

```bash
west build -b nrf52840dk_nrf52840 app --pristine
```

`pristine`을 습관화하면 툴체인 이슈인지 캐시 이슈인지 빠르게 분리된다.

추가로 overlay config를 여러 개 쓸 때 `CONF_FILE` 순서를 고정하지 않으면 런타임 옵션이 뒤집히는 경우가 있다. 이건 CI에서 빌드 커맨드를 고정해두는 게 안전했다.


## 주간 이슈 메모 (짧은 노트형)
Node.js LTS 라인 업데이트 및 보안 패치 공지가 잦았던 구간

- Node.js blog
  - https://nodejs.org/en/blog
- Node.js releases
  - https://nodejs.org/en/about/previous-releases

런타임 마이너 업데이트는 기능보다 ABI/네이티브 모듈 재빌드 이슈를 먼저 만든다. 그래서 배포 전에 N-API 모듈과 prebuild 바이너리 유무를 확인해야 롤백 비용을 줄일 수 있다. 현업에서는 앱 코드보다 빌드 캐시/아티팩트 호환성이 장애 시간을 좌우하는 경우가 많다.

## 참고
- Zephyr west build 문서
- Zephyr Kconfig guide

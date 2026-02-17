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

## 참고
- Zephyr west build 문서
- Zephyr Kconfig guide

---
title: "GCC LTO 켰다가 링크가 깨졌을 때 복구한 방법"
description: "임베디드 펌웨어에서 -flto 도입 후 발생한 linker plugin 에러를 툴체인 정합으로 해결한 사례."
pubDate: 2025-12-28
category: "tech"
tags: ["C", "GCC", "Linker", "Embedded"]
draft: false
aiSummary: "임베디드 펌웨어에서 -flto 도입 후 발생한 linker plugin 에러를 툴체인 정합으로 해결한 사례."
---

코드 크기를 줄이려고 `-flto`를 켰다가 링크가 바로 깨졌다.

```text
lto1: fatal error: bytecode stream generated with LTO version ...
collect2: error: ld returned 1 exit status
```

원인은 단순했다. 오브젝트 일부가 다른 GCC 버전으로 빌드되어 LTO bytecode 버전이 섞였다.

해결 순서:

- 전체 클린 빌드
- 서드파티 static lib도 동일 툴체인으로 재빌드
- `gcc-ar`, `gcc-ranlib` 사용 강제

```make
AR = arm-none-eabi-gcc-ar
RANLIB = arm-none-eabi-gcc-ranlib
```

LTO는 이득이 크지만 툴체인 버전 정합을 못 지키면 바로 발목 잡는다.


## 주간 이슈 메모 (짧은 노트형)
Linux kernel 안정화 릴리즈와 드라이버 수정이 연속 반영된 기간

- Kernel.org releases
  - https://www.kernel.org/
- LWN kernel coverage
  - https://lwn.net/Kernel/

커널/드라이버 계층 이슈는 애플리케이션 로그에서 직접 드러나지 않아 원인 추적이 늦어진다. 그래서 런타임 문제를 볼 때도 dmesg, irq 통계, DMA 에러 카운터를 함께 보아야 한다. 특히 시리얼·네트워크·스토리지처럼 I/O 경계에서 발생하는 지연은 상위 스택 튜닝만으로 해결되지 않는 경우가 많다.

## 참고
- GCC LTO 문서
- GNU ld plugin docs
